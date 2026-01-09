import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, X, Plus, Box, LayoutGrid, List, Settings, ChevronLeft, ChevronUp, Terminal } from 'lucide-react';

import AdvancedStageNavigation from './AdvancedStageNavigation';
import ModuleGrid from './ModuleGrid';
import ModuleList from './ModuleList';
import ArchitectureImportModal from './ArchitectureImportModal';
import ModuleDetailModal from './ModuleDetailModal';
import ModuleLibraryModal from './ModuleLibraryModal';
import ProjectSettingsModal from './ProjectSettingsModal';

const AdvancedProjectWorkspace = ({ project, onClose, updateProject, onGraduate, onDeleteProject }) => {
    // Stage Management
    const stages = project.customStages || [];
    const [activeStageId, setActiveStageId] = useState(stages.length > 0 ? stages[0].id : null);

    // UI State
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // New Goal Input
    const [newGoalInput, setNewGoalInput] = useState('');

    const modules = project.modules || [];
    const activeStage = stages.find(s => s.id === activeStageId);

    // Initial Active Stage
    useEffect(() => {
        if (!activeStageId && stages.length > 0) {
            setActiveStageId(stages[0].id);
        }
    }, [stages]);

    // --- Actions ---

    const handleUpdateStages = (newStages) => {
        updateProject(project.id, { customStages: newStages });
        if (newStages.length > 0 && (!activeStageId || !newStages.find(s => s.id === activeStageId))) {
            setActiveStageId(newStages[0].id);
        }
    };

    const handleAddGoal = () => {
        if (!newGoalInput.trim()) return;

        const newModule = {
            id: uuidv4(),
            name: newGoalInput,
            description: '',
            category: 'goal',
            stageId: activeStageId,
            progress: 0,
            tasks: [],
            createdAt: new Date().toISOString()
        };

        const updatedModules = [...modules, newModule];
        updateProject(project.id, { modules: updatedModules });
        setNewGoalInput('');
    };

    const handleUpdateModule = (moduleId, updates) => {
        const updatedModules = modules.map(m =>
            m.id === moduleId ? { ...m, ...updates } : m
        );
        updateProject(project.id, { modules: updatedModules });
    };

    const handleAddFromLibrary = (newModules) => {
        const enhanced = newModules.map(m => ({ ...m, stageId: activeStageId }));
        const updatedModules = [...modules, ...enhanced];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleDeleteModule = (moduleId) => {
        const updatedModules = modules.filter(m => m.id !== moduleId);
        updateProject(project.id, { modules: updatedModules });
        setEditingModule(null);
    };

    const handleImportModules = (newModulesDesc) => {
        const enhancedModules = newModulesDesc.map(m => ({
            id: uuidv4(),
            ...m,
            stageId: activeStageId,
            progress: 0,
            tasks: []
        }));
        const updatedModules = [...modules, ...enhancedModules];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleDeleteProject = (projectId) => {
        if (onDeleteProject) {
            onDeleteProject(projectId);
            onClose();
        }
    };

    // Filtered Modules for current view
    const filteredModules = modules.filter(m => activeStageId ? m.stageId === activeStageId : true);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 pointer-events-auto overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#F2F2F2] dark:bg-black/95"
                onClick={onClose}
            />

            <motion.div
                layoutId={`advanced-card-${project.id}`}
                className="w-full h-full bg-white dark:bg-[#0A0A0A] md:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row transition-all duration-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Sidebar: Custom Stages (Restyled to match screenshot) */}
                <AdvancedStageNavigation
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                    onUpdateStages={handleUpdateStages}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#121212] relative overflow-hidden">

                    {/* Top UI Elements (Matching Screenshot) */}
                    <div className="p-12 pb-0 flex justify-between items-start">
                        <div className="space-y-6">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-50 dark:bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <ChevronLeft size={14} /> Back
                            </button>

                            <div>
                                {activeStage && (
                                    <span className="px-3 py-1 bg-red-500 text-[10px] font-bold text-white uppercase tracking-widest rounded-md shadow-lg shadow-red-500/30 mb-4 inline-block">
                                        {activeStage.name} Phase
                                    </span>
                                )}
                                <h2 className="text-6xl font-light text-gray-900 dark:text-white tracking-tighter mb-2">
                                    {project.title}
                                </h2>
                                <p className="text-gray-400 text-lg font-light">{project.desc || 'Architecting the final vision.'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-12">
                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="group flex items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 pl-6 pr-8 py-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl">
                                    <Terminal size={20} />
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Import Command</span>
                            </button>

                            <ChevronUp size={24} className="text-gray-100 dark:text-gray-800 animate-bounce" />
                        </div>
                    </div>

                    {/* Canvas Area (Matching Screenshot Layout) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-12 pt-8">
                        {stages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Plus size={64} strokeWidth={1} className="mb-4" />
                                <p className="text-xl font-light">Create your first stage to begin.</p>
                            </div>
                        ) : filteredModules.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-10 border border-gray-100 dark:border-white/5 shadow-inner animate-pulse">
                                    <Edit2 size={32} className="text-gray-200" strokeWidth={1} />
                                </div>
                                <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">Architect's Blank Canvas</h3>
                                <p className="max-w-md text-gray-400 text-sm leading-relaxed font-light">
                                    Begin by defining the core routes and layout components. A strong foundation prevents future debt.
                                </p>

                                <button
                                    onClick={() => setIsImportOpen(true)}
                                    className="mt-12 group flex items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-gray-50 dark:border-white/5 px-6 py-3 rounded-2xl shadow-sm hover:shadow-lg transition-all"
                                >
                                    <Terminal size={16} className="text-red-500" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Import Command</span>
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="flex bg-gray-50 dark:bg-white/5 rounded-2xl p-1.5">
                                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#202020] text-red-500 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={18} /></button>
                                            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#202020] text-red-500 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
                                        </div>
                                        <button onClick={() => setIsLibraryOpen(true)} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"><Box size={18} /></button>
                                        <button onClick={() => setIsSettingsOpen(true)} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"><Settings size={18} /></button>
                                    </div>
                                </div>
                                <div className="pb-32">
                                    {viewMode === 'grid' ? (
                                        <ModuleGrid modules={filteredModules} onModuleClick={setEditingModule} />
                                    ) : (
                                        <ModuleList modules={filteredModules} onModuleClick={setEditingModule} onDeleteModule={handleDeleteModule} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Input Bar (Matching screenshot) */}
                    <div className="px-12 py-10 bg-gradient-to-t from-white via-white to-transparent dark:from-[#121212] dark:via-[#121212] absolute bottom-0 left-0 right-0">
                        <div className="max-w-4xl mx-auto relative group">
                            <input
                                type="text"
                                value={newGoalInput}
                                onChange={(e) => setNewGoalInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                placeholder={`Add a task to ${activeStage?.name || 'Skeleton'}...`}
                                className="w-full bg-[#f9f9f9] dark:bg-[#1A1A1A] border-none rounded-[2rem] pl-8 pr-16 py-6 text-xl font-light placeholder:text-gray-300 focus:ring-4 focus:ring-red-500/5 transition-all outline-none"
                            />
                            <div className="absolute right-4 top-4">
                                <button
                                    onClick={handleAddGoal}
                                    className="w-12 h-12 bg-white dark:bg-[#222] rounded-2xl flex items-center justify-center text-gray-200 group-hover:text-red-500 hover:shadow-xl transition-all active:scale-95"
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {editingModule && (
                        <ModuleDetailModal isOpen={!!editingModule} module={editingModule} onClose={() => setEditingModule(null)} onUpdate={handleUpdateModule} onDelete={handleDeleteModule} />
                    )}
                </AnimatePresence>

                <ArchitectureImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImport={handleImportModules} currentModules={modules} />
                <ModuleLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onAddModule={handleAddFromLibrary} />
                <ProjectSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} project={project} onUpdate={updateProject} onDelete={handleDeleteProject} />
            </motion.div>
        </div>
    );
};

export default AdvancedProjectWorkspace;
