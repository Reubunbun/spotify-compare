import {
    type FC,
    useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';

const Callback: FC = () => {
    const { login, user } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        const params = (new URL(document.location.href)).searchParams;
        const code = params.get('code');
        login(code);
    }, []);

    useEffect(() => {
        if (user) {
            return navigate('/home');
        }
    }, [user]);

    return <div>Logging In...</div>;
};

export default Callback;
