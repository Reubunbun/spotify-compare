import axios from 'axios';
import { stringify as stringifyQuery } from 'querystring';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from './Constants';

export type TopItemRange = 'short_term' | 'medium_term' | 'long_term';
export type TopItemType = 'tracks' | 'artists';

interface TopItemResponse {
    href: string;
    limit: number;
    next: string;
    offset: 0;
    previous: string;
    total: number;
    items: Array<Track | Artist>;
}

export interface TopItemReturn {
    id: string;
    name: string;
    imageURL: string | null;
    href: string;
};

export interface AuthResponse {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

interface Artist {
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<Image>;
    name: string;
    popularity: number;
    type: 'artist';
    uri: string
};

interface Album {
    album_type: string;
    total_tracks: number;
    available_markets: Array<string>;
    href: string;
    id: string;
    images: Array<Image>;
    name: string,
    release_date: string;
    release_date_precision: string;
    type: 'album';
    uri: string;
    genres: Array<string>;
    label: string;
    popularity: number;
    album_group: string;
    artists: Array<Artist>;
};

interface Track {
    album: Album;
    artists: Array<Artist>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    href: string;
    id: string;
    is_playable: boolean;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: 'track';
    uri: string;
    is_local: boolean;
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

    public static async getTopItems(
        itemType: TopItemType,
        timeRange: TopItemRange,
        accessToken: string,
    ) : Promise<Array<TopItemReturn>>
    {
        const { data } = await axios.get<TopItemResponse>(
            `https://api.spotify.com/v1/me/top/${itemType}?time_range=${timeRange}&limit=${50}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return data.items.map(artistOrTrack => {
            let imageURL : string | null = null;

            if (artistOrTrack.type === 'artist') {
                const bestImage = artistOrTrack.images.pop();
                if (bestImage) {
                    imageURL = bestImage.url;
                }
            }

            if (artistOrTrack.type === 'track') {
                const bestImage = artistOrTrack.album.images.pop();
                if (bestImage) {
                    imageURL = bestImage.url;
                }
            }

            return {
                id: artistOrTrack.id,
                href: artistOrTrack.href,
                name: artistOrTrack.name,
                imageURL,
            };
        })
    }
}
