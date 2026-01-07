import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Clock,
    Code2,
    CheckCircle2,
    Zap,
    Briefcase,
    Terminal
} from 'lucide-react';

const tabs = [
    { id: 'inspiration', label: '灵感迸发', icon: Sparkles },
    { id: 'pending', label: '待开发', icon: Clock },
    { id: 'primary', label: '初级开发', icon: Code2 },
    { id: 'final', label: '终极开发', icon: CheckCircle2 },
    { id: 'advanced', label: '高级开发', icon: Zap },
    { id: 'commercial', label: '商业化', icon: Briefcase },
    { id: 'command', label: '指令管理', icon: Terminal },
];

const Navbar = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex justify-center w-full px-4 pt-8 pb-6">
            <nav className="bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-100/50 border border-white/50 rounded-full px-2 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 group whitespace-nowrap
                ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}
              `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-pill"
                                    className="absolute inset-0 bg-white shadow-md shadow-gray-200/50 rounded-full border border-gray-100"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon size={18} className={`transition-colors ${isActive ? 'text-rose-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Navbar;
