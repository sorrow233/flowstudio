import React from 'react';
import { motion } from 'framer-motion';
import Spotlight from './shared/Spotlight';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Lightbulb,
    Clock,
    Code2,
    CheckCircle2,
    Terminal,
    Cloud,
    Settings,
    Sun,
    Moon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import AuthModal from '../features/auth/AuthModal';
import { useSync } from '../features/sync/SyncContext';
import SyncStatus from '../features/sync/SyncStatus';
import { DataManagementModal } from '../features/settings';
import { useTheme } from '../hooks/ThemeContext';
import { useSettings } from '../hooks/SettingsContext';
import { useTranslation } from '../features/i18n';

const tabIcons = {
    inspiration: Lightbulb,
    pending: Clock,
    primary: Code2,
    advanced: CheckCircle2,
    command: Terminal,
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { showAdvancedFeatures } = useSettings();
    const { t } = useTranslation();

    // 主流程：灵感 → 萌芽 → 心流 → 蓝图 → 进阶（可选）
    const mainTabs = [
        { id: 'inspiration', label: t('navbar.inspiration'), icon: tabIcons.inspiration, path: '/inspiration' },
        { id: 'pending', label: t('navbar.pending'), icon: tabIcons.pending, path: '/sprout' },
        { id: 'primary', label: t('navbar.primary'), icon: tabIcons.primary, path: '/flow' },
        { id: 'command', label: t('navbar.command'), icon: tabIcons.command, path: '/blueprint' },
    ];

    // 进阶模块（需要用户开启）
    const advancedTab = { id: 'advanced', label: t('navbar.advanced'), icon: tabIcons.advanced, path: '/advanced' };

    const { status } = useSync();

    // Dynamic Theme Config based on active tab
    const getActiveTheme = () => {
        const path = location.pathname;
        if (path.startsWith('/inspiration')) return 'pink';
        if (path.startsWith('/sprout')) return 'green';
        if (path.startsWith('/flow')) return 'purple';
        if (path.startsWith('/advanced')) return 'red';
        if (path.startsWith('/blueprint')) return 'sky';
        return 'default';
    };

    const activeTheme = getActiveTheme();

    const themeConfigs = {
        pink: {
            spotlight: isDark ? "rgba(244, 114, 182, 0.15)" : "rgba(244, 114, 182, 0.12)",
            iconText: 'text-pink-400 dark:text-pink-300',
            iconHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
            sync: { dot: 'bg-pink-400', shadow: 'shadow-[0_0_8px_rgba(244,114,182,0.4)]', text: 'text-pink-500', bg: 'bg-pink-50/50 dark:bg-pink-900/20' }
        },
        green: {
            spotlight: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
            iconText: 'text-green-500 dark:text-green-400',
            iconHover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
            sync: { dot: 'bg-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]', text: 'text-emerald-600', bg: 'bg-emerald-50/50 dark:bg-emerald-900/20' }
        },
        purple: {
            spotlight: isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)",
            iconText: 'text-purple-500 dark:text-purple-400',
            iconHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
            sync: { dot: 'bg-purple-500', shadow: 'shadow-[0_0_8px_rgba(168,85,247,0.4)]', text: 'text-purple-600', bg: 'bg-purple-50/50 dark:bg-purple-900/20' }
        },
        red: {
            spotlight: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
            iconText: 'text-red-500 dark:text-red-400',
            iconHover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
            sync: { dot: 'bg-red-500', shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]', text: 'text-red-600', bg: 'bg-red-50/50 dark:bg-red-900/20' }
        },
        sky: {
            spotlight: isDark ? "rgba(14, 165, 233, 0.15)" : "rgba(14, 165, 233, 0.1)", // Sky-500
            iconText: 'text-sky-500 dark:text-sky-400',
            iconHover: 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
            sync: { dot: 'bg-sky-500', shadow: 'shadow-[0_0_8px_rgba(14,165,233,0.4)]', text: 'text-sky-600', bg: 'bg-sky-50/50 dark:bg-sky-900/20' }
        },
        default: {
            spotlight: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
            iconText: 'text-gray-400 dark:text-gray-500',
            iconHover: 'hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
            sync: null
        }
    };

    const currentConfig = themeConfigs[activeTheme] || themeConfigs.default;

    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4 relative z-50">
            <nav className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm max-w-[95vw] md:max-w-full relative mx-auto">
                <Spotlight spotColor={currentConfig.spotlight} size={300} className="rounded-full">
                    <div className="flex items-center gap-4 md:gap-10 px-2 py-2 md:px-4 md:py-3 overflow-x-auto no-scrollbar mask-linear-fade">
                        {/* 主流程 */}
                        {mainTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = location.pathname.startsWith(tab.path);

                            // Define active colors for each tab
                            const activeColors = {
                                inspiration: '!text-pink-400 dark:!text-pink-300',
                                pending: 'text-green-500 dark:text-green-400',
                                primary: 'text-purple-500 dark:text-purple-400',
                                advanced: 'text-red-500 dark:text-red-400',
                                command: 'text-sky-500 dark:text-sky-400',
                            };

                            const activeColorClass = activeColors[tab.id] || 'text-gray-900 dark:text-white';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.path)}
                                    className={`
                                        relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap z-50 shrink-0
                                        ${isActive
                                            ? `${activeColorClass}`
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                                    `}
                                >
                                    {/* Active Spotlight Glow */}
                                    {isActive && (
                                        <div
                                            className="absolute inset-0 z-[-1] pointer-events-none blur-xl opacity-100"
                                            style={{
                                                background: `radial-gradient(circle at center, ${themeConfigs[tab.id === 'pending' ? 'green' : tab.id === 'primary' ? 'purple' : tab.id === 'inspiration' ? 'pink' : tab.id === 'command' ? 'sky' : 'default'].spotlight.replace('0.15', '0.4').replace('0.1', '0.3').replace('0.12', '0.3')} 0%, transparent 80%)`
                                            }}
                                        />
                                    )}
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="w-4 h-4 md:w-4 md:h-4" />
                                    <span className={`text-xs md:text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{tab.label}</span>
                                </button>
                            );
                        })}

                        {/* 进阶模块 - 需要用户开启 */}
                        {showAdvancedFeatures && (() => {
                            const Icon = advancedTab.icon;
                            const isActive = location.pathname.startsWith(advancedTab.path);
                            return (
                                <button
                                    key={advancedTab.id}
                                    onClick={() => navigate(advancedTab.path)}
                                    className={`
                                        relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap z-50 shrink-0
                                        ${isActive
                                            ? 'text-red-500 dark:text-red-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                                    `}
                                >
                                    {/* Active Spotlight Glow (Advanced) */}
                                    {isActive && (
                                        <div
                                            className="absolute inset-0 z-[-1] pointer-events-none blur-xl opacity-100"
                                            style={{
                                                background: `radial-gradient(circle at center, rgba(239, 68, 68, 0.35) 0%, transparent 80%)`
                                            }}
                                        />
                                    )}
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="w-4 h-4 md:w-4 md:h-4" />
                                    <span className={`text-xs md:text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{advancedTab.label}</span>
                                </button>
                            );
                        })()}

                        <div className="w-px h-5 md:h-6 bg-gray-100 dark:bg-gray-700 mx-1 md:mx-2 relative z-40 shrink-0" />

                        {/* 右侧工具栏 - 紧凑布局 */}
                        <div className="flex items-center gap-1 md:gap-1.5">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all z-40 shrink-0 ${currentConfig.iconText} ${currentConfig.iconHover}`}
                                title={isDark ? '亮色模式' : '暗色模式'}
                            >
                                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                            </button>

                            {/* Settings */}
                            <button
                                onClick={() => setIsDataModalOpen(true)}
                                className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all z-40 shrink-0 ${currentConfig.iconText} ${currentConfig.iconHover}`}
                                title={t('navbar.dataManagement')}
                            >
                                <Settings size={16} strokeWidth={1.5} />
                            </button>

                            {/* Auth/Sync */}
                            <div className="relative z-40 shrink-0">
                                <button onClick={() => setIsAuthModalOpen(true)} className="focus:outline-none">
                                    {user ? (
                                        <SyncStatus
                                            status={status}
                                            themeColor={currentConfig.sync}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all whitespace-nowrap">
                                            <Cloud size={14} />
                                            <span className="text-xs md:text-sm hidden sm:inline">{t('navbar.cloudSync')}</span>
                                            <span className="text-xs md:text-sm sm:hidden">{t('navbar.sync')}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Spotlight>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <DataManagementModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} />
        </div>
    );
};

export default Navbar;
