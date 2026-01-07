import React from 'react';
import { motion } from 'framer-motion';
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
    RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import AuthModal from '../features/auth/AuthModal';
import { useSyncStore } from '../features/sync/useSyncStore';

const tabs = [
    { id: 'inspiration', label: 'Inspiration', icon: Sparkles, path: '/inspiration' },
    { id: 'pending', label: 'Pending', icon: Clock, path: '/pending' },
    { id: 'primary', label: 'Primary', icon: Code2, path: '/primary' },
    { id: 'final', label: 'Final', icon: CheckCircle2, path: '/final' },
    { id: 'advanced', label: 'Advanced', icon: Zap, path: '/advanced' },
    { id: 'commercial', label: 'Commercial', icon: Briefcase, path: '/commercial' },
    { id: 'command', label: 'Command', icon: Terminal, path: '/commands' },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Get Sync Status
    const { status } = useSyncStore('flowstudio_v1');

    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4 relative z-50">
            <nav className="bg-white border border-gray-100 rounded-full px-2 py-2 flex items-center gap-2 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    // Check if current path starts with tab path (simple active check)
                    const isActive = location.pathname.startsWith(tab.path);

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`
                relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              `}
                        >
                            <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                            <span className={`text-sm ${isActive ? 'font-medium' : 'font-light'}`}>{tab.label}</span>
                        </button>
                    );
                })}

                <div className="w-px h-6 bg-gray-100 mx-1" />

                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap
                        ${user ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-900 text-white hover:bg-black'}
                    `}
                >
                    {user ? (
                        <>
                            {status === 'synced' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                            {status === 'syncing' && <RefreshCw size={14} className="animate-spin text-emerald-500" />}
                            {status === 'offline' && <WifiOff size={14} className="text-gray-400" />}

                            <span className="text-sm font-medium">
                                {status === 'synced' ? 'Synced' : status === 'syncing' ? 'Syncing...' : 'Offline'}
                            </span>
                        </>
                    ) : (
                        <>
                            <Cloud size={16} />
                            <span className="text-sm">Cloud Sync</span>
                        </>
                    )}
                </button>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export default Navbar;
