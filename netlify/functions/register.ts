import { Handler, type HandlerEvent, type HandlerResponse } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import { uuid } from 'uuidv4';
import { serialize as serializeCookie } from 'cookie';
import jwt from 'jsonwebtoken';
import Spotify from '../../common/Spotify';
import {
    type UserResponse,
    type JWTObject,
    COOKIE_NAME,
} from '../../common/Constants';

const handler: Handler = async (event: HandlerEvent) => {
    const prismaClient = new PrismaClient();

    try {
        return await main(event, prismaClient);
    } catch (err) {
        console.error(err);
        console.error(err.message);
        return {
            statusCode: 500,
            body: err.message,
        };
    } finally {
        await prismaClient.$disconnect();
    }
};

async function main(event: HandlerEvent, prismaClient: PrismaClient) : Promise<HandlerResponse> {
    if (!event.queryStringParameters) {
        return {
            statusCode: 401,
        };
    }

    const { code } = event.queryStringParameters;

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

    const newUser = await prismaClient.user.create({
        data: {
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

    const hour = 3600000
    const twoWeeks = 14 * 24 * hour
    const cookie = serializeCookie(
        COOKIE_NAME,
        jwt.sign(JSON.stringify(objToSign), process.env.JWT_SECRET!),
        {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: twoWeeks,
        },
    );

    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': cookie,
        },
        body: JSON.stringify(returnUser),
    };
}

export { handler };
