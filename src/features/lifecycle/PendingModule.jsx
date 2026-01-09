import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus, TreeDeciduous, TreePine, Image as ImageIcon, Sparkles, RefreshCw, Feather, Scroll, LayoutGrid, Monitor, Server, Database, Container, Beaker, Terminal, Globe, Smartphone, Cloud, Box, Cpu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, getRandomProjectImage, COMMAND_CATEGORIES, QUESTIONS } from '../../utils/constants';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';

import Spotlight from '../../components/shared/Spotlight';
import { SakuraTree, MapleTree, GinkgoTree, CedarTree } from '../../components/illustrations/TreeIllustrations';
import ProjectDetailModal from './components/primary/ProjectDetailModal';



const VISUAL_VIBES = [
    { id: 'zen', url: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=2500&auto=format&fit=crop', label: 'Zen Garden' },
    { id: 'neon', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2500&auto=format&fit=crop', label: 'Cyber Future' },
    { id: 'minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2500&auto=format&fit=crop', label: 'Minimalist' },
    { id: 'nature', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2500&auto=format&fit=crop', label: 'Deep Nature' },
    { id: 'code', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2500&auto=format&fit=crop', label: 'Matrix Code' },
];

const PendingModule = () => {
    const { doc } = useSync();

    const { doc } = useSync();

    const {
        projects,
        addProject,
        removeProject: deleteProject,
        updateProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'pending_projects');

    useUndoShortcuts(undo, redo);

    const {
        projects: primaryProjects
    } = useSyncedProjects(doc, 'primary_projects');

    const [selectedProject, setSelectedProject] = useState(null);

    // No effect needed for syncing selection with "filtered" arrays since we use direct arrays now.
    // However, if the project is deleted, we should deselect it.
    useEffect(() => {
        if (selectedProject) {
            const current = projects.find(p => p.id === selectedProject.id);
            if (!current) {
                setSelectedProject(null);
            } else {
                setSelectedProject(current);
            }
        }
    }, [projects]);

    const handleUpdateProject = (id, field, value) => {
        updateProject(id, { [field]: value });
    };

    const handleAnswer = (projectId, questionId, value) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const newAnswers = { ...project.answers, [questionId]: value };
        const yesCount = Object.values(newAnswers).filter(v => v === true).length;
        updateProject(projectId, { answers: newAnswers, score: yesCount });
    };

    const handleGraduate = (project, category = 'general') => {
        deleteProject(project.id);
        setSelectedProject(null);

        if (doc) {
            const primaryList = doc.getArray('primary_projects');
            const hasReason = project.foundingReason && project.foundingReason.trim().length > 0;

            const newPrimary = {
                id: uuidv4(), // Generate new ID for primary stage
                ...project,
                category,
                graduatedAt: Date.now(),
                subStage: 1,
                progress: 0,
                tasks: [],
                hasHolyGlow: hasReason,
                bgImage: project.bgImage || getRandomProjectImage()
            };
            primaryList.unshift([newPrimary]);
        }
    };
    // ...
    // ... inside input onKeyDown ...
    if (e.key === 'Enter' && e.target.value?.trim()) {
        const newP = {
            id: uuidv4(),
            title: e.target.value.trim(),
            desc: '一句话描述这个创想...',
            score: 0,
            answers: {}
        };
        addProject(newP);
        setSelectedProject(newP);
        e.target.value = '';
    }
                    </div >

    {/* Nursery (Primary Projects) */ }
{
    primaryProjects.length > 0 && (
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="mb-4 flex items-center gap-2">
                <Sun size={16} className="text-amber-400" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-widest">Nursery</h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:inline-block">({primaryProjects.length} Growing)</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar snap-x">
                {primaryProjects.map(p => {
                    const visual = getTreeVisual(p.subStage || 1, p.id);
                    const isHoly = p.hasHolyGlow;
                    const isAdvanced = (p.subStage || 1) >= 6; // Stage 6+ is Advanced

                    return (
                        <motion.div
                            key={p.id}
                            layoutId={`nursery-${p.id}`}
                            className={`
                                                snap-start relative overflow-hidden group transition-all duration-500 cursor-default
                                                flex flex-col text-center
                                                ${isAdvanced
                                    ? 'bg-gradient-to-b from-gray-50 to-white min-w-[240px] w-[240px] h-[320px] rounded-[32px] border-amber-100/50 shadow-[0_20px_40px_-12px_rgba(251,191,36,0.15)] justify-between pt-6'
                                    : 'bg-gradient-to-b from-white to-gray-50/50 min-w-[140px] h-[160px] p-4 border rounded-xl border-gray-100 items-center justify-end'}
                                                ${isHoly && !isAdvanced ? 'border-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-100' : ''}
                                                ${!isHoly && !isAdvanced ? 'border-emerald-100' : ''}
                                            `}
                        >
                            {/* Holy Glow Animation for regular items */}
                            {isHoly && !isAdvanced && (
                                <motion.div
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-tr from-violet-50/50 via-transparent to-emerald-50/50 pointer-events-none"
                                />
                            )}

                            {/* Advanced Background Effects */}
                            {isAdvanced && (
                                <>
                                    <div className={`absolute inset-0 opacity-30 bg-gradient-to-b ${visual.label.includes('Sakura') ? 'from-pink-100/40' :
                                        visual.label.includes('Maple') ? 'from-orange-100/40' :
                                            visual.label.includes('Cedar') ? 'from-emerald-100/40' :
                                                'from-amber-100/40'
                                        } via-transparent to-transparent pointer-events-none`} />

                                    {isHoly && (
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.15),transparent_60%)] pointer-events-none mix-blend-overlay"
                                        />
                                    )}
                                </>
                            )}

                            {/* Top Section: Title and Tag (Only for Advanced) */}
                            {isAdvanced && (
                                <div className="w-full relative z-20 px-4 flex flex-col items-center gap-2">
                                    <div className={`
                                                        flex items-center gap-1.5 justify-center 
                                                        text-[11px] font-bold uppercase tracking-widest 
                                                        py-1.5 px-4 rounded-full w-fit 
                                                        bg-white/80 backdrop-blur-md
                                                        ${visual.border} ${visual.text} border
                                                        shadow-sm
                                                    `}>
                                        <span>{visual.label}</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 w-full line-clamp-2 text-base leading-tight">
                                        {p.title}
                                    </h4>
                                </div>
                            )}

                            {/* Tree Image Container - Bottom Aligned */}
                            <div className={`flex-1 flex items-end justify-center w-full relative z-10 ${isAdvanced ? 'pb-0' : 'pb-0'}`}>
                                <motion.div
                                    className={`relative flex items-center justify-center ${!isAdvanced && visual.color}`}
                                    animate={isAdvanced ? { y: [0, -8, 0] } : { scale: visual.scale || 1 }}
                                    transition={isAdvanced ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : {}}
                                >
                                    {isAdvanced ? (
                                        <div className="relative flex flex-col items-center justify-end w-full">
                                            <img
                                                src={visual.img}
                                                alt={visual.label}
                                                className="w-[200px] h-auto object-contain relative z-20 transform translate-y-4"
                                                style={{ filter: 'contrast(1.05) saturate(1.05)' }}
                                            />
                                            {/* Enhanced Ground Shadow */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-amber-900/10 blur-2xl rounded-full z-10 mix-blend-multiply" />
                                        </div>
                                    ) : (
                                        <visual.icon size={32} strokeWidth={1.5} />
                                    )}
                                </motion.div>
                            </div>

                            {/* Bottom Section: Title/Progress (Only for Regular) */}
                            {!isAdvanced && (
                                <div className="w-full relative z-20">
                                    <h4 className="font-medium text-gray-700 line-clamp-1 w-full mb-2 text-xs">{p.title}</h4>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${((p.subStage || 1) / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    )
}
                </div >
            </div >

    {/* Right Column: Detail View */ }
    < AnimatePresence mode = "wait" >
        { selectedProject && (
            <ProjectDetailModal
                project={selectedProject}
                onUpdate={handleUpdateProject}
                onAnswer={handleAnswer}
                onGraduate={handleGraduate}
                onClose={() => setSelectedProject(null)}
            />
        )}
            </AnimatePresence >

    {!selectedProject && (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-300">
            <p>选择一颗种子</p>
        </div>
    )}
        </div >
    );
};



export default PendingModule;
