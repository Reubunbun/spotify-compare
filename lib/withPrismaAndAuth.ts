import {
    type Handler,
    type HandlerEvent,
    type HandlerResponse,
} from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import {
    verify as verifyToken,
    sign as signToken,
} from 'jsonwebtoken';
import {
    parse as parseCookie,
    serialize as serializeCookie,
} from 'cookie';
import Spotify, { type AuthResponse } from './Spotify';
import {
    type JWTObject,
    COOKIE_NAME,
    COOKIE_EXPIRE_TIME,
} from './Constants';

export default function withPrismaAndAuth(
    handler: (prismaClient: PrismaClient, jwtObject: JWTObject, event: HandlerEvent) => Promise<HandlerResponse>,
) : Handler
{
    return async(event: HandlerEvent) => {
        const cookies = event.headers.cookie;

        if (!cookies) {
            return { statusCode: 401 };
        }

        const parsedCookie = parseCookie(cookies);
        if (!parsedCookie[COOKIE_NAME]) {
            return { statusCode: 401 };
        }

        let jwtObject: JWTObject;
        try {
            jwtObject = verifyToken(
                parsedCookie[COOKIE_NAME],
                process.env.JWT_SECRET!,
            ) as JWTObject;
        } catch (err) {
            console.log('FAILED VERIFY');
            return { statusCode: 401 };
        }

        const prismaClient = new PrismaClient();
        console.log('prisma client created');
        const timeNow = Math.floor(Date.now() / 1000);
        let updateCookie = false;

        const user = await prismaClient.user.findFirst({
            where: { spotifyId: jwtObject.id },
            select: { refreshToken: true },
        });
        if (!user) {
            return { statusCode: 401 };
        }

        // do we need to fetch new credentials because the current access token
        // has expired
        let fetchNewCredentials = timeNow > (jwtObject.expiresAt - 10);

        if (!fetchNewCredentials) {
            // If not check if the current access token is working,
            // another user may have refreshed the token of this user to do a compare
            try {
                await Spotify.getUserProfile(jwtObject.accessToken);
            } catch (err) {
                fetchNewCredentials = true;
            }
        }

        if (fetchNewCredentials) {
            let newCredentials: AuthResponse;
            try {
                newCredentials = await Spotify.getAccessToken(user.refreshToken);
            } catch (err) {
                return { statusCode: 401 };
            }

            await prismaClient.user.update({
                where: { spotifyId: jwtObject.id },
                data: { refreshToken: newCredentials.refresh_token },
            });

            jwtObject = {
                id: jwtObject.id,
                accessToken: newCredentials.access_token,
                expiresAt: Math.floor(Date.now() / 1000) + newCredentials.expires_in,
            };
        }

        return handler(prismaClient, jwtObject, event)
            .then(resp => {
                if (updateCookie) {
                    const cookie = serializeCookie(
                        COOKIE_NAME,
                        signToken(JSON.stringify(jwtObject), process.env.JWT_SECRET!),
                        {
                            secure: true,
                            httpOnly: true,
                            path: '/',
                            maxAge: COOKIE_EXPIRE_TIME,
                        },
                    );
                    resp.headers = resp.headers
                        ? {...resp.headers, 'Set-Cookie': cookie}
                        : { 'Set-Cookie': cookie };
                }
                return resp;
            })
            .catch(err => {
                console.error(err);
                return {
                    statusCode: 500,
                    body: err.message,
                };
            })
            .finally(() => {
                prismaClient.$disconnect();
                console.log('prisma client disconnected');
            });
    };
}
