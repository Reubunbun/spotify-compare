import withPrismaAndAuth from '../../lib/withPrismaAndAuth';
import Spotify from '../../lib/Spotify';
import { type UserResponse } from '../../lib/Constants';

const handler = withPrismaAndAuth(async function(
    prismaClient,
    jwtObject,
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

    const returnUser: UserResponse = {
        email: updatedUser.email,
        compareId: updatedUser.compareId,
        displayHandle: updatedUser.displayHandle,
        imageURL: updatedUser.imageURL,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(returnUser),
    };
});

export { handler };
