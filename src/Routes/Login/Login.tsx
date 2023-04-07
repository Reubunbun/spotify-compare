import type { FC } from 'react';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../../../common/Constants';

const params = new URLSearchParams();
params.append('response_type', 'code');
params.append('client_id', SPOTIFY_CLIENT_ID);
params.append('scope', SPOTIFY_SCOPES);
params.append('redirect_uri', SPOTIFY_REDIRECT_URI);

const queryParams = params.toString();

const Login: FC = () => {
    return <a href={`https://accounts.spotify.com/authorize?${queryParams}`}>Login</a>;
};

export default Login;
