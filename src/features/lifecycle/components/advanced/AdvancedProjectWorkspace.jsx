import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, Activity, Zap, CheckCircle2, X, Plus, Box, AlignJustify, Grid } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ModuleGrid from './ModuleGrid';
import ModuleList from './ModuleList';
import ArchitectureImportModal from './ArchitectureImportModal';
import ModuleDetailModal from './ModuleDetailModal';
import ModuleLibraryModal from './ModuleLibraryModal';

const AdvancedProjectWorkspace = ({ project, onClose, updateProject }) => {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Undo History Stack (Max 20 steps, session only)
    const [history, setHistory] = useState([]);
    const [showUndo, setShowUndo] = useState(false);

    const modules = project.modules || [];

    // --- Actions ---

    const pushSnapshot = () => {
        const currentModules = project.modules || [];
        setHistory(prev => {
            const newHistory = [...prev, currentModules];
            return newHistory.slice(-20); // Keep max 20 snapshots
        });
        setShowUndo(true);
    };

    const handleImportModules = (newModules) => {
        // Enhance modules with IDs and initial state
        const enhancedModules = newModules.map(m => ({
            id: uuidv4(),
            ...m,
            stage: 1,      // 1-5 Scale
            progress: 0,   // 0-100%
            tasks: []
        }));

        pushSnapshot();

        const currentModules = project.modules || [];
        // Append
        const updatedModules = [...currentModules, ...enhancedModules];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleAddFromLibrary = (newModules) => {
        pushSnapshot();
        const currentModules = project.modules || [];
        const updatedModules = [...currentModules, ...newModules];
        updateProject(project.id, { modules: updatedModules });
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const previousState = history[history.length - 1];
            const newHistory = history.slice(0, -1);

            updateProject(project.id, { modules: previousState });
            setHistory(newHistory);

            if (newHistory.length === 0) setShowUndo(false);
        }
    };

    const handleUpdateModule = (moduleId, updates) => {
        // Only snapshot for significant changes if desired, but for now snapshot everything
        // Note: For frequent text updates, this might be too aggressive. 
        // We generally snapshot on 'Save' or 'Delete' rather than every keystroke if it was real-time.
        // But since this is passed to a modal 'onUpdate', it happens on Save.
        pushSnapshot();

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
        pushSnapshot();
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
        pushSnapshot();
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
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16 relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-4 -right-4 md:static md:order-last p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Network size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Rapid Iteration</span>
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

                        {/* Controls */}
                        <div className="flex flex-wrap gap-2 mt-6 xl:mt-0 items-center bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 backdrop-blur-md">
                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-3xl mr-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <AlignJustify size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleCreateModule}
                                className="group flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-900 rounded-[2rem] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                                    <Plus size={14} strokeWidth={2} />
                                </div>
                                <span className="font-medium tracking-wide text-xs">Add</span>
                            </button>

                            <button
                                onClick={() => setIsLibraryOpen(true)}
                                className="group flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-[2rem] hover:bg-blue-100 transition-all shadow-sm hover:shadow-md border border-blue-100"
                            >
                                <div className="p-1 bg-white rounded-full transition-colors">
                                    <Box size={14} strokeWidth={2} />
                                </div>
                                <span className="font-medium tracking-wide text-xs">Library</span>
                            </button>

                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="group flex items-center justify-center w-12 h-12 bg-gray-900 text-white rounded-full hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                title="AI Architect Import"
                            >
                                <Sparkles size={18} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="min-h-[500px]">
                        {viewMode === 'grid' ? (
                            <ModuleGrid
                                modules={modules}
                                onModuleClick={handleModuleClick}
                            />
                        ) : (
                            <ModuleList
                                modules={modules}
                                onModuleClick={handleModuleClick}
                                onDeleteModule={handleDeleteModule}
                            />
                        )}
                    </div>
                </div>

                {/* Internal Modals */}
                <ArchitectureImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImportModules}
                    currentModules={modules}
                />

                {/* Undo Toast */}
                <AnimatePresence>
                    {showUndo && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl"
                        >
                            <span className="text-sm">
                                {history.length > 0 ? `Change applied (${history.length} in stack)` : 'Modules updated.'}
                            </span>
                            <button
                                onClick={handleUndo}
                                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Undo {history.length > 1 && `(${history.length})`}
                            </button>
                            <button onClick={() => setShowUndo(false)} className="text-gray-500 hover:text-white">
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ModuleLibraryModal
                    isOpen={isLibraryOpen}
                    onClose={() => setIsLibraryOpen(false)}
                    onAddModule={handleAddFromLibrary}
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
