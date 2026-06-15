import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const defaultUser = {
    name: 'Aria Doe',
    phone: '+91 98765 43210',
    email: 'aria@sfurti.local',
    role: 'Admin',
};

export const SessionContext = createContext({
    user: defaultUser,
    sessionExpired: false,
    sessionTimeout: 30,
    setSessionTimeout: () => {},
    setUserRole: () => {},
    updateUser: () => {},
    logout: () => {},
    restoreSession: () => {},
});

const readStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('sf_user')) || defaultUser;
    } catch {
        return defaultUser;
    }
};

const readTimeout = () => {
    const stored = Number(localStorage.getItem('sf_session_timeout'));
    return stored > 0 ? stored : 30;
};

export function SessionProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [sessionTimeout, setSessionTimeoutState] = useState(readTimeout);
    const timerRef = useRef(null);

    const expireSession = useCallback(() => {
        setSessionExpired(true);
    }, []);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(expireSession, sessionTimeout * 60 * 1000);
    }, [expireSession, sessionTimeout]);

    useEffect(() => {
        if (sessionExpired) return undefined;
        resetTimer();
        const events = ['click', 'keydown', 'mousemove', 'touchstart'];
        events.forEach((event) => window.addEventListener(event, resetTimer));
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [resetTimer, sessionExpired]);

    const updateUser = (nextUser) => {
        setUser((current) => {
            const updated = { ...current, ...nextUser };
            localStorage.setItem('sf_user', JSON.stringify(updated));
            return updated;
        });
    };

    const setUserRole = (role) => {
        updateUser({ role });
    };

    const setSessionTimeout = (minutes) => {
        const safeMinutes = Math.max(5, Number(minutes) || 30);
        localStorage.setItem('sf_session_timeout', String(safeMinutes));
        setSessionTimeoutState(safeMinutes);
    };

    const logout = () => {
        setSessionExpired(true);
    };

    const restoreSession = () => {
        setSessionExpired(false);
        resetTimer();
    };

    const value = useMemo(() => ({
        user,
        sessionExpired,
        sessionTimeout,
        setSessionTimeout,
        setUserRole,
        updateUser,
        logout,
        restoreSession,
    }), [user, sessionExpired, sessionTimeout, resetTimer]);

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
