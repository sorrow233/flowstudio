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
        // 检查是否有用户手动设置的主题
        const savedTheme = localStorage.getItem('theme');
        // 检查是否用户明确设置过（通过标记）
        const hasUserSetTheme = localStorage.getItem('theme-user-set') === 'true';

        if (hasUserSetTheme && savedTheme) {
            return savedTheme;
        }
        // 首次访问或未手动设置，使用系统主题
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
            // 只有在用户没有手动设置主题时才跟随系统
            const hasUserSetTheme = localStorage.getItem('theme-user-set') === 'true';
            if (!hasUserSetTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        // 添加监听器
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const toggleTheme = () => {
        // 用户手动切换时，标记为用户设置
        localStorage.setItem('theme-user-set', 'true');
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // 重置为跟随系统主题
    const useSystemTheme = () => {
        localStorage.removeItem('theme-user-set');
        setTheme(getSystemTheme());
    };

    const value = {
        isDark: theme === 'dark',
        theme,
        toggleTheme,
        setTheme: (newTheme) => {
            localStorage.setItem('theme-user-set', 'true');
            setTheme(newTheme);
        },
        useSystemTheme, // 暴露重置方法，用户可以选择回归系统主题
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
