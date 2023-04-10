import {
    type FC,
    useEffect,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../../../lib/Constants';

const params = new URLSearchParams();
params.append('response_type', 'code');
params.append('client_id', SPOTIFY_CLIENT_ID);
params.append('scope', SPOTIFY_SCOPES);
params.append('redirect_uri', SPOTIFY_REDIRECT_URI);

const queryParams = params.toString();

const Login: FC = () => {
    const { user, login } = useUserContext();
    const navigate = useNavigate();
    const madeLoginRequest = useRef<boolean>(false);

    const clickLogin = async () => {
        if (user) {
            navigate('/home');
        }

        if (madeLoginRequest.current) {
            return;
        }

        madeLoginRequest.current = true;
        const success = await login();
        console.log('success in login?', success);
        madeLoginRequest.current = false;

        if (!success) {
            window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user]);

    return <button type='button' onClick={clickLogin}>Login</button>;
};

export default Login;
