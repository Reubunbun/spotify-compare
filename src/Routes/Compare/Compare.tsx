import {
    type FC,
    useEffect,
    useState,
    Fragment,
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
import { type TopItemRange, type TopItemType } from '../../../lib/Spotify';
import CommonResult from './Components/CommonResult/CommonResult';
import ExclusiveResult from './Components/ExclusiveResult/ExclusiveResult';
import styles from './Compare.module.css';

const DEFAULT_TYPE: TopItemType = 'tracks';
const DEFAULT_TIME_FRAME: TopItemRange = 'short_term';
const DEFAULT_IMG = '/default.png';
const ALLOWED_TIME_FOR_INIT_QUERY = 60 * 2; // Two minutes
const TYPE_TO_DISPLAY: {[key in TopItemType]: string} = {
    'tracks': 'Tracks',
    'artists': 'Artists',
};
const RANGE_TO_DISPLAY: {[key in TopItemRange]: string} = {
    'short_term': 'Short Term',
    'medium_term': 'Medium Term',
    'long_term': 'Long Term',
};

const Compare: FC = () => {
    const { user } = useUserContext();
    const location = useLocation();
    const [initialQuery, setInitialQuery] = useLocalStorage<CompareQueryStorage | null>(STORAGE_KEY);
    const [comparisonId, setComparisonId] = useState<string>('');
    const [results, setResults] = useState<CompareResponse | null>(null);
    const [compareType, setCompareType] = useState<TopItemType>(() => {
        if (initialQuery && initialQuery.compareType) {
            return initialQuery.compareType;
        }
        return DEFAULT_TYPE;
    });
    const [compareTimeFrame, setCompareTimeFrame] = useState<TopItemRange>(() => {
        if (initialQuery && initialQuery.compareTimeFrame) {
            return initialQuery.compareTimeFrame;
        }
        return DEFAULT_TIME_FRAME;
    });

    const makeComparisonRequest = async (
        comparisonId: string,
        overrideType?: TopItemType | null,
        overrideRange?: TopItemRange | null,
    ) => {
        const params = new URLSearchParams();
        params.append(QUERY_ID, comparisonId);
        params.append(QUERY_TYPE, overrideType || compareType);
        params.append(QUERY_TIME_FRAME, overrideRange || compareTimeFrame);

        const resp = await fetch(`/api/compare?${params.toString()}`);
        if (resp.status !== 200) {
            console.error(`compare failed with status ${resp.status}`);
            return;
        }

        const body = await resp.json() as CompareResponse;
        console.log('Successfully got response from compare', body);

        setResults(body);
    };

    const handleComparison = async () => {
        if (!comparisonId) {
            return;
        }

        makeComparisonRequest(comparisonId);
    };

    const handleCopyLink = () => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams();
        params.append(QUERY_ID, user!.compareId);
        params.append(QUERY_TYPE, compareType);
        params.append(QUERY_TIME_FRAME, compareTimeFrame);

        navigator.clipboard.writeText(`${url.origin}${url.pathname}?${params.toString()}`);

        window.alert('Copied to clipboard!');
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const queryComparisonId = queryParams.get(QUERY_ID);

        const url = new URL(window.location.href);
        const newUrl = `${url.origin}${url.pathname}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        if (!queryComparisonId) {
            if (
                initialQuery &&
                Math.floor(Date.now() / 1000) < (initialQuery.timeOfStorage + ALLOWED_TIME_FOR_INIT_QUERY)
            ) {
                setComparisonId(initialQuery.compareId);
                if (initialQuery.compareType) {
                    setCompareType(initialQuery.compareType);
                }
                if (initialQuery.compareTimeFrame) {
                    setCompareTimeFrame(initialQuery.compareTimeFrame);
                }
                makeComparisonRequest(
                    initialQuery.compareId,
                    initialQuery.compareType,
                    initialQuery.compareTimeFrame,
                );
            }

            setInitialQuery(null);
            return;
        }

        setComparisonId(queryComparisonId);

        const typeFromQuery = queryParams.get(QUERY_TYPE) as TopItemType;
        if (typeFromQuery) {
            setCompareType(typeFromQuery);
        }

        const rangeFromQuery = queryParams.get(QUERY_TIME_FRAME) as TopItemRange;
        if (rangeFromQuery) {
            setCompareTimeFrame(rangeFromQuery);
        }

        makeComparisonRequest(
            queryComparisonId,
            typeFromQuery,
            rangeFromQuery,
        );
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContainer}>
                <div className={styles.titleContainer}>
                    <div>
                        <h1>COMPARIFY</h1>
                        <div className={styles.containerIDs}>
                            <div className={styles.containerIDLabels}>
                                <p><b>Your Id:</b></p>
                                <p><b>Comparing With:</b></p>
                            </div>
                            <div className={styles.containerIDValues}>
                                <p><small>{user?.compareId}</small></p>
                                <input
                                    type='text'
                                    onChange={e => setComparisonId(e.target.value)}
                                    value={comparisonId}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.containerOptions}>
                    <div className={styles.containerCompareType}>
                        <button
                            type='button'
                            className={compareType === 'tracks' ? styles.selected : ''}
                            onClick={() => setCompareType('tracks')}
                        >
                            Tracks
                        </button>
                        <button
                            type='button'
                            className={compareType === 'artists' ? styles.selected : ''}
                            onClick={() => setCompareType('artists')}
                        >
                            Artists
                        </button>
                    </div>
                    <div className={styles.containerCompareTimeFrame}>
                        <button
                            type='button'
                            className={compareTimeFrame === 'short_term' ? styles.selected : ''}
                            onClick={() => setCompareTimeFrame('short_term')}
                        >
                            Short Term
                        </button>
                        <button
                            type='button'
                            className={compareTimeFrame === 'medium_term' ? styles.selected : ''}
                            onClick={() => setCompareTimeFrame('medium_term')}
                        >
                            Medium Term
                        </button>
                        <button
                            type='button'
                            className={compareTimeFrame === 'long_term' ? styles.selected : ''}
                            onClick={() => setCompareTimeFrame('long_term')}
                        >
                            Long Term
                        </button>
                    </div>
                    <div className={styles.containerCopy}>
                        <p className={styles.copyLink}>
                            <span onClick={handleCopyLink}>Click to generate your link!</span>
                        </p>
                    </div>
                </div>
                <div className={styles.containerStart}>
                    <div>
                        <button type='button' onClick={handleComparison}>
                            Start!
                        </button>
                    </div>
                </div>
                {results ?
                    <div className={styles.containerResults}>
                        <h2>You + {results.thierName}</h2>
                        <div className={styles.containerResultImages}>
                            <div>
                                <img
                                    src={user?.imageURL || DEFAULT_IMG}
                                    style={{
                                        left: `${results.percentMatch / 4}%`,
                                        opacity: `${1 - ((results.percentMatch / 100) * 0.25)}`
                                    }}
                                />
                                <img
                                    src={results.theirImageURL || DEFAULT_IMG}
                                    style={{
                                        right: `${results.percentMatch / 4}%`,
                                        opacity: `${1 - ((results.percentMatch / 100) * 0.8)}`
                                    }}
                                />
                            </div>
                        </div>
                        <p>{results.percentMatch}% Match For {RANGE_TO_DISPLAY[results.range]} {TYPE_TO_DISPLAY[results.type]}</p>
                        <div className={styles.containerCommon}>
                            {results.crossoverItems.length ?
                                <>
                                    <h3>{TYPE_TO_DISPLAY[results.type]} In Common</h3>
                                    {results.crossoverItems.map(o =>
                                        <Fragment key={o.id}>
                                            <CommonResult {...o}/>
                                        </Fragment>
                                    )}
                                </> :
                                <h3>No {TYPE_TO_DISPLAY[results.type]} In Common</h3>
                            }
                        </div>
                        <div className={styles.containerExclusive}>
                            <div className={styles.containerYours}>
                                <h3>Exclusive To You:</h3>
                                {results.myItems.map(o =>
                                    <Fragment key={o.id}>
                                        <ExclusiveResult {...o}/>
                                    </Fragment>
                                )}
                            </div>
                            <div className={styles.containerTheirs}>
                                <h3>Exclusive To Them:</h3>
                                {results.theirItems.map(o =>
                                    <Fragment key={o.id}>
                                        <ExclusiveResult {...o}/>
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                    : <></>
                }
            </div>
        </div>
    );
};

export default Compare;
