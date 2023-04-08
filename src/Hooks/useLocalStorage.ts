import {
    useState,
    useEffect,
    type Dispatch,
    type SetStateAction,
} from 'react';

export default function useLocalStorage<T extends Object | null>(
    key: string,
    initial: T,
) : [T, Dispatch<SetStateAction<T>>]
{
    const [state, setState] = useState<T>(() => {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : initial;
    });

    useEffect(() => {
        if (state) {
            window.localStorage.setItem(key, JSON.stringify(state));
        }
    }, [state]);

    return [state, setState];
};
