import { type User } from '@prisma/client';

export const SPOTIFY_CLIENT_ID = '7a6d9d9692ae4420a5a6178cf0d0345e';
export const SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';
export const SPOTIFY_SCOPES = 'user-read-email user-top-read';
export const STORAGE_KEY = 'compare-spoti-storage';
export const COOKIE_NAME = 'compare-spoti';

export type UserResponse = Omit<User, 'refreshToken'>;
export type JWTObject = {
    email: string;
    accessToken: string;
    expiresAt: number;
};
