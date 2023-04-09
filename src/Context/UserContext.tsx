import {
    type FC,
    type ReactNode,
    createContext,
    useContext,
    useRef,
} from 'react';
import { redirect } from 'react-router-dom';
import useLocalStorage from '../Hooks/useLocalStorage';
import { type UserResponse, STORAGE_KEY } from '../../common/Constants';

interface UserContextType {
    login: (spotifyCode: string | null) => void;
    user: UserResponse | null;
};

const UserContext = createContext<UserContextType>(undefined!);

export const UserStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useLocalStorage<UserResponse | null>(STORAGE_KEY, null);
    const madeLoginRequest = useRef<boolean>(false);

    const login = (spotifyCode: string | null) : void => {
        if (user) {
            redirect('/home');
            return;
        }

        if (!spotifyCode) {
            redirect('/');
            return;
        }

        if (madeLoginRequest.current) {
            return;
        }

        madeLoginRequest.current = true;
        fetch(
            `/api/register?code=${spotifyCode}`,
            {
                method: 'POST',
            },
        )
            .then(resp => resp.json())
            .then(resp => {
                setUser(resp);
                redirect('/home');
            })
            .catch(console.error)
            .finally(() => madeLoginRequest.current = false);
    };

    return (
        <UserContext.Provider value={{ login, user }}>
            {children}
        </UserContext.Provider>
    )
};

export function useUserContext() {
    return useContext(UserContext);
};

export default UserContext;
