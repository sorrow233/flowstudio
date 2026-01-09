import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Network, Sparkles, Activity, Zap, CheckCircle2, X, Plus, Box, AlignJustify, Grid, LayoutGrid, List, Trophy, Settings, ChevronRight, Check } from 'lucide-react';

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
            stageId: activeStageId, // Link to current stage
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                layoutId={`advanced-card-${project.id}`}
                className="w-full h-full md:w-[98vw] md:h-[96vh] bg-white dark:bg-black rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Sidebar: Custom Stages */}
                <AdvancedStageNavigation
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                    onUpdateStages={handleUpdateStages}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0A0A0A] relative overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Active Workspace</span>
                                <ChevronRight size={10} className="text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{project.title}</span>
                            </div>
                            <h2 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                                {activeStage ? activeStage.name : 'The Void'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl p-1">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-red-600 shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={16} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-red-600 shadow-sm' : 'text-gray-400'}`}><List size={16} /></button>
                            </div>

                            <button
                                onClick={() => setIsLibraryOpen(true)}
                                className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Box size={14} />
                                Library
                            </button>

                            <button onClick={() => setIsImportOpen(true)} className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl hover:scale-105 transition-transform"><Sparkles size={20} /></button>
                            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Settings size={20} /></button>
                            <button onClick={onClose} className="p-2.5 text-gray-300 hover:text-gray-500"><X size={20} /></button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                        {stages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Network size={32} className="text-gray-300" strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2">Architect's Blank Canvas</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">Define your first stage in the left sidebar to begin building your custom workflow.</p>
                            </div>
                        ) : filteredModules.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Box size={48} className="text-gray-200 mb-4" strokeWidth={1} />
                                <p className="text-sm font-light">No goals or modules in this stage.</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {viewMode === 'grid' ? (
                                    <ModuleGrid
                                        modules={filteredModules}
                                        onModuleClick={setEditingModule}
                                    />
                                ) : (
                                    <ModuleList
                                        modules={filteredModules}
                                        onModuleClick={setEditingModule}
                                        onDeleteModule={handleDeleteModule}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Input Bar (Matching screenshot) */}
                    <div className="p-8 border-t border-gray-100 dark:border-white/5">
                        <div className="max-w-4xl mx-auto relative group">
                            <input
                                type="text"
                                value={newGoalInput}
                                onChange={(e) => setNewGoalInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                placeholder={`Add a target to ${activeStage?.name || 'Workspace'}...`}
                                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[1.5rem] pl-6 pr-16 py-4 text-lg font-light focus:ring-4 focus:ring-red-500/5 transition-all outline-none"
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-2">
                                <button
                                    onClick={handleAddGoal}
                                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:shadow-lg transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {editingModule && (
                        <ModuleDetailModal
                            isOpen={!!editingModule}
                            module={editingModule}
                            onClose={() => setEditingModule(null)}
                            onUpdate={handleUpdateModule}
                            onDelete={handleDeleteModule}
                        />
                    )}
                </AnimatePresence>

                <ArchitectureImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImportModules}
                    currentModules={modules}
                />

                <ModuleLibraryModal
                    isOpen={isLibraryOpen}
                    onClose={() => setIsLibraryOpen(false)}
                    onAddModule={handleAddFromLibrary}
                />

                <ProjectSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    project={project}
                    onUpdate={updateProject}
                    onDelete={handleDeleteProject}
                />
            </motion.div>
        </div>
    );
};

export default AdvancedProjectWorkspace;
