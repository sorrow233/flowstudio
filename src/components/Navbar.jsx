import React from 'react';
import { motion } from 'framer-motion';
import {
    Lightbulb,
    Clock,
    Code,
    CheckCircle,
    Zap,
    ShoppingBag,
    Terminal
} from 'lucide-react';

const tabs = [
    { id: 'inspiration', label: '灵感迸发', icon: Lightbulb },
    { id: 'pending', label: '待开发', icon: Clock },
    { id: 'primary', label: '初级开发', icon: Code },
    { id: 'final', label: '终极开发', icon: CheckCircle },
    { id: 'advanced', label: '高级开发', icon: Zap },
    { id: 'commercial', label: '商业化', icon: ShoppingBag },
    { id: 'command', label: '指令管理', icon: Terminal },
];

const Navbar = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex justify-center w-full px-4 pt-10 pb-4">
            <nav className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-full px-8 py-3 flex items-center gap-8 md:gap-12 overflow-x-auto no-scrollbar max-w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                relative flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                ${isActive ? 'text-[#f43f5e] font-medium scale-105' : 'text-slate-800 hover:text-slate-400'}
              `}
                        >
                            {isActive && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <Icon size={18} strokeWidth={2.5} />
                                </motion.div>
                            )}
                            <span className="text-lg">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Navbar;
