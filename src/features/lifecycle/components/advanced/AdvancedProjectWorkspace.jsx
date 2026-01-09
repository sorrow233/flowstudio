import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Network, Sparkles, Activity, Zap, CheckCircle2, X, Plus, Box, AlignJustify, Grid, LayoutGrid, List, Trophy, Settings, ChevronRight } from 'lucide-react';

import AdvancedStageNavigation from './AdvancedStageNavigation';
import ModuleGrid from './ModuleGrid';
import ModuleList from './ModuleList';
import ArchitectureImportModal from './ArchitectureImportModal';
import ModuleDetailModal from './ModuleDetailModal';
import ModuleLibraryModal from './ModuleLibraryModal';
import ProjectSettingsModal from './ProjectSettingsModal';

const DEFAULT_STAGES = [
    { id: 'design', name: 'Design', status: 'in-progress', color: '#EC4899', icon: 'pen-tool' },
    { id: 'development', name: 'Development', status: 'pending', color: '#3B82F6', icon: 'code' },
    { id: 'polish', name: 'Polish', status: 'pending', color: '#F59E0B', icon: 'sparkles' }
];

const AdvancedProjectWorkspace = ({ project, onClose, updateProject, onGraduate, onDeleteProject }) => {
    // Stage Management
    const stages = (project.customStages && project.customStages.length > 0) ? project.customStages : DEFAULT_STAGES;
    const [activeStageId, setActiveStageId] = useState(stages[0]?.id);

    // UI State
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [newGoalInput, setNewGoalInput] = useState('');

    // Last Edited Logic
    const [lastEdited, setLastEdited] = useState(null);

    useEffect(() => {
        if (project.updatedAt) {
            setLastEdited(new Date(project.updatedAt));
        }
    }, [project.updatedAt]);

    // Ensure active stage is valid
    useEffect(() => {
        if (!activeStageId && stages.length > 0) {
            setActiveStageId(stages[0].id);
        } else if (activeStageId && !stages.find(s => s.id === activeStageId)) {
            setActiveStageId(stages[0]?.id);
        }
    }, [stages, activeStageId]);

    const activeStage = stages.find(s => s.id === activeStageId);
    const modules = project.modules || [];

    // Filter modules by stage
    // Fallback: if module has no stageId, show it in the first stage
    const filteredModules = modules.filter(m => {
        if (m.stageId) return m.stageId === activeStageId;
        return activeStageId === stages[0]?.id;
    });

    // --- Actions ---

    const pushSnapshot = () => {
        setLastEdited(new Date());
    };

    const handleUpdateStages = (newStages) => {
        pushSnapshot();
        updateProject(project.id, { customStages: newStages });
        // If current active stage was deleted, switch to the first one
        if (activeStageId && !newStages.find(s => s.id === activeStageId)) {
            setActiveStageId(newStages[0]?.id);
        }
    };

    const handleImportModules = (newModulesDesc) => {
        pushSnapshot();
        const enhancedModules = newModulesDesc.map(m => ({
            id: uuidv4(),
            ...m,
            stageId: activeStageId, // Link to current stage
            progress: 0,
            tasks: []
        }));
        const updatedModules = [...modules, ...enhancedModules];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleAddGoal = () => {
        if (!newGoalInput.trim()) return;
        pushSnapshot();

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

    const handleAddFromLibrary = (newModules) => {
        pushSnapshot();
        const enhanced = newModules.map(m => ({ ...m, stageId: activeStageId }));
        const updatedModules = [...modules, ...enhanced];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleUpdateModule = (moduleId, updates) => {
        pushSnapshot();
        const updatedModules = modules.map(m =>
            m.id === moduleId ? { ...m, ...updates } : m
        );
        updateProject(project.id, { modules: updatedModules });
    };

    const handleDeleteModule = (moduleId) => {
        pushSnapshot();
        const updatedModules = modules.filter(m => m.id !== moduleId);
        updateProject(project.id, { modules: updatedModules });
        setEditingModule(null);
    };

    const handleDeleteProject = (projectId) => {
        if (onDeleteProject) {
            onDeleteProject(projectId);
            onClose();
        }
    };

    // --- System Health Calculation for Header ---
    const totalCurrentStageModules = filteredModules.length;
    const avgProgress = totalCurrentStageModules > 0
        ? Math.round(filteredModules.reduce((acc, m) => acc + (m.progress || 0), 0) / totalCurrentStageModules)
        : 0;
    const stableModules = filteredModules.filter(m => m.progress === 100).length;

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
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                                    {activeStage ? activeStage.name : 'Pipeline'}
                                </h2>
                                {/* Quick Stats */}
                                <div className="flex items-center gap-3 px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5">
                                    <Activity size={12} className="text-gray-400" />
                                    <span className="text-xs font-mono text-gray-500">{avgProgress}%</span>
                                    <div className="w-px h-3 bg-gray-200 dark:bg-white/10" />
                                    <span className="text-xs font-mono text-gray-500">{stableModules}/{totalCurrentStageModules}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl p-1">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={16} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
                            </div>

                            <button
                                onClick={() => setIsLibraryOpen(true)}
                                className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Box size={14} />
                                Library
                            </button>

                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl hover:scale-105 transition-transform"
                                title="AI Import"
                            >
                                <Sparkles size={20} />
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 text-gray-300 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                        {stages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Network size={32} className="text-gray-300" strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2">Wait, no stages?</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">Please add a stage in the sidebar to begin.</p>
                            </div>
                        ) : filteredModules.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Box size={48} className="text-gray-200 mb-4" strokeWidth={1} />
                                <p className="text-sm font-light">No modules in this stage.</p>
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

                    {/* Quick Input Bar */}
                    <div className="p-8 border-t border-gray-100 dark:border-white/5 absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md z-20">
                        <div className="max-w-4xl mx-auto relative group">
                            <input
                                type="text"
                                value={newGoalInput}
                                onChange={(e) => setNewGoalInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                placeholder={`Add a module to ${activeStage?.name || 'stage'}...`}
                                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[1.5rem] pl-6 pr-16 py-4 text-lg font-light focus:ring-4 focus:ring-red-500/5 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
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
