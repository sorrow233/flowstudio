import React, { createContext, useContext, useState, useEffect } from 'react';

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

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const hasOverride = localStorage.getItem('theme-override') === 'true';

        if (hasOverride && savedTheme) {
            // 用户有覆盖，保持用户选择
            return savedTheme;
        }
        // 没有覆盖，跟随系统
        return getSystemTheme();
    });

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
                // 用户有覆盖状态
                if (newSystemTheme === currentTheme) {
                    // 系统主题变得和用户选择一致了，清除覆盖，开始同步
                    localStorage.removeItem('theme-override');
                    // 主题不变，但现在是"跟随系统"状态
                }
                // 系统主题和用户选择不一致，保持用户选择，不做任何事
            } else {
                // 没有覆盖，正常跟随系统
                setTheme(newSystemTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    const toggleTheme = () => {
        const currentSystemTheme = getSystemTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';

        if (newTheme !== currentSystemTheme) {
            // 用户选择了和系统不一样的主题，设置覆盖标记
            localStorage.setItem('theme-override', 'true');
        } else {
            // 用户选择了和系统一样的主题，清除覆盖
            localStorage.removeItem('theme-override');
        }
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    // 重置为跟随系统主题
    const useSystemTheme = () => {
        localStorage.removeItem('theme-override');
        const systemTheme = getSystemTheme();
        localStorage.setItem('theme', systemTheme);
        setTheme(systemTheme);
    };

    const value = {
        isDark: theme === 'dark',
        theme,
        toggleTheme,
        setTheme: (newTheme) => {
            const currentSystemTheme = getSystemTheme();
            if (newTheme !== currentSystemTheme) {
                localStorage.setItem('theme-override', 'true');
            } else {
                localStorage.removeItem('theme-override');
            }
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
        },
        useSystemTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
