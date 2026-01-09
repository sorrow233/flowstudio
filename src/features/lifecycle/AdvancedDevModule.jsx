import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, FolderDot, Box, Activity, Trophy } from 'lucide-react';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useSync } from '../sync/SyncContext';
import AdvancedProjectWorkspace from './components/advanced/AdvancedProjectWorkspace';
import { useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useTranslation } from '../i18n';

const AdvancedDevModule = () => {
    const navigate = useNavigate();
    // --- Data Layer ---
    const { doc } = useSync();
    const { projects: allProjects, updateProject, removeProject } = useSyncedProjects(doc, 'all_projects');

    // Filter for Modules (formerly Final/Culmination)
    const finalProjects = React.useMemo(() =>
        allProjects.filter(p => ['advanced', 'final', 'commercial', 'modules'].includes(p.stage)),
        [allProjects]);

    // For compatibility with some local variables if they exist
    const projects = allProjects;

    const { t } = useTranslation();
    const { openConfirm, ConfirmDialogComponent } = useConfirmDialog(); // Fix: Import ConfirmDialog hook

    // --- State ---
    const [selectedProject, setSelectedProject] = useState(null);

    // --- Empty State ---
    if (finalProjects.length === 0) {
        return (
            <div className="max-w-7xl mx-auto pt-20 px-6 text-center text-gray-400 font-light">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={40} className="text-gray-300" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">{t('final.emptyState')}</h3>
                <p className="max-w-md mx-auto leading-relaxed">
                    Graduate projects from the Production Pipeline by completing all 5 stages.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-red-500 dark:text-red-400 mb-2 tracking-tight">{t('final.title')}</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">{t('final.subtitle')}</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-thin text-gray-900">{finalProjects.length}</span>
                    <span className="text-gray-400 text-xs uppercase tracking-widest ml-2">Final Projects</span>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {finalProjects.map((project) => {
                    const tasks = project.tasks || [];
                    const taskCount = tasks.length;
                    const doneCount = tasks.filter(t => t.done).length;
                    const progress = taskCount > 0
                        ? Math.round((doneCount / taskCount) * 100)
                        : 0;

                    return (
                        <motion.div
                            layoutId={`advanced-card-${project.id}`}
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] overflow-hidden hover:shadow-xl hover:shadow-red-900/5 dark:hover:shadow-red-900/10 transition-all duration-500 cursor-pointer relative h-[240px] flex flex-col ring-1 ring-transparent hover:ring-red-50 dark:hover:ring-red-900/20 hover:-translate-y-1"
                        >
                            {/* Card Background - Subtle & Cinematic */}
                            <div className="absolute inset-0 z-0 h-32">
                                {project.bgImage ? (
                                    <div className="w-full h-full relative">
                                        <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-gray-900 dark:via-gray-900/60" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900" />
                                )}
                            </div>

                            <div className="p-6 relative z-10 flex flex-col h-full mt-auto">
                                <div className="mb-auto pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
                                            <Network size={16} className="text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                                        </div>
                                        {progress === 100 && <Trophy size={16} className="text-yellow-500" />}
                                    </div>

                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{project.desc || 'No description provided.'}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-medium">{taskCount} Items</span>
                                    <div className="relative w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Workspace Modal */}
            <AnimatePresence>
                {selectedProject && (() => {
                    // Derive live project from the reactive projects array
                    const liveProject = projects.find(p => p.id === selectedProject.id) || selectedProject;
                    return (
                        <AdvancedProjectWorkspace
                            project={liveProject}
                            onClose={() => setSelectedProject(null)}
                            updateProject={updateProject}
                            onDeleteProject={removeProject}
                            onGraduate={() => {
                                openConfirm({
                                    title: 'Launch Project',
                                    message: 'Ready to launch this project commercially?',
                                    confirmText: 'Launch',
                                    variant: 'info',
                                    icon: Trophy,
                                    onConfirm: () => {
                                        updateProject(selectedProject.id, { stage: 'commercial', subStage: 1 });
                                        setSelectedProject(null);
                                        navigate('/commercial');
                                    }
                                });
                            }}
                        />
                    );
                })()}
            </AnimatePresence>
            <ConfirmDialogComponent />
        </div>
    );
};

export default AdvancedDevModule;
