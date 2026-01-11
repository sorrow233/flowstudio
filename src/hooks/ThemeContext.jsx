import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSync } from '../features/sync/SyncContext';
import { useSyncedMap } from '../features/sync/useSyncStore';

const ThemeContext = createContext();

// 获取系统主题偏好
const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// 内部 Provider，需要在 SyncProvider 内使用
function ThemeProviderInner({ children }) {
    // 同步
    const { doc } = useSync();
    const { data: preferences, set } = useSyncedMap(doc, 'user_preferences');

    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const hasOverride = localStorage.getItem('theme-override') === 'true';

        if (hasOverride && savedTheme) {
            return savedTheme;
        }
        return getSystemTheme();
    });

    // 从云端同步主题设置
    useEffect(() => {
        console.log('[ThemeSync] preferences changed:', preferences);

        // 只要云端有主题设置就应用
        if (preferences?.theme) {
            const syncedTheme = preferences.theme;
            const syncedOverride = preferences.themeOverride ?? true; // 默认为 true（用户手动设置）

            console.log('[ThemeSync] Applying synced theme:', syncedTheme, 'override:', syncedOverride);

            // 更新本地存储
            localStorage.setItem('theme', syncedTheme);
            if (syncedOverride) {
                localStorage.setItem('theme-override', 'true');
            } else {
                localStorage.removeItem('theme-override');
            }

            // 应用主题
            setThemeState(syncedTheme);
        }
    }, [preferences?.theme, preferences?.themeOverride]);

    // 应用主题到 DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            const hasOverride = localStorage.getItem('theme-override') === 'true';
            const currentTheme = localStorage.getItem('theme');

            if (hasOverride) {
                if (newSystemTheme === currentTheme) {
                    localStorage.removeItem('theme-override');
                    // 同步到云端
                    if (doc) {
                        set('themeOverride', false);
                    }
                }
            } else {
                setThemeState(newSystemTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, [doc, set]);

    const toggleTheme = () => {
        const currentSystemTheme = getSystemTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const hasOverride = newTheme !== currentSystemTheme;

        console.log('[ThemeSync] Toggle theme:', newTheme, 'override:', hasOverride, 'doc:', !!doc);

        if (hasOverride) {
            localStorage.setItem('theme-override', 'true');
        } else {
            localStorage.removeItem('theme-override');
        }
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);

        // 同步到云端
        if (doc) {
            console.log('[ThemeSync] Writing to cloud...');
            set('theme', newTheme);
            set('themeOverride', hasOverride);
        } else {
            console.warn('[ThemeSync] No doc available, cannot sync!');
        }
    };

    const useSystemTheme = () => {
        localStorage.removeItem('theme-override');
        const systemTheme = getSystemTheme();
        localStorage.setItem('theme', systemTheme);
        setThemeState(systemTheme);

        // 同步到云端
        if (doc) {
            set('theme', systemTheme);
            set('themeOverride', false);
        }
    };

    const value = {
        isDark: theme === 'dark',
        theme,
        toggleTheme,
        setTheme: (newTheme) => {
            const currentSystemTheme = getSystemTheme();
            const hasOverride = newTheme !== currentSystemTheme;

            if (hasOverride) {
                localStorage.setItem('theme-override', 'true');
            } else {
                localStorage.removeItem('theme-override');
            }
            localStorage.setItem('theme', newTheme);
            setThemeState(newTheme);

            // 同步到云端
            if (doc) {
                set('theme', newTheme);
                set('themeOverride', hasOverride);
            }
        },
        useSystemTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// 外层 Provider，保持向后兼容
export function ThemeProvider({ children }) {
    return <ThemeProviderInner>{children}</ThemeProviderInner>;
}

export default ThemeContext;
