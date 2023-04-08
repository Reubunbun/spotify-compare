import { Handler, type HandlerEvent, type HandlerResponse } from '@netlify/functions';
import { stringify as stringifyQuery } from 'querystring';
import { PrismaClient } from '@prisma/client';
import { uuid } from 'uuidv4';
import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '../../common/Constants';

const handler: Handler = async (event: HandlerEvent) => {
    const prismaClient = new PrismaClient();

    try {
        return await main(event, prismaClient);
    } catch (err) {
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

    const { data: authResponse } = await axios.post(
        'https://accounts.spotify.com/api/token',
        stringifyQuery({
            grant_type: 'authorization_code',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code,
        }),
        {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        },
    );

    const { data: userResponse } = await axios.get(
        'https://api.spotify.com/v1/me',
        {
            headers: {
                'Authorization': `Bearer ${authResponse.access_token}`,
                'Content-Type': 'application/json',
            },
        },
    );

    let imageURL = null;
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

    return {
        statusCode: 200,
        body: JSON.stringify(newUser),
    };
}

export { handler };
