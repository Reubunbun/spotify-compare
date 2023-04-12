import {
    type FC,
    useEffect,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';
import getSpotifyURL from '../../Helpers/GetSpotifyURL';

const Login: FC = () => {
    const { user, login } = useUserContext();
    const navigate = useNavigate();
    const madeLoginRequest = useRef<boolean>(false);

    const clickLogin = async () => {
        if (user) {
            navigate('/compare');
        }

        if (madeLoginRequest.current) {
            return;
        }

        madeLoginRequest.current = true;
        const success = await login();
        console.log('success in login?', success);
        madeLoginRequest.current = false;

        if (!success) {
            window.location.href = getSpotifyURL();
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/compare');
        }
    }, [user]);

    return <button type='button' onClick={clickLogin}>Login</button>;
};

export default Login;
