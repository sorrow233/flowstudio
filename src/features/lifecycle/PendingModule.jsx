import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus, TreeDeciduous, TreePine, Image as ImageIcon, Sparkles, RefreshCw, Feather, Scroll, LayoutGrid, Monitor, Server, Database, Container, Beaker, Terminal, Globe, Smartphone, Cloud, Box, Cpu, Settings2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, getRandomProjectImage, COMMAND_CATEGORIES, QUESTIONS } from '../../utils/constants';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';

import Spotlight from '../../components/shared/Spotlight';
import { SakuraTree, MapleTree, GinkgoTree, CedarTree } from '../../components/illustrations/TreeIllustrations';
import ProjectDetailModal from './components/primary/ProjectDetailModal';
import ProjectManageModal from './components/pending/ProjectManageModal';



const VISUAL_VIBES = [
    { id: 'zen', url: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=2500&auto=format&fit=crop', label: 'Zen Garden' },
    { id: 'neon', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2500&auto=format&fit=crop', label: 'Cyber Future' },
    { id: 'minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2500&auto=format&fit=crop', label: 'Minimalist' },
    { id: 'nature', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2500&auto=format&fit=crop', label: 'Deep Nature' },
    { id: 'code', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2500&auto=format&fit=crop', label: 'Matrix Code' },
];

const PendingModule = () => {
    const { doc } = useSync();

    const {
        projects: allProjects,
        addProject,
        removeProject: deleteProject,
        updateProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'all_projects');

    // Sync: Categories (for Project Category Selection)
    const {
        projects: syncedCategories,
    } = useSyncedProjects(doc, 'command_categories');

    // Initialize Undo Shortcuts
    useUndoShortcuts(undo, redo);

    const { openConfirm, ConfirmDialogComponent } = useConfirmDialog();

    // Merge default categories with synced custom labels
    const categories = React.useMemo(() => {
        if (syncedCategories && syncedCategories.length > 0) {
            return COMMAND_CATEGORIES.map(defaultCat => {
                const userCat = syncedCategories.find(c => c.id === defaultCat.id);
                return userCat ? { ...defaultCat, label: userCat.label } : defaultCat;
            });
        }
        return COMMAND_CATEGORIES;
    }, [syncedCategories]);

    // Filter for pending projects
    const projects = React.useMemo(() =>
        allProjects.filter(p => p.stage === 'pending'),
        [allProjects]);

    // Filter for primary projects (Nursery)
    const primaryProjects = React.useMemo(() =>
        allProjects.filter(p => p.stage === 'primary'),
        [allProjects]);

    const [selectedProject, setSelectedProject] = useState(null);
    const [managingProject, setManagingProject] = useState(null);

    useEffect(() => {
        if (selectedProject) {
            const current = projects.find(p => p.id === selectedProject.id);
            if (current) {
                setSelectedProject(current);
            } else {
                setSelectedProject(null);
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

    // Sync: Commands (for Template Inheritance)
    const {
        projects: allCommands,
    } = useSyncedProjects(doc, 'all_commands');

    const handleGraduate = (project, category = 'general') => {
        const hasReason = project.foundingReason && project.foundingReason.trim().length > 0;

        // 1. Get Template Commands for this category
        const templateCommands = allCommands.filter(cmd =>
            (cmd.category || 'general') === category
        );

        // 2. Convert to Tasks
        const initialTasks = templateCommands.map(cmd => ({
            id: uuidv4(),
            text: cmd.title,
            done: false,
            isCommand: true,
            commandContent: cmd.content,
            commandUrl: cmd.url,
            commandId: cmd.id,
            commandType: cmd.type || 'utility',
            commandTags: cmd.tags || [],
            stage: (cmd.stageIds && cmd.stageIds.length > 0) ? Math.min(...cmd.stageIds) : 1
        }));


        // Merge with any existing tasks (though pending projects usually have none, or user might have added some manually?)
        // Pending projects have `tasks` field? code says `project.tasks || []`.
        const finalTasks = [...(project.tasks || []), ...initialTasks];

        // Graduate: simply change stage and set initial primary data
        updateProject(project.id, {
            stage: 'primary',
            category,
            graduatedAt: Date.now(),
            subStage: 1,
            progress: 0,
            tasks: finalTasks,
            hasHolyGlow: hasReason,
            bgImage: project.bgImage || getRandomProjectImage()
        });

        setSelectedProject(null);
    };

    const handleDelete = (e, id) => {
        if (e) e.stopPropagation();
        openConfirm({
            title: '移除这颗种子？',
            message: '此操作无法撤销。这颗种子将回归虚无，等待下一次灵感的迸发。',
            confirmText: '移除',
            icon: TreePine,
            variant: 'danger',
            onConfirm: () => {
                deleteProject(id);
                setManagingProject(null);
            }
        });
    }

    const getSaplingState = (score) => {
        if (score === 0) return { scale: 0.8, opacity: 0.3, color: 'text-gray-300' };
        if (score <= 2) return { scale: 0.9, opacity: 0.7, color: 'text-yellow-500' };
        if (score < 4) return { scale: 1.0, opacity: 0.9, color: 'text-lime-500' };
        return { scale: 1.1, opacity: 1, color: 'text-emerald-600' };
    };




    const getTreeVisual = (stage = 1, projectId = '') => {
        const stages = [
            { color: 'text-emerald-300', scale: 0.9, icon: Sprout, label: 'Seedling' },
            { color: 'text-emerald-400', scale: 1.1, icon: Sprout, label: 'Sapling' },
            { color: 'text-emerald-500', scale: 1.0, icon: TreeDeciduous, label: 'Young Tree' },
            { color: 'text-emerald-600', scale: 1.1, icon: TreeDeciduous, label: 'Mature Tree' },
            { color: 'text-emerald-700', scale: 1.2, icon: TreePine, label: 'Ancient' },
        ];

        // Advanced Stage (>= 6): Special mature trees
        if (stage >= 6) {
            const advancedTrees = [
                { img: '/trees/sakura.png', label: 'Sakura Tree', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', scale: 1.2 },
                { img: '/trees/maple.png', label: 'Maple Tree', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', scale: 1.2 },
                { img: '/trees/ginkgo.png', label: 'Ginkgo Tree', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', scale: 1.2 },
                { img: '/trees/cedar.png', label: 'Cedar Tree', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', scale: 1.2 },
            ];
            // Deterministic random based on projectId for consistency
            const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return advancedTrees[hash % advancedTrees.length];
        }

        if (stage > stages.length) return stages[stages.length - 1];
        return stages[stage - 1] || stages[0];
    };

    return (
        <div className="w-full pt-4 md:pt-8 h-auto md:h-full flex flex-col md:flex-row gap-4 md:gap-10 overflow-visible md:overflow-hidden">
            {/* Left Column: Stream & Nursery */}
            <div className={`transition-all duration-500 flex-col ${selectedProject ? 'hidden md:flex md:w-[350px] opacity-100' : 'flex w-full'} h-auto md:h-full`}>
                <div className="flex-none mb-6 px-4 md:px-0 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-light tracking-wide text-gray-900 dark:text-white">Idea Staging</h2>
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Validate before you build</p>
                    </div>

                </div>

                <div className="flex-1 flex flex-col gap-8 overflow-visible md:overflow-y-auto no-scrollbar pb-32 md:pb-20 px-4 md:px-0">
                    <div className="space-y-4">
                        {projects.map(project => (
                            <motion.div
                                layoutId={project.id}
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className={`
                                    group cursor-pointer bg-white dark:bg-gray-900 border rounded-xl relative transition-all duration-300 overflow-hidden
                                    ${selectedProject?.id === project.id
                                        ? 'border-gray-900 dark:border-gray-100 shadow-xl shadow-gray-200 dark:shadow-gray-900 ring-1 ring-gray-900 dark:ring-gray-100 scale-[1.02]'
                                        : project.hasHolyGlow
                                            ? 'border-transparent shadow-[0_0_0_1px_rgba(16,185,129,0.3)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-gray-900'}
                                `}
                            >
                                {/* Holy Flowing Border Animation */}
                                {project.hasHolyGlow && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl pointer-events-none z-50"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)',
                                            backgroundSize: '200% 100%',
                                        }}
                                        animate={{
                                            backgroundPosition: ['200% 0', '-200% 0'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />
                                )}

                                <Spotlight className="p-5 h-full" spotColor={project.hasHolyGlow ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.2)"}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors 
                                            ${project.hasHolyGlow
                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800'
                                                : project.score === 4
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400'
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                            }
                                        `}>
                                            <Sprout size={18} />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-all relative z-40"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <h3 className={`font-medium mb-1 line-clamp-1 transition-colors ${project.hasHolyGlow ? 'text-emerald-900 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{project.title}</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs font-light line-clamp-2">{project.desc}</p>
                                </Spotlight>
                            </motion.div>
                        ))}

                        {/* Add Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 dark:from-gray-800 to-gray-50 dark:to-gray-900 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                            <div className="relative bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-2 flex items-center gap-3 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <Plus size={20} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Plant a new seed..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-light h-full"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value?.trim()) {
                                            const newP = {
                                                title: e.target.value.trim(),
                                                desc: '一句话描述这个创想...',
                                                score: 0,
                                                answers: {},
                                                stage: 'pending' // Explicitly set stage
                                            };
                                            addProject(newP);
                                            // Note: addProject now returns nothing, but we'll find it in projects
                                            // For now, we rely on the list update. 
                                            // If we need immediate selection, we might need a way to get the generated ID.
                                            // However, the standard behavior is projects will update and user can click.
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nursery (Primary Projects) */}
                    {primaryProjects.length > 0 && (
                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <Sun size={16} className="text-amber-400" />
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-widest">Nursery</h3>
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:inline-block">({primaryProjects.length} Growing)</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-2 md:px-2 no-scrollbar snap-x">
                                {primaryProjects.map(p => {
                                    const visual = getTreeVisual(p.subStage || 1, p.id);
                                    const isHoly = p.hasHolyGlow;
                                    const isAdvanced = (p.subStage || 1) >= 6; // Stage 6+ is Advanced

                                    return (
                                        <motion.div
                                            key={p.id}
                                            layoutId={`nursery-${p.id}`}
                                            onDoubleClick={() => setManagingProject(p)}
                                            title="双击进行管理 (Double click to manage)"
                                            className={`
                                                snap-start relative overflow-hidden group transition-all duration-500 cursor-default select-none
                                                flex flex-col text-center
                                                ${isAdvanced
                                                    ? 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 min-w-[240px] w-[240px] h-[320px] rounded-[32px] border-amber-100/50 dark:border-amber-900/30 shadow-[0_20px_40px_-12px_rgba(251,191,36,0.15)] justify-between pt-6'
                                                    : 'bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900 min-w-[140px] h-[160px] p-4 border rounded-xl border-gray-100 dark:border-gray-700 items-center justify-end'}
                                                ${isHoly && !isAdvanced ? 'border-violet-200 dark:border-violet-800 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-100 dark:ring-violet-900' : ''}
                                                ${!isHoly && !isAdvanced ? 'border-emerald-100 dark:border-emerald-900/30' : ''}
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
                                                        bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
                                                        ${visual.border} ${visual.text} border
                                                        shadow-sm
                                                    `}>
                                                        <span>{visual.label}</span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 w-full line-clamp-2 text-base leading-tight">
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
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 line-clamp-1 w-full mb-2 text-xs">{p.title}</h4>
                                                    <div className="flex items-center gap-1.5 justify-center">
                                                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
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
                    )}
                </div>
            </div>

            {/* Right Column: Detail View */}
            <AnimatePresence mode="wait">
                {selectedProject && (
                    <ProjectDetailModal
                        project={selectedProject}
                        onUpdate={handleUpdateProject}
                        onAnswer={handleAnswer}
                        onGraduate={handleGraduate}
                        onClose={() => setSelectedProject(null)}
                        categories={categories}
                    />
                )}
            </AnimatePresence>

            {/* Project Management Modal */}
            <ProjectManageModal
                project={managingProject}
                isOpen={!!managingProject}
                onClose={() => setManagingProject(null)}
                onDelete={(id) => handleDelete(null, id)}
            />
            <ConfirmDialogComponent />
        </div>
    );
};



export default PendingModule;
