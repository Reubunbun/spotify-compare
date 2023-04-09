import axios from 'axios';
import { stringify as stringifyQuery } from 'querystring';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from './Constants';

interface AuthResponse {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

interface Image {
    url: string;
    height: number;
    width: number;
};

interface UserResponse {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string;
        total: number;
    };
    href: string;
    id: string;
    images: Array<Image>;
    product: string;
    type: string;
    uri: string;
}

export default class Spotify {
    public static async login(code: string) : Promise<AuthResponse> {
        const authCode = Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64');

        const { data } = await axios.post<AuthResponse>(
            'https://accounts.spotify.com/api/token',
            stringifyQuery({
                grant_type: 'authorization_code',
                redirect_uri: SPOTIFY_REDIRECT_URI,
                code,
            }),
            {
                headers: {
                    'Authorization': `Basic ${authCode}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            },
        );

        return data;
    }

    public static async getAccessToken(refreshToken: string) : Promise<AuthResponse> {
        const authCode = Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64');

        const { data } = await axios.post<AuthResponse>(
            'https://accounts.spotify.com/api/token',
            stringifyQuery({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Authorization': `Basic ${authCode}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        return data;
    }

    public static async getUserProfile(accessToken: string) : Promise<UserResponse> {
        const { data } = await axios.get<UserResponse>(
            'https://api.spotify.com/v1/me',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return data;
    }
}
