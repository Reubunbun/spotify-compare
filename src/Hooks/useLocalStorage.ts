import { useState } from 'react';

export default function useLocalStorage<T extends Object | null>(
    key: string,
    initialValue?: T,
) : [T, (value: T) => void]
{
    const [storedValue, setStoredValue] = useState(() => {
        if (initialValue) {
            window.localStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            setStoredValue(value);

            if (value) {
                window.localStorage.setItem(key, JSON.stringify(value));
            } else {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(error);
        }
    };


    return [storedValue, setValue];
}
