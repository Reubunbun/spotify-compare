import { Handler, HandlerEvent } from '@netlify/functions';
import { stringify as stringifyQuery } from 'querystring';
import axios from 'axios';

const handler: Handler = async(event: HandlerEvent) => {
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

    const { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        stringifyQuery({
            grant_type: 'authorization_code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            code,
        }),
        {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        },
    );

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
};

export { handler };
