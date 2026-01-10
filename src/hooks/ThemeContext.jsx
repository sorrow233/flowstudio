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
        // 检查用户是否手动设置过，以及当时的系统主题
        const savedTheme = localStorage.getItem('theme');
        const systemThemeAtOverride = localStorage.getItem('theme-system-at-override');
        const currentSystemTheme = getSystemTheme();

        // 如果用户之前手动设置过，且当时的系统主题与现在相同，保持用户选择
        if (savedTheme && systemThemeAtOverride === currentSystemTheme) {
            return savedTheme;
        }

        // 系统主题已变化，或从未手动设置过，清除覆盖并跟随系统
        localStorage.removeItem('theme');
        localStorage.removeItem('theme-system-at-override');
        return currentSystemTheme;
    });

    // 应用主题到 DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            // 系统主题变化时，清除用户的覆盖，开始跟随系统
            localStorage.removeItem('theme');
            localStorage.removeItem('theme-system-at-override');
            setTheme(newSystemTheme);
        };

        // 添加监听器
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const toggleTheme = () => {
        // 用户手动切换时，记录当前系统主题，表示这是"豁免"期
        const currentSystemTheme = getSystemTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        localStorage.setItem('theme-system-at-override', currentSystemTheme);
        setTheme(newTheme);
    };

    // 重置为跟随系统主题
    const useSystemTheme = () => {
        localStorage.removeItem('theme');
        localStorage.removeItem('theme-system-at-override');
        setTheme(getSystemTheme());
    };

    const value = {
        isDark: theme === 'dark',
        theme,
        toggleTheme,
        setTheme: (newTheme) => {
            const currentSystemTheme = getSystemTheme();
            localStorage.setItem('theme', newTheme);
            localStorage.setItem('theme-system-at-override', currentSystemTheme);
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
