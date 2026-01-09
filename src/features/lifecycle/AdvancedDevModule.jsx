import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, Box, Activity, Trophy, Plus, CheckCircle2, X, LayoutGrid, Check, ChevronRight } from 'lucide-react';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useSync } from '../sync/SyncContext';
import AdvancedProjectWorkspace from './components/advanced/AdvancedProjectWorkspace';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { v4 as uuidv4 } from 'uuid';

const AdvancedDevModule = () => {
    const navigate = useNavigate();
    const { doc } = useSync();
    const { projects: allProjects, updateProject, removeProject } = useSyncedProjects(doc, 'all_projects');

    // Filter projects for Advanced Stage
    const finalProjects = React.useMemo(() =>
        allProjects.filter(p => ['advanced', 'final', 'modules'].includes(p.stage)),
        [allProjects]);

    // Independent Goals
    const standaloneGoals = React.useMemo(() =>
        allProjects.filter(p => p.stage === 'advanced_goal'),
        [allProjects]);

    const { t } = useTranslation();

    // UI States
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemType, setNewItemType] = useState('flow'); // 'flow' | 'goal'

    const handleCreate = () => {
        if (!newItemTitle.trim()) return;
        const newId = uuidv4();
        const timestamp = new Date().toISOString();

        if (newItemType === 'flow') {
            const newFlow = {
                id: newId,
                title: newItemTitle,
                stage: 'advanced',
                customStages: [
                    { id: '1', name: 'Planning', status: 'in-progress', dotColor: '#A855F7' }
                ],
                modules: [],
                createdAt: timestamp,
                updatedAt: timestamp,
                desc: 'Custom Architectural Flow'
            };
            updateProject(newId, newFlow);
        } else {
            const newGoal = {
                id: newId,
                title: newItemTitle,
                stage: 'advanced_goal',
                completed: false,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            updateProject(newId, newGoal);
        }

        setIsCreateOpen(false);
        setNewItemTitle('');
    };

    const toggleGoal = (e, goal) => {
        e.stopPropagation();
        updateProject(goal.id, { completed: !goal.completed });
    };

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-red-500 dark:text-red-400 mb-2 tracking-tight">Advanced Workspace</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">Design custom flows and high-level objectives.</p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="group px-6 py-3 bg-red-600 text-white rounded-full shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span className="font-bold text-sm tracking-wide">New Item</span>
                </button>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-md"
                            onClick={() => setIsCreateOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-800"
                        >
                            <h3 className="text-xl font-light mb-8">What shall we build?</h3>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setNewItemType('flow')}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left ${newItemType === 'flow' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-50 dark:border-gray-800 hover:border-gray-100'}`}
                                >
                                    <LayoutGrid className={`mb-4 ${newItemType === 'flow' ? 'text-red-500' : 'text-gray-300'}`} />
                                    <span className="block font-bold text-sm">Custom Flow</span>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Multi-stage architecture</span>
                                </button>
                                <button
                                    onClick={() => setNewItemType('goal')}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left ${newItemType === 'goal' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-50 dark:border-gray-800 hover:border-gray-100'}`}
                                >
                                    <CheckCircle2 className={`mb-4 ${newItemType === 'goal' ? 'text-red-500' : 'text-gray-300'}`} />
                                    <span className="block font-bold text-sm">Goal Node</span>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Standalone objective</span>
                                </button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                placeholder={`Name your ${newItemType}...`}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-red-500/10 mb-8 transition-all"
                            />

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsCreateOpen(false)} className="px-6 py-3 text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newItemTitle.trim()}
                                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold disabled:opacity-30 transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Sections */}
            <div className="space-y-16">

                {/* 1. Flows (The Cards) */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Activity size={18} className="text-red-500" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Flows</h3>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                        <span className="text-xs font-mono text-gray-300">{finalProjects.length}</span>
                    </div>

                    {finalProjects.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] p-12 text-center text-gray-300">
                            <p className="font-light">No custom flows established.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {finalProjects.map((project) => (
                                <motion.div
                                    layoutId={`advanced-card-${project.id}`}
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-red-100 transition-all cursor-pointer relative h-[300px] flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Network size={24} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-2 line-clamp-1">{project.title}</h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">{project.desc}</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-gray-50 dark:border-gray-800">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                            <span>Stage {project.customStages?.length || 0}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-200 group-hover:text-red-500 transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 2. Standalone Goals */}
                {standaloneGoals.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-3 mb-8">
                            <CheckCircle2 size={18} className="text-green-500" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Objectives</h3>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {standaloneGoals.map(goal => (
                                <motion.div
                                    key={goal.id}
                                    onClick={(e) => toggleGoal(e, goal)}
                                    className={`
                                        p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4
                                        ${goal.completed
                                            ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-transparent opacity-60'
                                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5'}
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${goal.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}
                                    `}>
                                        {goal.completed && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <span className={`text-sm font-medium ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {goal.title}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete goal?')) removeProject(goal.id); }}
                                        className="ml-auto p-1 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}

                            <button
                                onClick={() => { setNewItemType('goal'); setIsCreateOpen(true); }}
                                className="p-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-300 hover:text-gray-500 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                <span className="text-sm font-medium">Add Goal</span>
                            </button>
                        </div>
                    </section>
                )}

            </div>

            {/* Workspace Modal */}
            <AnimatePresence>
                {selectedProject && (() => {
                    const liveProject = allProjects.find(p => p.id === selectedProject.id) || selectedProject;
                    return (
                        <AdvancedProjectWorkspace
                            project={liveProject}
                            onClose={() => setSelectedProject(null)}
                            updateProject={updateProject}
                            onDeleteProject={removeProject}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedDevModule;
