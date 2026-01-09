import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Layout, Shield, Globe, Server, Box, GitCommit, CheckCircle, AlertCircle, PlayCircle, Lock } from 'lucide-react';

const MODULE_ICONS = {
    'frontend': Layout,
    'backend': Server,
    'database': Database,
    'core': Cpu,
    'security': Shield,
    'api': Globe,
    'feature': Box,
    'other': Activity
};

const STAGE_COLORS = {
    1: 'bg-gray-100 text-gray-500', // Prototype
    2: 'bg-blue-50 text-blue-600',   // Alpha
    3: 'bg-purple-50 text-purple-600', // Beta
    4: 'bg-emerald-50 text-emerald-600', // Stable
    5: 'bg-amber-50 text-amber-600',   // Optimization
};

const ModuleCard = ({ module, onClick }) => {
    // Fallback icon based on type/category string match
    const getIcon = () => {
        const type = module.category?.toLowerCase() || 'other';
        for (const [key, Icon] of Object.entries(MODULE_ICONS)) {
            if (type.includes(key)) return Icon;
        }
        return Box;
    };

    const Icon = getIcon();
    const stage = module.stage || 1;
    const progress = module.progress || 0;

    return (
        <motion.div
            layoutId={`module-${module.id}`}
            onClick={onClick}
            draggable={true}
            onDragStart={(e) => {
                e.dataTransfer.setData('moduleId', module.id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
            {/* Background Gradient based on category */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STAGE_COLORS[stage]} shadow-sm`}>
                        <Icon size={20} />
                    </div>
                    {/* Status Dot */}
                    <div className={`w-2 h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-gray-300'} ring-2 ring-white`} />
                </div>

                <h3 className="font-medium text-gray-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {module.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {module.description || 'No description provided.'}
                </p>
            </div>

            {/* Micro-Lifecycle Indicator */}
            <div className="relative z-10 mt-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 font-bold tracking-wider">
                        v0.{stage}.{Math.floor(progress / 10)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                        {progress}%
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${stage === 4 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default ModuleCard;
