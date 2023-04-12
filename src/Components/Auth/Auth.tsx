import {
    type FC,
    type ReactNode,
    useEffect,
    useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLocalStorage from '../../Hooks/useLocalStorage';
import { useUserContext } from '../../Context/UserContext';
import getSpotifyURL from '../../Helpers/GetSpotifyURL';
import {
    type CompareQueryStorage,
    QUERY_ID,
    STORAGE_KEY,
    QUERY_CODE,
    QUERY_TIME_FRAME,
} from '../../../lib/Constants';

interface Props {
    children: ReactNode;
};

const Auth: FC<Props> = ({ children }) => {
    const { user, login } = useUserContext();
    const [, setCompareQuery] = useLocalStorage<CompareQueryStorage | null>(STORAGE_KEY);
    const madeRequest = useRef<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user || madeRequest.current) {
            return;
        }

        madeRequest.current = true;
        login().then(success => {
            madeRequest.current = false;
            if (!success) {
                const queryParams = new URLSearchParams(location.search);
                const queryId = queryParams.get(QUERY_ID);
                if (queryId) {
                    // Someone has shared a link but the recipient hasnt signed
                    // in via spotify yet
                    setCompareQuery({
                        timeOfStorage: Math.floor(Date.now() / 1000),
                        compareId: queryId,
                        compareType: queryParams.get(QUERY_CODE) || null,
                        compareTimeFrame: queryParams.get(QUERY_TIME_FRAME) || null,
                    });
                    window.location.href = getSpotifyURL();
                    return;
                }

                return navigate('/');
            }
        });
    }, [user]);

    return (
        <>
            {
                user
                    ? children
                    : <div>Logging in...</div>
            }
        </>
    );
};

export default Auth;
