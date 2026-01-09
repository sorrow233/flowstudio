import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, FolderDot, Box, Activity, Trophy } from 'lucide-react';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useSync } from '../sync/SyncContext';
import AdvancedProjectWorkspace from './components/advanced/AdvancedProjectWorkspace';
import { useNavigate } from 'react-router-dom';
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
                    const modules = project.modules || [];
                    const moduleCount = modules.length;
                    const progress = moduleCount > 0
                        ? Math.round(modules.reduce((acc, m) => acc + (m.progress || 0), 0) / moduleCount)
                        : 0;

                    return (
                        <motion.div
                            layoutId={`advanced-card-${project.id}`}
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-red-900/5 dark:hover:shadow-red-900/20 transition-all cursor-pointer relative h-[320px] flex flex-col ring-1 ring-transparent hover:ring-red-50 dark:hover:ring-red-900/30"
                        >
                            {/* Card Background */}
                            <div className="absolute inset-0 z-0 h-40">
                                {project.bgImage ? (
                                    <div className="w-full h-full relative">
                                        <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900" />
                                )}
                            </div>

                            <div className="p-8 relative z-10 flex flex-col h-full mt-auto">
                                <div className="mb-auto pt-12">
                                    <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Network size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.desc || 'No description provided.'}</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Box size={14} />
                                        <span className="text-xs font-medium">{moduleCount} Modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                        <Activity size={12} />
                                        <span className="text-xs font-bold">{progress}% Health</span>
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
                                if (confirm('Ready to launch this project commercially?')) {
                                    updateProject(selectedProject.id, { stage: 'commercial', subStage: 1 });
                                    setSelectedProject(null);
                                    navigate('/commercial');
                                }
                            }}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedDevModule;
