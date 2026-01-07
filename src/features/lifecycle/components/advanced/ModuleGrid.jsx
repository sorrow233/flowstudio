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
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Layers size={48} strokeWidth={1} />
                <p className="mt-4 font-light">No modules defined.</p>
                <p className="text-sm">Import an architecture blueprint to begin.</p>
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
