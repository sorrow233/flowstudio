import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, FolderDot, Plus, Settings2, Activity, Zap, CheckCircle2 } from 'lucide-react';
import ModuleGrid from './components/advanced/ModuleGrid';
import ArchitectureImportModal from './components/advanced/ArchitectureImportModal';
import ModuleDetailModal from './components/advanced/ModuleDetailModal';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { useSync } from '../sync/SyncContext';
import { v4 as uuidv4 } from 'uuid';

const AdvancedDevModule = () => {
    // --- Data Layer (Context + Hook) ---
    const { doc } = useSync();

    // We will store advanced modules INSIDE the project object in the 'primary_projects' list ideally,
    const { projects, updateProject } = useSyncedProjects(doc, 'primary_projects');

    // State for selected project context
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Detail Modal State
    const [editingModule, setEditingModule] = useState(null);

    // Derived: Current Project
    const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
    const modules = currentProject?.modules || [];

    // Effect: Auto-select first project if available and none selected
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // --- Actions ---

    const handleImportModules = (newModules) => {
        if (!currentProject) return;

        // Enhance modules with IDs and initial state
        const enhancedModules = newModules.map(m => ({
            id: uuidv4(),
            ...m,
            stage: 1,      // 1-5 Scale
            progress: 0,   // 0-100%
            tasks: []
        }));

        const currentModules = currentProject.modules || [];
        // Append
        const updatedModules = [...currentModules, ...enhancedModules];
        updateProject(currentProject.id, { modules: updatedModules });
    };

    const handleUpdateModule = (moduleId, updates) => {
        if (!currentProject) return;
        const currentModules = currentProject.modules || [];
        const updatedModules = currentModules.map(m =>
            m.id === moduleId ? { ...m, ...updates } : m
        );
        updateProject(currentProject.id, { modules: updatedModules });
    };

    const handleDeleteModule = (moduleId) => {
        if (!currentProject) return;
        const currentModules = currentProject.modules || [];
        const updatedModules = currentModules.filter(m => m.id !== moduleId);
        updateProject(currentProject.id, { modules: updatedModules });
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


    // --- Empty State ---
    if (!currentProject) {
        return (
            <div className="max-w-7xl mx-auto pt-20 px-6 text-center text-gray-400 font-light">
                <FolderDot size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active projects found in Primary Dev.</p>
                <p className="text-sm">Graduate a project to begin advanced engineering.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pt-10 px-6 md:px-12 pb-20">
            {/* Header & Dashboard */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
                <div className="flex-1">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Network size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">System Architecture</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-thin text-gray-900 tracking-tight">
                            {currentProject.title}
                        </h2>
                        {projects.length > 1 && (
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="text-sm bg-gray-50 border-none rounded-lg text-gray-500 font-medium focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        )}
                    </div>

                    {/* System Health Dashboard */}
                    <div className="flex gap-6 mt-8">
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-light text-gray-900">{avgProgress}%</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">System Maturity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-light text-gray-900">{stableModules}/{totalModules}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Production Ready</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-light text-gray-900">{totalModules}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Modules</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="group flex items-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-[2rem] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <Sparkles size={18} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium tracking-wide">AI Architect Import</span>
                    </button>
                </div>
            </div>

            {/* Main Grid Content */}
            <ModuleGrid
                modules={modules}
                onModuleClick={handleModuleClick}
            />

            {/* Modals */}
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
        </div>
    );
};

export default AdvancedDevModule;
