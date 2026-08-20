import { useEffect, useState } from 'react';

export default function useViewMode(storageKey, defaultView = 'card') {
    const [view, setView] = useState(() => {
        if (typeof window === 'undefined') {
            return defaultView;
        }

        return localStorage.getItem(storageKey) || defaultView;
    });

    useEffect(() => {
        localStorage.setItem(storageKey, view);
    }, [storageKey, view]);

    return [view, setView];
}
