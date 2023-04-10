import {
    type FC,
    useEffect,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';

const Callback: FC = () => {
    const { register, user } = useUserContext();
    const navigate = useNavigate();
    const madeRegisterRequest = useRef<boolean>(false);

    useEffect(() => {
        if (user) {
            return navigate('/home');
        }

        if (madeRegisterRequest.current) {
            return;
        }

        madeRegisterRequest.current = true;
        const params = (new URL(document.location.href)).searchParams;
        const code = params.get('code');
        register(code)
            .then(success => {
                if (!success) {
                    return navigate('/');
                }
            })
            .finally(() => madeRegisterRequest.current = false);
    }, []);

    useEffect(() => {
        if (user) {
            return navigate('/home');
        }
    }, [user]);

    return <div>Logging In...</div>;
};

export default Callback;
