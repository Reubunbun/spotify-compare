import {
    type FC,
    useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../../../common/Constants';

const params = new URLSearchParams();
params.append('response_type', 'code');
params.append('client_id', SPOTIFY_CLIENT_ID);
params.append('scope', SPOTIFY_SCOPES);
params.append('redirect_uri', SPOTIFY_REDIRECT_URI);

const queryParams = params.toString();

const Login: FC = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user]);

    return <a href={`https://accounts.spotify.com/authorize?${queryParams}`}>Login</a>;
};

export default Login;
