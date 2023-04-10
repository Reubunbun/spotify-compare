import withPrismaAndAuth from '../../lib/withPrismaAndAuth';
import Spotify from '../../lib/Spotify';

const handler = withPrismaAndAuth(async function(
    prismaClient,
    jwtObject,
    event,
) {
    const user = await Spotify.getUserProfile(jwtObject.accessToken);

    let imageURL : string | null = null;
    const bestImage = user.images.pop();
    if (bestImage) {
        imageURL = bestImage.url;
    }

    const updatedUser = await prismaClient.user.update({
        where: { email: jwtObject.email },
        data: {
            displayHandle: user.display_name,
            imageURL,
        },
    });

    return {
        statusCode: 200,
        body: JSON.stringify(updatedUser),
    };
});

export { handler };
