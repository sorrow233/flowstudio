import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, FolderDot, Plus, Settings2 } from 'lucide-react';
import ModuleGrid from './components/advanced/ModuleGrid';
import ArchitectureImportModal from './components/advanced/ArchitectureImportModal';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { v4 as uuidv4 } from 'uuid';

const AdvancedDevModule = () => {
    // --- Data Layer ---
    // For this module, we need to know WHICH project we are working on.
    // In a real app, this might come from a route param or global selection.
    // For now, we'll pick the first "Active" Primary Project or use a local "Advanced Demo" if none.

    const { doc } = useSyncStore('flowstudio_v1');

    // We will store advanced modules INSIDE the project object in the 'primary_projects' list ideally,
    const { projects, updateProject } = useSyncedProjects(doc, 'primary_projects');

    // State for selected project context
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Derived: Current Project
    const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    // Effect: Auto-select first project if available and none selected
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

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

        // Merge with existing or replace? 
        // User workflow implies "Import Architecture" is an initialization step usually.
        // We'll append for safety.
        const currentModules = currentProject.modules || [];
        const updatedModules = [...currentModules, ...enhancedModules];

        updateProject(currentProject.id, { modules: updatedModules });
    };

    const handleModuleClick = (module) => {
        // Future: Open Module Detail / Micro-Lifecycle View
        console.log("Clicked module:", module);
        // For now, maybe just log or show a toast? Or we can implement a simple detail modal later.
    };

    // --- Empty State (No Project) ---
    if (!currentProject) {
        return (
            <div className="max-w-7xl mx-auto pt-20 px-6 text-center text-gray-400 font-light">
                <FolderDot size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active projects found in Primary Dev.</p>
                <p className="text-sm">Graduate a project to begin advanced engineering.</p>
            </div>
        );
    }

    const modules = currentProject.modules || [];

    return (
        <div className="max-w-[1600px] mx-auto pt-10 px-6 md:px-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Network size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">System Architecture</span>
                    </div>
                    <h2 className="text-4xl font-thin text-gray-900 tracking-tight flex items-center gap-4">
                        {currentProject.title}
                        {/* Project Selector (Simple Dropdown if needed) */}
                        {projects.length > 1 && (
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="text-sm bg-gray-50 border-none rounded-lg text-gray-500 font-medium focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        )}
                    </h2>
                    <p className="text-gray-400 mt-2 font-light max-w-xl leading-relaxed">
                        Visualize and manage the complexity of your system.
                        Tracking {modules.length} distributed modules.
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* Add Module Manually (Placeholder) */}
                    {/* <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                        <Plus size={20} />
                    </button> */}

                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="group flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
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
        </div>
    );
};

export default AdvancedDevModule;
