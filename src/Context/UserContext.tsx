import {
    type FC,
    type ReactNode,
    createContext,
    useContext,
    useState,
} from 'react';
import { type UserResponse } from '../../lib/Constants';

interface UserContextType {
    login: () => Promise<boolean>;
    register: (spotifyCode: string | null) => Promise<boolean>;
    user: UserResponse | null;
};

const UserContext = createContext<UserContextType>(undefined!);

export const UserStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);

    const login = async () : Promise<boolean> => {
        const resp = await fetch(
            '/api/login',
            {
                method: 'POST',
            },
        );

        if (resp.status !== 200) {
            return false;
        }

        try {
            const body = await resp.json();
            setUser(body);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const register = async (spotifyCode: string | null) : Promise<boolean> => {
        if (!spotifyCode) {
            return false;
        }

        const resp = await fetch(
            `/api/register?code=${spotifyCode}`,
            {
                method: 'POST',
            },
        );
        if (resp.status !== 200) {
            return false;
        }

        try {
            const body = await resp.json();
            setUser(body);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return (
        <UserContext.Provider value={{ login, register, user }}>
            {children}
        </UserContext.Provider>
    )
};

export function useUserContext() {
    return useContext(UserContext);
};

export default UserContext;
