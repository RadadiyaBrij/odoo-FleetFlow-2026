import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isLight, setIsLight] = useState(() => {
        const saved = localStorage.getItem('fleetflow-theme');
        return saved === 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isLight) {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('fleetflow-theme', isLight ? 'light' : 'dark');
    }, [isLight]);

    const toggleTheme = () => setIsLight(!isLight);

    return (
        <ThemeContext.Provider value={{ isLight, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
