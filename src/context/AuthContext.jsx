import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/api/authService';

export const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    login: async () => {},
    logout: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);

    // Restore session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (err) {
                console.error('Failed to parse stored user', err);
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    // Handle unauthorized events from Axios interceptor
    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [logout]);

    const login = async (credentials) => {
        try {
            const data = await authService.login(credentials);
            
            // Expected response: { message: '...', token: '...', user: { role: 'Admin', ... } }
            if (data.token) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                return data;
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            throw error;
        }
    };

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
    }), [user, token, loading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
