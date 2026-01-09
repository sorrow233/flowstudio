import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, FolderDot, Box, Activity, Trophy } from 'lucide-react';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useSync } from '../sync/SyncContext';
import AdvancedProjectWorkspace from './components/advanced/AdvancedProjectWorkspace';
import { useNavigate } from 'react-router-dom';

const AdvancedDevModule = () => {
    const navigate = useNavigate();
    // --- Data Layer ---
    const { doc } = useSync();
    const { projects: allProjects, updateProject } = useSyncedProjects(doc, 'all_projects');

    // Filter for Modules (formerly Final/Culmination)
    const finalProjects = React.useMemo(() =>
        allProjects.filter(p => ['advanced', 'final', 'commercial', 'modules'].includes(p.stage)),
        [allProjects]);

    // For compatibility with some local variables if they exist
    const projects = allProjects;

    // --- State ---
    const [selectedProject, setSelectedProject] = useState(null);

    // --- Empty State ---
    if (finalProjects.length === 0) {
        return (
            <div className="max-w-7xl mx-auto pt-20 px-6 text-center text-gray-400 font-light">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={40} className="text-gray-300" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">No Final Projects Yet</h3>
                <p className="max-w-md mx-auto leading-relaxed">
                    Graduate projects from the Production Pipeline by completing all 5 stages and the Ascension Ritual.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">终稿整合阶段</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">项目核心逻辑与系统整合的最终阶段</p>
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
                            className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer relative h-[320px] flex flex-col ring-1 ring-transparent hover:ring-blue-50"
                        >
                            {/* Card Background */}
                            <div className="absolute inset-0 z-0 h-40">
                                {project.bgImage ? (
                                    <div className="w-full h-full relative">
                                        <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white" />
                                )}
                            </div>

                            <div className="p-8 relative z-10 flex flex-col h-full mt-auto">
                                <div className="mb-auto pt-12">
                                    <div className="w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Network size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-2xl font-light text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-900 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{project.desc || 'No description provided.'}</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Box size={14} />
                                        <span className="text-xs font-medium">{moduleCount} Modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
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
