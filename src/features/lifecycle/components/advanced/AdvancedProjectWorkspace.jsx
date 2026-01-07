import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, Activity, Zap, CheckCircle2, X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ModuleGrid from './ModuleGrid';
import ArchitectureImportModal from './ArchitectureImportModal';
import ModuleDetailModal from './ModuleDetailModal';

const AdvancedProjectWorkspace = ({ project, onClose, updateProject }) => {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

    const modules = project.modules || [];

    // --- Actions ---

    const handleImportModules = (newModules) => {
        // Enhance modules with IDs and initial state
        const enhancedModules = newModules.map(m => ({
            id: uuidv4(),
            ...m,
            stage: 1,      // 1-5 Scale
            progress: 0,   // 0-100%
            tasks: []
        }));

        const currentModules = project.modules || [];
        // Append
        const updatedModules = [...currentModules, ...enhancedModules];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleUpdateModule = (moduleId, updates) => {
        const currentModules = project.modules || [];
        const exists = currentModules.find(m => m.id === moduleId);

        let updatedModules;
        if (exists) {
            updatedModules = currentModules.map(m =>
                m.id === moduleId ? { ...m, ...updates } : m
            );
        } else {
            // Create new
            updatedModules = [...currentModules, { id: moduleId, ...updates }];
        }
        updateProject(project.id, { modules: updatedModules });
    };

    const handleCreateModule = () => {
        const newModule = {
            id: uuidv4(),
            name: 'New Module',
            description: '',
            category: 'feature',
            stage: 1,
            progress: 0,
            tasks: []
        };
        setEditingModule(newModule);
    };

    const handleDeleteModule = (moduleId) => {
        const currentModules = project.modules || [];
        const updatedModules = currentModules.filter(m => m.id !== moduleId);
        updateProject(project.id, { modules: updatedModules });
        setEditingModule(null);
    };

    const handleModuleClick = (module) => {
        setEditingModule(module);
    };

    // --- System Health Calculation ---
    const totalModules = modules.length;
    const avgProgress = totalModules > 0
        ? Math.round(modules.reduce((acc, m) => acc + (m.progress || 0), 0) / totalModules)
        : 0;
    const stableModules = modules.filter(m => m.stage >= 4).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Main Window */}
            <motion.div
                layoutId={`advanced-card-${project.id}`}
                className="w-full max-w-[1600px] h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col ring-1 ring-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">

                    {/* Header & Dashboard */}
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
                        {/* Close Button MOVED OUT to absolute in container */}

                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Network size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">System Architecture</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-thin text-gray-900 tracking-tight mb-6">
                                {project.title}
                            </h2>

                            {/* System Health Dashboard */}
                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-4 pr-6 border-r border-gray-100">
                                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-light text-gray-900">{avgProgress}%</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">System Maturity</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pr-6 border-r border-gray-100">
                                    <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-light text-gray-900">{stableModules}/{totalModules}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Production Ready</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-light text-gray-900">{totalModules}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Modules</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 xl:mt-0">
                            <button
                                onClick={handleCreateModule}
                                className="group flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-900 rounded-[2rem] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                                    <Plus size={16} strokeWidth={2} />
                                </div>
                                <span className="font-medium tracking-wide text-sm">Add Module</span>
                            </button>
                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[2rem] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                <Sparkles size={18} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                                <span className="font-medium tracking-wide">AI Architect Import</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Grid Content */}
                    <div className="min-h-[500px]">
                        <ModuleGrid
                            modules={modules}
                            onModuleClick={handleModuleClick}
                        />
                    </div>
                </div>

                {/* Internal Modals */}
                <ArchitectureImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImportModules}
                />

                <ModuleDetailModal
                    isOpen={!!editingModule}
                    module={editingModule}
                    onClose={() => setEditingModule(null)}
                    onUpdate={handleUpdateModule}
                    onDelete={handleDeleteModule}
                />
            </motion.div>
        </div>
    );
};

export default AdvancedProjectWorkspace;
