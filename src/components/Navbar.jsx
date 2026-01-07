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
    { id: 'inspiration', label: 'Inspiration', icon: Sparkles },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'primary', label: 'Primary', icon: Code2 },
    { id: 'final', label: 'Final', icon: CheckCircle2 },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'commercial', label: 'Commercial', icon: Briefcase },
    { id: 'command', label: 'Command', icon: Terminal },
];

const Navbar = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4">
            <nav className="bg-white border border-gray-100 rounded-full px-2 py-2 flex items-center gap-2 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
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
            </nav>
        </div>
    );
};

export default Navbar;
