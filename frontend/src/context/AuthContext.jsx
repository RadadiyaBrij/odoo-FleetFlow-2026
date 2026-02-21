import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ROLE_MATRIX = {
    MANAGER: {
        access: { dashboard: true, vehicles: true, drivers: true, trips: true, maintenance: true, expenses: true, performance: true, analytics: true },
        manage: { vehicles: true, drivers: true, trips: true, maintenance: true, expenses: true, performance: true }
    },
    DISPATCHER: {
        access: { dashboard: true, vehicles: true, drivers: true, trips: true, maintenance: true, expenses: true, performance: false, analytics: false },
        manage: { vehicles: false, drivers: false, trips: true, maintenance: false, expenses: false, performance: false }
    },
    SAFETY_OFFICER: {
        access: { dashboard: true, vehicles: true, drivers: true, trips: true, maintenance: true, expenses: false, performance: true, analytics: true },
        manage: { vehicles: false, drivers: true, trips: false, maintenance: false, expenses: false, performance: true }
    },
    ANALYST: {
        access: { dashboard: true, vehicles: true, drivers: true, trips: false, maintenance: false, expenses: true, performance: false, analytics: true },
        manage: { vehicles: false, drivers: false, trips: false, maintenance: false, expenses: true, performance: false }
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const role = user?.role || null;
    const can = role ? ROLE_MATRIX[role] : { access: {}, manage: {} };

    const login = (userData, accessToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', accessToken);
        setUser(userData);
        setToken(accessToken);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    useEffect(() => {
        const sync = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            setUser(storedUser ? JSON.parse(storedUser) : null);
            setToken(storedToken || null);
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, role, can, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
