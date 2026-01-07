import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleCard from './ModuleCard';
import { Layers } from 'lucide-react';

const ModuleGrid = ({ modules, onModuleClick }) => {
    // Group modules by category (domain)
    const groupedGroups = modules.reduce((groups, module) => {
        const category = module.category || 'Uncategorized';
        if (!groups[category]) groups[category] = [];
        groups[category].push(module);
        return groups;
    }, {});

    if (Object.keys(groupedGroups).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-100 rounded-[2rem]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Layers size={32} strokeWidth={1} className="text-gray-400" />
                </div>
                <p className="mt-2 font-light text-lg text-gray-900">System Architecture Empty</p>
                <p className="text-sm text-gray-400 max-w-sm text-center">Import an AI blueprint or manually add modules to begin engineering.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {Object.entries(groupedGroups).map(([category, categoryModules], index) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                            {category}
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryModules.map(module => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onClick={() => onModuleClick(module)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModuleGrid;
