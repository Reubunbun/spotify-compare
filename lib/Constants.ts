import { type User } from '@prisma/client';
import { TopItemReturn } from './Spotify';

export const SPOTIFY_CLIENT_ID = '7a6d9d9692ae4420a5a6178cf0d0345e';
export const SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';
export const SPOTIFY_SCOPES = 'user-read-email user-top-read';
export const COOKIE_NAME = 'compare-spoti';
export const COOKIE_EXPIRE_TIME = 14 * 24 * 3600000;
export const QUERY_CODE = 'code';
export const QUERY_ID = 'id';
export const QUERY_TYPE = 'type';
export const QUERY_TIME_FRAME = 'timeframe';

export type UserResponse = Omit<User, 'refreshToken'>;
export type JWTObject = {
    email: string;
    accessToken: string;
    expiresAt: number;
};

export type CompareItem = TopItemReturn & {
    myRank: number;
    theirRank: number;
};

export type CompareResponse = {
    myItems: Array<TopItemReturn>;
    theirItems: Array<TopItemReturn>;
    thierName: string;
    theirImageURL: string | null;
    crossoverItems: Array<CompareItem>;
};
