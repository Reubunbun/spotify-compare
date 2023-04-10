import {
    type FC,
    useEffect,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';
import { type TopItemReturn } from '../../../lib/Spotify';
import {
    QUERY_ID,
    QUERY_TYPE,
    QUERY_TIME_FRAME,
    type CompareResponse
} from '../../../lib/Constants';

const Home: FC = () => {
    const { user } = useUserContext();
    const [comparisonId, setComparisonId] = useState<string>('');
    const [results, setResults] = useState<CompareResponse | null>(null);
    const navigate = useNavigate();

    const handleComparison = async () => {
        if (!comparisonId) {
            return;
        }

        const params = new URLSearchParams();
        params.append(QUERY_ID, comparisonId);
        params.append(QUERY_TYPE, 'tracks');
        params.append(QUERY_TIME_FRAME, 'long_term');

        const resp = await fetch(`/api/compare?${params.toString()}`);
        if (resp.status !== 200) {
            console.error(`compare failed with status ${resp.status}`);
        }

        const body = await resp.json();
        console.log('Successfully got response from compare', body);

        setResults(body);
    };

    useEffect(() => {
        if (!user) {
            return navigate('/');
        }
    }, [user]);

    return (
        <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <input
                type='text'
                value={comparisonId}
                onChange={e => setComparisonId(e.target.value)}
            />
            <button type='button' onClick={handleComparison}>
                Make comparison
            </button>
            <pre>{JSON.stringify(results,null,2)}</pre>
        </>
    );
};

export default Home;
