import React from 'react';
import { motion } from 'framer-motion';
import Spotlight from './shared/Spotlight';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Clock,
    Code2,
    CheckCircle2,
    Zap,
    Briefcase,
    Terminal,
    Cloud,
    Wifi,
    WifiOff,
    RefreshCw,
    Settings,
    Sun,
    Moon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import AuthModal from '../features/auth/AuthModal';
import { useSyncStore } from '../features/sync/useSyncStore';
import SyncStatus from '../features/sync/SyncStatus';
import { DataManagementModal } from '../features/settings';
import { useTheme } from '../hooks/ThemeContext';
import { useTranslation } from '../features/i18n';

// Tab icons mapping
const tabIcons = {
    inspiration: Sparkles,
    pending: Clock,
    primary: Code2,
    advanced: Zap,
    final: CheckCircle2,
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
    const { t, language, toggleLanguage } = useTranslation();

    // Generate tabs with translations
    const tabs = [
        { id: 'inspiration', label: t('navbar.inspiration'), icon: tabIcons.inspiration, path: '/inspiration' },
        { id: 'pending', label: t('navbar.pending'), icon: tabIcons.pending, path: '/pending' },
        { id: 'primary', label: t('navbar.primary'), icon: tabIcons.primary, path: '/primary' },
        { id: 'advanced', label: t('navbar.advanced'), icon: tabIcons.advanced, path: '/advanced' },
        { id: 'final', label: t('navbar.final'), icon: tabIcons.final, path: '/final' },
        { id: 'commercial', label: t('navbar.commercial'), icon: tabIcons.commercial, path: '/commercial' },
        { id: 'command', label: t('navbar.command'), icon: tabIcons.command, path: '/commands' },
    ];

    // Get Sync Status
    const { status, pendingCount } = useSyncStore('flowstudio_v1');

    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4 relative z-50">
            <nav className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-full shadow-sm dark:shadow-gray-900/50 max-w-[95vw] md:max-w-full relative mx-auto">
                <Spotlight spotColor={isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"} size={300} className="rounded-full">
                    <div className="flex items-center gap-1 md:gap-2 px-1.5 py-1.5 md:px-2 md:py-2 overflow-x-auto no-scrollbar mask-linear-fade">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            // Check if current path starts with tab path (simple active check)
                            const isActive = location.pathname.startsWith(tab.path);

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.path)}
                                    className={`
                        relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap z-40 shrink-0
                        ${isActive
                                            ? 'text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800/50'
                                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}
                    `}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="w-4 h-4 md:w-4 md:h-4" />
                                    <span className={`text-xs md:text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{tab.label}</span>
                                </button>
                            );
                        })}

                        <div className="w-px h-5 md:h-6 bg-gray-100 dark:bg-gray-700 mx-0.5 md:mx-1 relative z-40 shrink-0" />

                        {/* Language Toggle Button */}
                        <button
                            onClick={toggleLanguage}
                            className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-40 shrink-0"
                            title="Switch Language"
                        >
                            <span className="text-xs font-medium uppercase">{language === 'zh' ? '简' : language === 'ja' ? '日' : language === 'ko' ? '한' : 'EN'}</span>
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-40 shrink-0"
                            title={isDark ? t('common.lightMode', '亮色模式') : t('common.darkMode', '暗色模式')}
                        >
                            {isDark ? (
                                <Sun size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
                            ) : (
                                <Moon size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
                            )}
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsDataModalOpen(true)}
                            className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-40 shrink-0"
                            title={t('navbar.dataManagement')}
                        >
                            <Settings size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
                        </button>

                        <div className="relative z-40 shrink-0">
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="focus:outline-none"
                            >
                                {user ? (
                                    <SyncStatus status={status} pendingCount={pendingCount} />
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 whitespace-nowrap bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white">
                                        <Cloud size={14} className="md:w-4 md:h-4" />
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

