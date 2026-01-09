import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Check, Clock, Box, Shield, Globe, Server, Database, Layout, Activity, ChevronRight } from 'lucide-react';

const STAGE_LABELS = {
    1: { label: 'Prototype', color: 'bg-gray-100 text-gray-500' },
    2: { label: 'Alpha', color: 'bg-blue-50 text-blue-600' },
    3: { label: 'Beta', color: 'bg-purple-50 text-purple-600' },
    4: { label: 'Stable', color: 'bg-emerald-50 text-emerald-600' },
    5: { label: 'Optimization', color: 'bg-amber-50 text-amber-600' },
};

const MODULE_ICONS = {
    'frontend': Layout,
    'backend': Server,
    'database': Database,
    'security': Shield,
    'api': Globe,
    'feature': Box,
    'other': Activity
};

const ModuleList = ({ modules, onModuleClick, onDeleteModule }) => {
    if (modules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-100 rounded-[2rem]">
                <p className="font-light">No modules yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <div className="col-span-1">Icon</div>
                <div className="col-span-4">Module Name</div>
                <div className="col-span-2">Stage</div>
                <div className="col-span-3">Progress</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* List Items */}
            <AnimatePresence>
                {modules.map((module) => {
                    const Icon = (() => {
                        const type = module.category?.toLowerCase() || 'other';
                        for (const [key, I] of Object.entries(MODULE_ICONS)) {
                            if (type.includes(key)) return I;
                        }
                        return Activity;
                    })();

                    const stageInfo = STAGE_LABELS[module.stage] || STAGE_LABELS[1];

                    return (
                        <motion.div
                            layoutId={`module-list-${module.id}`}
                            key={module.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => onModuleClick(module)}
                            className="group flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center px-6 py-4 bg-white border border-gray-50 rounded-2xl hover:shadow-xl hover:shadow-red-500/10 hover:border-red-200 transition-all cursor-pointer ring-1 ring-transparent hover:ring-red-50 relative"
                        >
                            {/* Icon */}
                            <div className="col-span-12 md:col-span-1 flex items-center gap-3 md:gap-0">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                                    <Icon size={18} />
                                </div>
                                <div className="md:hidden flex-1">
                                    <h3 className="font-medium text-gray-900">{module.name}</h3>
                                </div>
                            </div>

                            {/* Name & Desc */}
                            <div className="col-span-12 md:col-span-4 pl-12 md:pl-0 -mt-10 md:mt-0 w-full">
                                <h3 className="hidden md:block font-medium text-gray-900">{module.name}</h3>
                                <p className="text-xs text-gray-400 truncate pr-4">{module.description || 'No description'}</p>
                            </div>

                            {/* Stage */}
                            <div className="col-span-6 md:col-span-2 pl-12 md:pl-0">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${stageInfo.color}`}>
                                    {stageInfo.label}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="col-span-6 md:col-span-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${module.progress === 100 ? 'bg-red-500' : 'bg-red-400'}`}
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-gray-400 w-8">{module.progress}%</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-4 right-4 md:static col-span-12 md:col-span-2 flex justify-end items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                    <Edit2 size={16} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete module?')) onDeleteModule(module.id);
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default ModuleList;
