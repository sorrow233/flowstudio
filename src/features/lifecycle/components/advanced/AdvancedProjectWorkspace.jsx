import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, Activity, Zap, CheckCircle2, X, Plus, Box, AlignJustify, Grid, LayoutGrid, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ModuleGrid from './ModuleGrid';
import ModuleList from './ModuleList';
import ArchitectureImportModal from './ArchitectureImportModal';
import ModuleDetailModal from './ModuleDetailModal';
import ModuleLibraryModal from './ModuleLibraryModal';

const CATEGORIES = [
    { id: 'frontend', label: 'Frontend', aliases: ['frontend', '前端'] },
    { id: 'backend', label: 'Backend', aliases: ['backend', '后端'] },
    { id: 'database', label: 'Database', aliases: ['database', '数据库'] },
    { id: 'core', label: 'Core', aliases: ['core', '核心'] },
    { id: 'feature', label: 'Features', aliases: ['feature', 'features', '功能'] },
    { id: 'integration', label: 'Integration', aliases: ['integration', '集成'] },
    { id: 'security', label: 'Security', aliases: ['security', '安全'] },
    { id: 'devops', label: 'DevOps', aliases: ['devops', '运维'] },
];

const AdvancedProjectWorkspace = ({ project, onClose, updateProject }) => {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Last Edited Logic
    const [lastEdited, setLastEdited] = useState(null);

    useEffect(() => {
        if (project.updatedAt) {
            setLastEdited(new Date(project.updatedAt));
        }
    }, [project.updatedAt]);

    const formatLastEdited = (date) => {
        if (!date) return '';
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return 'Today';
    };



    const modules = project.modules || [];

    // --- Actions ---

    const pushSnapshot = () => {
        setLastEdited(new Date());
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
            priority: 'Medium',
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
                <div className="flex flex-col h-full bg-white relative">
                    {/* Header */}
                    <div className="flex justify-between items-start px-8 py-6 border-b border-gray-100 bg-white z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Network size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Rapid Iteration</span>
                            </div>
                            <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-4">
                                {project.title}
                            </h2>

                            {/* System Health Dashboard */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-light text-gray-900">{avgProgress}%</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">System Maturity</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-light text-gray-900">{stableModules}/{totalModules}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Production Ready</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-light text-gray-900">{totalModules}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Modules</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* View Toggles */}
                            <div className="flex bg-gray-50 rounded-xl p-1 mr-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsLibraryOpen(true)}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <Box size={14} />
                                Library
                            </button>

                            <div className="h-8 w-px bg-gray-100 mx-1" />

                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                title="AI Architect Import"
                            >
                                <Sparkles size={20} />
                            </button>
                            <button
                                onClick={handleCreateModule}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                title="Add Custom Module"
                            >
                                <Plus size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/30">
                        {viewMode === 'grid' ? (
                            <div className="pb-20">
                                {CATEGORIES.map(category => {
                                    const categoryModules = modules.filter(m => {
                                        const cat = m.category?.toLowerCase();
                                        return category.aliases.some(alias => cat === alias || cat?.includes(alias));
                                    });
                                    if (categoryModules.length === 0) return null;

                                    return (
                                        <div key={category.id} className="mb-12">
                                            <div className="flex items-center gap-3 mb-6">
                                                <h3 className="text-xl font-light text-gray-900">{category.label}</h3>
                                                <div className="h-px flex-1 bg-gray-200/50" />
                                                <span className="text-xs font-bold text-gray-400 px-2 py-1 bg-white rounded-md shadow-sm border border-gray-100">
                                                    {categoryModules.length}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {categoryModules.map(module => (
                                                    <motion.div
                                                        layoutId={`module-${module.id}`}
                                                        key={module.id}
                                                        onClick={() => setEditingModule(module)}
                                                        className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                                                Edit
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${module.priority === 'High' ? 'bg-red-50 text-red-500' :
                                                                module.priority === 'Low' ? 'bg-gray-100 text-gray-500' :
                                                                    'bg-blue-50 text-blue-500'
                                                                }`}>
                                                                {module.category}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-light text-gray-900 mb-2 truncate">{module.name}</h3>
                                                        <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em] mb-6 font-light leading-relaxed">
                                                            {module.description || 'No description provided.'}
                                                        </p>

                                                        {/* Progress Bar */}
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-bold text-gray-300 uppercase tracking-wider">Progress</span>
                                                                <span className="font-mono text-gray-400">{module.progress}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${module.progress === 100 ? 'bg-emerald-400' : 'bg-blue-500'
                                                                        }`}
                                                                    style={{ width: `${module.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Fallback for Uncategorized */}
                                {modules.length > 0 && modules.filter(m => {
                                    const cat = m.category?.toLowerCase();
                                    return !CATEGORIES.some(c => c.aliases.some(alias => cat === alias || cat?.includes(alias)));
                                }).length > 0 && (
                                        <div className="mb-12">
                                            <div className="flex items-center gap-3 mb-6">
                                                <h3 className="text-xl font-light text-gray-900">Uncategorized</h3>
                                                <div className="h-px flex-1 bg-gray-200/50" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {modules.filter(m => {
                                                    const cat = m.category?.toLowerCase();
                                                    return !CATEGORIES.some(c => c.aliases.some(alias => cat === alias || cat?.includes(alias)));
                                                }).map(module => (
                                                    <motion.div
                                                        layoutId={`module-${module.id}`}
                                                        key={module.id}
                                                        onClick={() => setEditingModule(module)}
                                                        className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                                                Edit
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                                                {module.category || 'Other'}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-light text-gray-900 mb-2 truncate">{module.name}</h3>
                                                        <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em] mb-6 font-light leading-relaxed">
                                                            {module.description || 'No description provided.'}
                                                        </p>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-bold text-gray-300 uppercase tracking-wider">Progress</span>
                                                                <span className="font-mono text-gray-400">{module.progress}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${module.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Empty State */}
                                {modules.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[3rem]">
                                        <Sparkles size={48} className="mb-4 text-emerald-100" />
                                        <p className="text-lg font-light text-gray-400">Your architecture is empty</p>
                                        <p className="text-xs text-gray-300 mt-2 font-mono">
                                            Use AI Import or Library to get started
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ModuleList
                                modules={modules}
                                onModuleClick={setEditingModule}
                                onDeleteModule={handleDeleteModule}
                            />
                        )}
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
                </div>
            </motion.div>
        </div>
    );
};

export default AdvancedProjectWorkspace;
