import {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_REDIRECT_URI,
    SPOTIFY_SCOPES,
} from '../../lib/Constants';

export default function getSpotifyURL() {
    const spotifyParams = new URLSearchParams();
    spotifyParams.append('response_type', 'code');
    spotifyParams.append('client_id', SPOTIFY_CLIENT_ID);
    spotifyParams.append('scope', SPOTIFY_SCOPES);
    spotifyParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    return `https://accounts.spotify.com/authorize?${spotifyParams.toString()}`;
};
