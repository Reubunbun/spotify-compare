import { uuid } from 'uuidv4';
import { serialize as serializeCookie } from 'cookie';
import {
    sign as signToken
} from 'jsonwebtoken';
import Spotify from '../../lib/Spotify';
import {
    type UserResponse,
    type JWTObject,
    COOKIE_NAME,
    COOKIE_EXPIRE_TIME,
    QUERY_CODE,
} from '../../lib/Constants';
import withPrisma from '../../lib/withPrisma';

const handler = withPrisma(async function(
    prismaClient,
    event,
) {
    if (!event.queryStringParameters) {
        return {
            statusCode: 401,
        };
    }

    const { [QUERY_CODE]: code } = event.queryStringParameters;

    if (!code) {
        return {
            statusCode: 401,
        };
    }

    const authResponse = await Spotify.login(code);

    const userResponse = await Spotify.getUserProfile(authResponse.access_token);

    let imageURL : string | null = null;
    const bestImage = userResponse.images.pop();
    if (bestImage) {
        imageURL = bestImage.url;
    }

    const newUser = await prismaClient.user.upsert({
        where: {
            email: userResponse.email,
        },
        update: {
            refreshToken: authResponse.refresh_token,
            displayHandle: userResponse.display_name,
            imageURL,
        },
        create: {
            email: userResponse.email,
            refreshToken: authResponse.refresh_token,
            compareId: uuid(),
            displayHandle: userResponse.display_name,
            imageURL,
        },
    });

    const returnUser: UserResponse = {
        email: newUser.email,
        compareId: newUser.compareId,
        displayHandle: newUser.displayHandle,
        imageURL: newUser.imageURL,
    };

    const objToSign: JWTObject = {
        email: newUser.email,
        accessToken: authResponse.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + authResponse.expires_in,
    };

    const cookie = serializeCookie(
        COOKIE_NAME,
        signToken(JSON.stringify(objToSign), process.env.JWT_SECRET!),
        {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: COOKIE_EXPIRE_TIME,
        },
    );

    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': cookie,
        },
        body: JSON.stringify(returnUser),
    };
});

export { handler };
