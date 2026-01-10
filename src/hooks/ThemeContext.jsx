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
        // 始终使用系统主题作为初始值
        return getSystemTheme();
    });

    // 应用主题到 DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // 监听系统主题变化 - 始终跟随系统
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            // 实时跟随系统主题变化
            setTheme(e.matches ? 'dark' : 'light');
        };

        // 添加监听器
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const toggleTheme = () => {
        // 用户手动切换只是临时覆盖，刷新后会重新跟随系统
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // 重置为跟随系统主题
    const useSystemTheme = () => {
        setTheme(getSystemTheme());
    };

    const value = {
        isDark: theme === 'dark',
        theme,
        toggleTheme,
        setTheme: (newTheme) => {
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
