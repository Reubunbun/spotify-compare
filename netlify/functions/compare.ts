import withPrismaAndAuth from '../../lib/withPrismaAndAuth';
import
    Spotify,
    {
        type TopItemType,
        type TopItemRange,
        type TopItemReturn,
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
            email: true,
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
        where: {
            email: compareUser.email,
        },
        data: {
            refreshToken: theirCredentials.refresh_token,
        },
    });

    const theirTopItems = await Spotify.getTopItems(
        type,
        timerange,
        theirCredentials.access_token,
    );

    const mapIdToItem = new Map<string, CompareItem>();

    for (const [i, myTopItem] of Object.entries(myTopItems)) {
        for (const [j, theirTopItem] of Object.entries(theirTopItems)) {
            if (myTopItem.id === theirTopItem.id) {
                // Using a map to avoid duplicates
                mapIdToItem.set(
                    myTopItem.id,
                    {
                        ...myTopItem,
                        myRank: Number(i) + 1,
                        theirRank: Number(j) + 1,
                    },
                );
            }
        }
    }

    const sortedCrossover = Array.from(mapIdToItem.values())
        .sort((a, b) => (a.myRank + a.theirRank) - (b.myRank + b.theirRank));

    const response: CompareResponse = {
        thierName: compareUser.displayHandle,
        theirImageURL: compareUser.imageURL,
        crossoverItems: sortedCrossover,
        myItems: myTopItems,
        theirItems: theirTopItems,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
});

export { handler };
