import React from 'react';
import { motion } from 'framer-motion';
import Spotlight from './shared/Spotlight';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Lightbulb,
    Clock,
    Code2,
    CheckCircle2,
    Zap,
    Briefcase,
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
import { useTranslation } from '../features/i18n';

const tabIcons = {
    inspiration: Lightbulb,
    pending: Clock,
    primary: Code2,
    advanced: CheckCircle2,
    final: Zap,
    commercial: Briefcase,
    command: Terminal,
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();

    // 主流程：灵感 → 命令 → 待定 → 开发 → 进阶
    const mainTabs = [
        { id: 'inspiration', label: t('navbar.inspiration'), icon: tabIcons.inspiration, path: '/inspiration' },
        { id: 'command', label: t('navbar.command'), icon: tabIcons.command, path: '/commands' },
        { id: 'pending', label: t('navbar.pending'), icon: tabIcons.pending, path: '/pending' },
        { id: 'primary', label: t('navbar.primary'), icon: tabIcons.primary, path: '/primary' },
        { id: 'advanced', label: t('navbar.advanced'), icon: tabIcons.advanced, path: '/advanced' },
    ];

    // 额外流程：终稿 -> 商业化
    const extraTabs = [
        { id: 'final', label: t('navbar.final'), icon: tabIcons.final, path: '/final' }, // Icon: Check
        { id: 'commercial', label: t('navbar.commercial'), icon: tabIcons.commercial, path: '/commercial' },
    ];

    const { status } = useSync();

    // Dynamic Spotlight Color based on active tab
    const getSpotlightColor = () => {
        const path = location.pathname;
        if (path.startsWith('/inspiration')) return isDark ? "rgba(244, 114, 182, 0.15)" : "rgba(244, 114, 182, 0.12)"; // Pink
        if (path.startsWith('/pending')) return isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"; // Green
        if (path.startsWith('/primary')) return isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)"; // Purple
        if (path.startsWith('/advanced')) return isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)"; // Red
        if (path.startsWith('/commercial')) return isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)"; // Amber
        if (path.startsWith('/commands')) return isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"; // Neutral
        return isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"; // Default to Green
    };

    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4 relative z-50">
            <nav className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm max-w-[95vw] md:max-w-full relative mx-auto">
                <Spotlight spotColor={getSpotlightColor()} size={300} className="rounded-full">
                    <div className="flex items-center gap-1 md:gap-2 px-1.5 py-1.5 md:px-2 md:py-2 overflow-x-auto no-scrollbar mask-linear-fade">
                        {/* 主流程 */}
                        {mainTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = location.pathname.startsWith(tab.path);

                            // Define active colors for each tab
                            const activeColors = {
                                inspiration: 'text-pink-400 dark:text-pink-300',
                                pending: 'text-green-500 dark:text-green-400',
                                primary: 'text-purple-500 dark:text-purple-400',
                                advanced: 'text-red-500 dark:text-red-400',
                                commercial: 'text-amber-500 dark:text-amber-400',
                                command: 'text-gray-900 dark:text-white', // Invariant black/white
                            };

                            const activeColorClass = activeColors[tab.id] || 'text-gray-900 dark:text-white';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.path)}
                                    className={`
                                        relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap z-40 shrink-0
                                        ${isActive
                                            ? `${activeColorClass} bg-gray-50/50 dark:bg-gray-800`
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                                    `}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="w-4 h-4 md:w-4 md:h-4" />
                                    <span className={`text-xs md:text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{tab.label}</span>
                                </button>
                            );
                        })}

                        {/* 分割线 - 主流程与其他流程分界 */}
                        <div className="w-px h-5 md:h-6 bg-gray-200 dark:bg-gray-600 mx-1 md:mx-2 relative z-40 shrink-0" />

                        {/* 其他流程（终稿、商业化） */}
                        {extraTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = location.pathname.startsWith(tab.path);

                            // Define active colors for each tab
                            const activeColors = {
                                final: 'text-gray-900 dark:text-white',
                                commercial: 'text-yellow-500 dark:text-yellow-400',
                            };

                            const activeColorClass = activeColors[tab.id] || 'text-gray-900 dark:text-white';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.path)}
                                    className={`
                                        relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap z-40 shrink-0
                                        ${isActive
                                            ? `${activeColorClass} bg-gray-50/50 dark:bg-gray-800`
                                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}
                                    `}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="w-4 h-4 md:w-4 md:h-4" />
                                    <span className={`text-xs md:text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{tab.label}</span>
                                </button>
                            );
                        })}

                        <div className="w-px h-5 md:h-6 bg-gray-100 dark:bg-gray-700 mx-0.5 md:mx-1 relative z-40 shrink-0" />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-40 shrink-0 ${getSpotlightColor().includes('244, 114, 182') ? 'hover:text-pink-500' : getSpotlightColor().includes('168, 85, 247') ? 'hover:text-purple-500' : getSpotlightColor().includes('239, 68, 68') ? 'hover:text-red-500' : getSpotlightColor().includes('245, 158, 11') ? 'hover:text-amber-500' : 'hover:text-emerald-500'}`}
                            title={isDark ? '亮色模式' : '暗色模式'}
                        >
                            {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => setIsDataModalOpen(true)}
                            className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-40 shrink-0 ${getSpotlightColor().includes('244, 114, 182') ? 'hover:text-pink-500' : getSpotlightColor().includes('168, 85, 247') ? 'hover:text-purple-500' : getSpotlightColor().includes('239, 68, 68') ? 'hover:text-red-500' : getSpotlightColor().includes('245, 158, 11') ? 'hover:text-amber-500' : 'hover:text-emerald-500'}`}
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
                                        themeColor={(() => {
                                            const color = getSpotlightColor();
                                            if (color.includes('244, 114, 182')) return { // Pink
                                                dot: 'bg-pink-400',
                                                shadow: 'shadow-[0_0_8px_rgba(244,114,182,0.4)]',
                                                text: 'text-pink-500',
                                                bg: 'bg-pink-50/50 dark:bg-pink-900/20'
                                            };
                                            if (color.includes('168, 85, 247')) return { // Purple
                                                dot: 'bg-purple-500',
                                                shadow: 'shadow-[0_0_8px_rgba(168,85,247,0.4)]',
                                                text: 'text-purple-600',
                                                bg: 'bg-purple-50/50 dark:bg-purple-900/20'
                                            };
                                            if (color.includes('239, 68, 68')) return { // Red
                                                dot: 'bg-red-500',
                                                shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
                                                text: 'text-red-600',
                                                bg: 'bg-red-50/50 dark:bg-red-900/20'
                                            };
                                            if (color.includes('245, 158, 11')) return { // Amber
                                                dot: 'bg-amber-500',
                                                shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
                                                text: 'text-amber-600',
                                                bg: 'bg-amber-50/50 dark:bg-amber-900/20'
                                            };
                                            // Default Green
                                            return null;
                                        })()}
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
                </Spotlight>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <DataManagementModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} />
        </div>
    );
};

export default Navbar;
