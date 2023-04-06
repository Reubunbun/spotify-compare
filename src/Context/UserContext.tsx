import {
    type FC,
    type ReactNode,
    createContext,
    useState,
    useContext,
    useRef,
} from 'react';
import { redirect } from 'react-router-dom';

interface UserContextType {
    login: (spotifyCode: string | null) => void;
    email: string | null;
    refreshToken: string | null;
};

interface User {
    email: string | null;
    refreshToken: string | null;
};

const UserContext = createContext<UserContextType>(undefined!);

export const UserStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
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
            `/api/login?code=${spotifyCode}`,
            {
                method: 'POST',
            }
        )
            .then(resp => resp.json())
            .then(console.log)
            .catch(console.error)
            .finally(() => madeLoginRequest.current = false);
    };

    return (
        <UserContext.Provider
            value={{
                login,
                email: user?.email || null,
                refreshToken: user?.refreshToken || null,
            }}
        >
            {children}
        </UserContext.Provider>
    )
};

export function useUserContext() {
    return useContext(UserContext);
};

export default UserContext;
