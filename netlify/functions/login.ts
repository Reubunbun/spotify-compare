import { Handler, type HandlerEvent, type HandlerResponse } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import {
    parse as parseCookie,
    serialize as serializeCookie,
} from 'cookie';
import jwt from 'jsonwebtoken';
import Spotify from '../../common/Spotify';
import {
    type JWTObject,
    type UserResponse,
    COOKIE_NAME,
} from '../../common/Constants';

const handler: Handler = async (event: HandlerEvent) : Promise<HandlerResponse> => {
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
    const cookies = event.headers.Cookie;
    if (!cookies) {
        return {
            statusCode: 401,
        };
    }

    const parsedCookie = parseCookie(cookies);
    if (!parseCookie[COOKIE_NAME]) {
        return {
            statusCode: 401,
        };
    }

    const jwtObject = jwt.verify(
        parsedCookie[COOKIE_NAME],
        process.env.JWT_SECRET!,
    ) as JWTObject;

    const timeNow = Math.floor(Date.now() / 1000);
    if (timeNow > (jwtObject.expiresAt - 10)) {
        const user = await prismaClient.user.findFirst({
            where: {
                email: jwtObject.email,
            },
            select: {
                refreshToken: true,
            },
        });
        if (!user) {
            return {
                statusCode: 401,
            };
        }

        const newCredentials = await Spotify.getAccessToken(user.refreshToken);

        jwtObject.accessToken = newCredentials.access_token;
        jwtObject.expiresAt = Math.floor(Date.now() / 1000) + newCredentials.expires_in;
    }

    const updatedUser = await Spotify.getUserProfile(jwtObject.accessToken);
    let imageURL : string | null = null;
    const bestImage = updatedUser.images.pop();
    if (bestImage) {
        imageURL = bestImage.url;
    }

    await prismaClient.user.update({
        data: {
            imageURL,
            displayHandle: updatedUser.display_name,
        },
        where: {
            email: jwtObject.email,
        },
    });

    const newToken = jwt.sign(
        JSON.stringify(jwtObject),
        process.env.JWT_SECRET!
    );

    const hour = 3600000
    const twoWeeks = 14 * 24 * hour
    const cookie = serializeCookie(
        COOKIE_NAME,
        newToken,
        {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: twoWeeks,
        },
    );
}

export { handler };
