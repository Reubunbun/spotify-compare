import {
    type FC,
    useEffect,
} from 'react';
import { useUserContext } from '../../Context/UserContext';

const Callback: FC = () => {
    const { login } = useUserContext();

    useEffect(() => {
        const params = (new URL(document.location.href)).searchParams;
        const code = params.get('code');
        login(code);
    }, []);

    return <div>Logging In...</div>;
};

export default Callback;
