import {
    type FC,
    useEffect,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';
import useLocalStorage from '../../Hooks/useLocalStorage';
import {
    QUERY_ID,
    QUERY_TYPE,
    QUERY_TIME_FRAME,
    STORAGE_KEY,
    type CompareResponse,
    type CompareQueryStorage,
} from '../../../lib/Constants';

const DEFAULT_TYPE = 'tracks';
const DEFAULT_TIME_FRAME = 'short_term';
const ALLOWED_TIME_FOR_INIT_QUERY = 60 * 2; // Two minutes

const Compare: FC = () => {
    const { user } = useUserContext();
    const location = useLocation();
    const [comparisonId, setComparisonId] = useState<string>('');
    const [results, setResults] = useState<CompareResponse | null>(null);
    const [link, setLink] = useState<string>('');
    const [initialQuery, setInitialQuery] = useLocalStorage<CompareQueryStorage | null>(STORAGE_KEY);

    const makeComparisonRequest = async (comparisonId: string, type: string, timeFrame: string) => {
        const params = new URLSearchParams();
        params.append(QUERY_ID, comparisonId);
        params.append(QUERY_TYPE, type);
        params.append(QUERY_TIME_FRAME, timeFrame);

        const resp = await fetch(`/api/compare?${params.toString()}`);
        if (resp.status !== 200) {
            console.error(`compare failed with status ${resp.status}`);
            return;
        }

        const body = await resp.json();
        console.log('Successfully got response from compare', body);

        setResults(body);
    };

    const handleComparison = async () => {
        if (!comparisonId) {
            return;
        }

        makeComparisonRequest(comparisonId, 'tracks', 'short_term');
    };

    const handleLinkGeneration = () => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams();
        params.append(QUERY_ID, user!.compareId);
        params.append(QUERY_TYPE, DEFAULT_TYPE);
        params.append(QUERY_TIME_FRAME, DEFAULT_TIME_FRAME);

        setLink(`${url.origin}${url.pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const queryComparisonId = queryParams.get(QUERY_ID);
        const queryType = queryParams.get(QUERY_TYPE);
        const queryTimeFrame = queryParams.get(QUERY_TIME_FRAME);

        const url = new URL(window.location.href);
        const newUrl = `${url.origin}${url.pathname}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        if (!queryComparisonId) {

            if (
                initialQuery &&
                Math.floor(Date.now() / 1000) < (initialQuery.timeOfStorage + ALLOWED_TIME_FOR_INIT_QUERY)
            ) {
                makeComparisonRequest(
                    initialQuery.compareId,
                    initialQuery.compareType || DEFAULT_TYPE,
                    initialQuery.compareTimeFrame || DEFAULT_TIME_FRAME,
                );
            }

            setInitialQuery(null);
            return;
        }

        makeComparisonRequest(
            queryComparisonId,
            queryType || DEFAULT_TYPE,
            queryTimeFrame || DEFAULT_TIME_FRAME
        );
    }, []);

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
            <button type='button' onClick={handleLinkGeneration}>
                Generate Link
            </button>
            <p>Link: {link}</p>
            <pre>{JSON.stringify(results,null,2)}</pre>
        </>
    );
};

export default Compare;
