import withPrismaAndAuth from '../../lib/withPrismaAndAuth';
import
    Spotify,
    {
        type TopItemType,
        type TopItemRange,
        TopItemReturn,
    }
from '../../lib/Spotify';
import {
    QUERY_ID,
    QUERY_TYPE,
    QUERY_TIME_FRAME,
    type CompareResponse,
    type CompareItem,
} from '../../lib/Constants';

const TYPE_TRACK: TopItemType = 'tracks';
const TYPE_ARTIST: TopItemType = 'artists';
const RANGE_SHORT: TopItemRange = 'short_term';
const RANGE_MEDIUM: TopItemRange = 'medium_term';
const RANGE_LONG: TopItemRange = 'long_term';

const handler = withPrismaAndAuth(async function(
    prismaClient,
    jwtObject,
    event,
) {
    if (!event.queryStringParameters) {
        return { statusCode: 400 };
    }

    const {
        [QUERY_ID]: theirCompareId,
        [QUERY_TYPE]: type,
        [QUERY_TIME_FRAME]: timerange
    } = event.queryStringParameters;

    if (!theirCompareId) {
        return { statusCode: 400, body: 'Missing compare id' };
    }

    if (
        !type ||
        (
            type !== TYPE_TRACK &&
            type !== TYPE_ARTIST
        )
    ) {
        return { statusCode: 400, body: 'Missing or invalid type' };
    }

    if (
        !timerange ||
        (
            timerange !== RANGE_SHORT &&
            timerange !== RANGE_MEDIUM &&
            timerange !== RANGE_LONG
        )
    ) {
        return { statusCode: 400, body: 'Missing or invalid timerange' };
    }

    const compareUser = await prismaClient.user.findFirst({
        where: { compareId: theirCompareId },
        select: {
            spotifyId: true,
            refreshToken: true,
            displayHandle: true,
            imageURL: true,
        },
    });

    if (!compareUser) {
        return { statusCode: 404, body: 'Cannot find compare user' };
    }

    const myTopItems = await Spotify.getTopItems(
        type,
        timerange,
        jwtObject.accessToken,
    );

    const theirCredentials = await Spotify.getAccessToken(compareUser.refreshToken);

    await prismaClient.user.update({
        where: { spotifyId: compareUser.spotifyId },
        data: { refreshToken: theirCredentials.refresh_token },
    });

    const theirTopItems = await Spotify.getTopItems(
        type,
        timerange,
        theirCredentials.access_token,
    );

    const maxItems = Math.max(myTopItems.length, theirTopItems.length);

    const mapIdToCrossover = new Map<string, CompareItem>();

    for (const [i, myTopItem] of Object.entries(myTopItems)) {
        for (const [j, theirTopItem] of Object.entries(theirTopItems)) {
            if (myTopItem.id === theirTopItem.id) {
                mapIdToCrossover.set(
                    myTopItem.id,
                    {
                        ...myTopItem,
                        myRank: Number(i) + 1,
                        theirRank: Number(j) + 1,
                    },
                );
                break;
            }
        }
    }

    const myItemsExclusive = myTopItems.filter(item => !mapIdToCrossover.has(item.id));
    const theirItemsExclusive = theirTopItems.filter(item => !mapIdToCrossover.has(item.id));

    const sortedCrossover = Array.from(mapIdToCrossover.values())
        .sort((a, b) => (a.myRank + a.theirRank) - (b.myRank + b.theirRank));

    const percentMatch = +((sortedCrossover.length / maxItems) * 100).toFixed(2);

    const response: CompareResponse = {
        type: type,
        range: timerange,
        thierName: compareUser.displayHandle,
        theirImageURL: compareUser.imageURL,
        crossoverItems: sortedCrossover,
        myItems: myItemsExclusive,
        theirItems: theirItemsExclusive,
        percentMatch,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
});

export { handler };
