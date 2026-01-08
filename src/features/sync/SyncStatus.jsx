import React from 'react';
import { RefreshCw, WifiOff, Cloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SyncStatus Component
 * 
 * Visualizes the current sync state with a premium, unobtrusive design.
 * 
 * States:
 * - Synced: Subtle green dot + "Synced".
 * - Syncing: Animated yellow loader + "Saving...".
 * - Offline: Gray icon + "Offline".
 * 
 * Props:
 * - status: 'synced' | 'syncing' | 'offline' | 'disconnected'
 * - pendingCount: number (optional, for "Saving (3)...")
 */
const SyncStatus = ({ status, pendingCount = 0 }) => {

    // Helper for status config
    const getConfig = () => {
        switch (status) {
            case 'synced':
                return {
                    icon: <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />,
                    text: 'Synced',
                    color: 'text-emerald-600 bg-emerald-50/50',
                    tooltip: 'All changes saved to cloud'
                };
            case 'syncing':
                return {
                    icon: <RefreshCw size={14} className="animate-spin text-amber-500" />,
                    text: pendingCount > 0 ? `Saving (${pendingCount})...` : 'Saving...',
                    color: 'text-amber-600 bg-amber-50/50',
                    tooltip: 'Syncing changes to cloud...'
                };
            case 'offline':
                return {
                    icon: <WifiOff size={14} className="text-gray-400" />,
                    text: 'Offline',
                    color: 'text-gray-500 bg-gray-100/50',
                    tooltip: 'Changes saved to device. Will sync when online.'
                };
            default: // disconnected
                return {
                    icon: <Cloud size={14} className="text-gray-400" />,
                    text: 'Connecting...',
                    color: 'text-gray-500 bg-gray-100/50',
                    tooltip: 'Connecting to sync server...'
                };
        }
    };

    const config = getConfig();

    return (
        <div className="group relative flex items-center justify-center">
            <motion.div
                layout
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full 
                    transition-colors duration-300 backdrop-blur-sm
                    border border-transparent hover:border-black/5
                    ${config.color}
                `}
            >
                {config.icon}
                <span className="text-xs font-medium tracking-wide">
                    {config.text}
                </span>
            </motion.div>

            {/* Tooltip */}
            <div className="absolute top-full mt-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl translate-y-[-4px] group-hover:translate-y-0 text-center">
                {config.tooltip}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
        </div>
    );
};

export default SyncStatus;
