import {
    type FC,
    useEffect,
    useState,
} from 'react';
import { redirect } from 'react-router-dom';
import { useUserContext } from '../../Context/UserContext';

const Home: FC = () => {
    const { user } = useUserContext();
    const [comparisonId, setComparisonId] = useState<String>('');

    const handleComparison = async () => {
        console.log(`making comparison between ${user?.compareId} and ${comparisonId}`)
    };

    useEffect(() => {
        if (!user) {
            redirect('/login');
        }
    }, [user]);

    return (
        <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <input
                type='text'
                value={comparisonId.toString()}
                onChange={e => setComparisonId(e.target.value)}
            />
            <button type='button' onClick={handleComparison}>
                Make comparison
            </button>
        </>
    );
};

export default Home;
