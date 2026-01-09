import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSync } from '../features/sync/SyncContext';
import { useSyncedMap } from '../features/sync/useSyncStore';

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    // Sync
    const { doc } = useSync();
    const { data, set } = useSyncedMap(doc, 'user_preferences');

    // Default to light, but use synced value if present
    const syncedTheme = data.theme;

    // Initialize state (fallback to local if not yet synced, but primarily trust sync)
    const [theme, setTheme] = useState(() => {
        // Initial load priority: Sync > Local > Light
        // Note: Sync data might be empty on first render, handled in useEffect
        return localStorage.getItem('theme') || 'light';
    });

    // When sync data arrives, update state
    useEffect(() => {
        if (syncedTheme && syncedTheme !== theme) {
            setTheme(syncedTheme);
        }
    }, [syncedTheme, theme]); // Added theme to dependencies to prevent infinite loop if syncedTheme is initially undefined

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Backup to local storage for offline/fast load
        localStorage.setItem('theme', theme);

        // Push to sync if different (and doc is ready)
        if (doc && theme !== syncedTheme) {
            set('theme', theme);
        }
    }, [theme, doc, set, syncedTheme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        isDark: theme === 'dark', // Derive isDark from theme state
        toggleTheme,
        setTheme: (newTheme) => setTheme(newTheme), // Allow setting theme directly
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
