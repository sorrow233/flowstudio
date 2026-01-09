import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Trash2, Check, Rocket, Sparkles, Trophy, Star, X } from 'lucide-react';
import { STORAGE_KEYS, DEV_STAGES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

// Import New Modular Components
import StageNavigation from './components/primary/StageNavigation';
import TaskList from './components/primary/TaskList';
import ProjectWorkspaceHeader from './components/primary/ProjectWorkspaceHeader';
import ImportCommandModal from './components/primary/ImportCommandModal';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import confetti from 'canvas-confetti';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';
import { useTranslation } from '../i18n';

import Spotlight from '../../components/shared/Spotlight';

// Default card background images - randomly selected per project
const DEFAULT_CARD_BACKGROUNDS = [
    'https://blog.catzz.work/file/1767894017691_jean-carlo-emer-dUB0ECAfVaU-unsplash.webp',
    'https://blog.catzz.work/file/1767894022389_raymond-yeung-3ABZ_Uc0Ie0-unsplash.webp',
    'https://blog.catzz.work/file/1767894025264_tsuyoshi-kozu-a8WZxtfrgs4-unsplash.webp',
    'https://blog.catzz.work/file/1767894020358_david-becker-Lcckkgmyf9A-unsplash.webp',
];

// Deterministic random selection based on project ID
const getDefaultBackground = (projectId) => {
    if (!projectId) return DEFAULT_CARD_BACKGROUNDS[0];
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
        hash = ((hash << 5) - hash) + projectId.charCodeAt(i);
        hash |= 0;
    }
    return DEFAULT_CARD_BACKGROUNDS[Math.abs(hash) % DEFAULT_CARD_BACKGROUNDS.length];
};


const PrimaryDevModule = () => {
    // --- Sync Integration ---
    const { doc } = useSync();
    const {
        projects: allProjects,
        updateProject,
        removeProject: deleteProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'all_projects');

    // Filter projects for this module
    const projects = React.useMemo(() =>
        allProjects.filter(p => (p.stage || 'primary') === 'primary'),
        [allProjects]);

    // Legacy Migration removed as it's now handled by global migration hook

    useUndoShortcuts(undo, redo);
    const navigate = useNavigate();

    // --- Global State ---
    const [selectedProject, setSelectedProject] = useState(null);

    // --- UI/Interaction State ---
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewStage, setViewStage] = useState(1);

    // --- Edit Mode State ---
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editForm, setEditForm] = useState({});

    // --- Task/Command State ---
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');
    const [commandModalOpen, setCommandModalOpen] = useState(false);

    // Sync: Load Commands
    const { projects: availableCommands } = useSyncedProjects(doc, 'all_commands');

    // --- Graduation State ---
    const [showGraduationChecklist, setShowGraduationChecklist] = useState(false);
    const [graduationChecks, setGraduationChecks] = useState({});

    // --- Scroll Handling Ref ---
    const taskListRef = useRef(null);

    const handleHeaderWheel = (e) => {
        if (taskListRef.current) {
            taskListRef.current.scrollTop += e.deltaY;
        }
    };

    const GRADUATION_PILLARS = [
        { id: 'audience', label: 'Have I truly understood who I am building for?' },
        { id: 'vow', label: 'Does this solution honor the original Founder\'s Vow?' },
        { id: 'tech', label: 'Is the technical heart beating steadily?' },
        { id: 'ready', label: 'Am I ready to leave the nursery and face the real world?' }
    ];

    // Sync selectedProject with latest data
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

    // When opening a project, set view to current progress
    const handleSelectProject = (project) => {
        setSelectedProject(project);
        setViewStage(project.subStage || 1);
    };

    const toggleGraduationCheck = (id) => {
        setGraduationChecks(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const allPillarsChecked = GRADUATION_PILLARS.every(p => graduationChecks[p.id]);


    // --- Project Filtering ---
    const activeProjects = projects;
    const finalProjects = []; // No longer showing graduated projects in Primary dashboard


    // --- Project Handlers ---
    const handleDeleteProject = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete project?')) {
            deleteProject(id);
            if (selectedProject?.id === id) setSelectedProject(null);
        }
    };

    const handleUpdateProject = (id, updates) => {
        updateProject(id, updates);
    };

    // --- Edit Handlers ---
    const startEditing = () => {
        if (!selectedProject) return;
        setEditForm({
            title: selectedProject.title,
            desc: selectedProject.desc,
            link: selectedProject.link || '',
            bgImage: selectedProject.bgImage || ''
        });
        setIsEditingProject(true);
    };

    const saveEditing = () => {
        handleUpdateProject(selectedProject.id, editForm);
        setIsEditingProject(false);
    };

    // --- Task Handlers ---
    const handleAddTask = (projectId) => {
        if (!newTaskInput.trim()) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: newTaskInput,
            done: false,
            category: newTaskCategory,
            stage: viewStage
        }];
        handleUpdateProject(projectId, { tasks: newTasks });
        setNewTaskInput('');
    };

    const handleDeleteTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updatedTasks = project.tasks.filter(t => t.id !== taskId);
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleToggleTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleUpdateTask = (projectId, taskId, updates) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleReorderTasks = (newOrder, stageId) => {
        const project = projects.find(p => p.id === selectedProject.id);
        if (!project) return;
        const otherTasks = project.tasks.filter(t => (t.stage || 1) !== stageId);
        const mergedTasks = [...otherTasks, ...newOrder];
        handleUpdateProject(selectedProject.id, { tasks: mergedTasks });
    };

    // --- Command Import Handler ---
    const handleLinkCommand = (command, tag = null) => {
        const project = projects.find(p => p.id === selectedProject.id);
        const currentStage = viewStage;

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: command.title,
            done: false,
            isCommand: true,
            commandContent: command.content,
            commandUrl: command.url,
            commandId: command.id,
            commandType: command.type || 'utility',
            commandTags: command.tags || [],
            stage: currentStage
        }];

        handleUpdateProject(selectedProject.id, { tasks: newTasks });
        // Modal stays open - user can import multiple commands consecutively

        if (tag) {
            navigator.clipboard.writeText(tag.value || command.content);
        }
    };

    // --- Stage Handler ---
    const handleToggleStageComplete = (stageId, isComplete) => {
        // If marking complete, move to next stage (stageId + 1)
        // If marking incomplete (undo), move back to this stage (stageId)
        const newSubStage = isComplete ? stageId + 1 : stageId;
        handleUpdateProject(selectedProject.id, { subStage: newSubStage });

        // Optional: Auto-switch view to next stage when completed?
        if (isComplete) {
            setViewStage(newSubStage <= 5 ? newSubStage : 5);
        }
    };

    // --- Graduation Logic ---
    const handleGraduateToFinal = () => {
        if (!allPillarsChecked) return;

        // Trigger Confetti
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#FBBF24', '#ffffff']
        });

        // Graduation: Transition stage from primary to advanced (Optimization)
        updateProject(selectedProject.id, {
            stage: 'advanced',
            subStage: 1, // Reset subStage for the new phase
        });

        // Close modal after delay
        setTimeout(() => {
            setShowGraduationChecklist(false);
            setGraduationChecks({}); // Reset

            // Navigate to Final Module for setup
            navigate('/advanced', { state: { projectId: selectedProject.id } });

            setSelectedProject(null);
        }, 1500);
    };


    // --- Rename Stage Handler ---
    const handleRenameStage = (stageId, newName) => {
        const currentStageNames = selectedProject.stageNames || {};
        const updatedStageNames = {
            ...currentStageNames,
            [stageId]: newName
        };
        handleUpdateProject(selectedProject.id, { stageNames: updatedStageNames });
    };

    // --- Stage Metadata Calculation ---
    // Calculate counts for tasks and commands per stage to show as badges
    const stageStats = React.useMemo(() => {
        if (!selectedProject?.tasks) return {};

        const stats = {};
        DEV_STAGES.forEach(stage => {
            const stageTasks = selectedProject.tasks.filter(t => (t.stage || 1) === stage.id);
            stats[stage.id] = {
                taskCount: stageTasks.filter(t => !t.isCommand && !t.done).length,
                commandCount: stageTasks.filter(t => t.isCommand && !t.done).length
            };
        });
        return stats;
    }, [selectedProject?.tasks]);

    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Dashboard Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-purple-500 dark:text-purple-400 mb-2 tracking-tight">{t('primary.title')}</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">{t('primary.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4 text-right">

                    <div>
                        <span className="text-3xl font-thin text-gray-900">{activeProjects.length}</span>
                        <span className="text-gray-400 text-xs uppercase tracking-widest ml-2">Active</span>
                    </div>
                </div>
            </div>

            {/* Active Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {activeProjects.map((project) => {
                    const isHoly = project.hasHolyGlow;

                    return (
                        <motion.div
                            layoutId={`primary-card-${project.id}`}
                            key={project.id}
                            onClick={() => handleSelectProject(project)}
                            className={`group bg-white dark:bg-gray-900 border rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer relative h-[360px] flex flex-col
                                ${isHoly
                                    ? 'border-transparent shadow-[0_0_0_2px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                                    : 'border-gray-100 dark:border-gray-800 hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 ring-1 ring-transparent hover:ring-gray-100 dark:hover:ring-gray-800'}
                            `}
                        >
                            {/* Holy Flowing Border Animation */}
                            {isHoly && (
                                <motion.div
                                    className="absolute inset-0 rounded-[2rem] pointer-events-none z-50"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)',
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
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                />
                            )}

                            <Spotlight
                                className="w-full h-full"
                                spotColor={isHoly ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.2)"}
                                size={350}
                            >
                                {/* Card Background */}
                                <div className="absolute inset-0 z-0 h-48">
                                    <div className="w-full h-full relative">
                                        <img
                                            src={project.bgImage || getDefaultBackground(project.id)}
                                            alt=""
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-gray-900 dark:via-gray-900/60" />
                                    </div>
                                </div>

                                <div className="p-8 relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 backdrop-blur rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-105
                                            ${isHoly ? 'bg-purple-50/80 border-purple-200/50 text-purple-700' : 'bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 text-gray-900 dark:text-white'}
                                        `}>
                                            <Code2 size={24} strokeWidth={1.5} />
                                        </div>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-full hover:bg-white dark:hover:bg-gray-800">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className={`text-2xl font-light mb-2 line-clamp-1 transition-colors
                                            ${isHoly ? 'text-purple-900 group-hover:text-purple-700' : 'text-gray-900 dark:text-white group-hover:text-purple-900 dark:group-hover:text-purple-400'}
                                        `}>{project.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em] leading-relaxed">{project.desc || 'No description provided.'}</p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100/50 dark:border-gray-800/50">
                                        {/* Mini Stage Visualization */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            {[1, 2, 3, 4, 5].map(step => (
                                                <div
                                                    key={step}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-purple-500 shadow-sm shadow-purple-200' : 'bg-gray-100 dark:bg-gray-800'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${isHoly ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                                <span>Stage {project.subStage || 1}</span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {project.stageNames?.[project.subStage || 1] || DEV_STAGES[(project.subStage || 1) - 1]?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Spotlight>
                        </motion.div>
                    );
                })}

                {/* Empty State */}
                {activeProjects.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] p-12 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 opacity-50 animate-pulse">
                            <Rocket size={40} className="text-gray-400 dark:text-gray-500" strokeWidth={1} />
                        </div>
                        <span className="text-xl font-light text-gray-900 dark:text-gray-100 mb-2">The Workshop is Clear</span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 max-w-sm text-center leading-relaxed">Great products require validation first. Graduate a project from 'Idea Staging' to begin engineering.</span>
                    </div>
                )}
            </div>


            {/* Final / Graduated Section */}
            {
                finalProjects.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-10">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                <Trophy size={20} />
                            </div>
                            <h3 className="text-xl font-light text-gray-900 tracking-tight">Final Development</h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{finalProjects.length}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {finalProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    layoutId={`primary-card-${project.id}`} // Keep animation
                                    onClick={() => handleSelectProject(project)}
                                    className="group bg-white dark:bg-gray-900 border border-amber-100/50 dark:border-amber-900/30 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20 transition-all cursor-pointer relative h-[300px] flex flex-col opacity-80 hover:opacity-100"
                                >
                                    <Spotlight className="w-full h-full" spotColor="rgba(251, 191, 36, 0.15)">
                                        <div className="absolute inset-0 z-0 h-32 bg-amber-50/30">
                                            {project.bgImage && <img src={project.bgImage} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />}
                                        </div>
                                        <div className="p-8 relative z-10 flex flex-col h-full mt-16">
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-1">{project.title}</h3>
                                            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">
                                                <Star size={12} fill="currentColor" />
                                                <span>Advanced Phase</span>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2">{project.desc}</p>
                                        </div>
                                    </Spotlight>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )
            }


            {/* Project Workspace Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 sm:p-10 pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md"
                            onClick={() => { setSelectedProject(null); setIsEditingProject(false); }}
                        />
                        <motion.div
                            layoutId={`primary-card-${selectedProject.id}`}
                            className="w-full max-w-6xl bg-white dark:bg-gray-950 rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 h-[100dvh] md:h-[90vh] flex flex-col ring-1 ring-gray-100 dark:ring-gray-800"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            <ProjectWorkspaceHeader
                                project={selectedProject}
                                activeStage={viewStage}
                                isCollapsed={isHeaderCollapsed}
                                isEditing={isEditingProject}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onStartEdit={startEditing}
                                onSaveEdit={saveEditing}
                                onCancelEdit={() => setIsEditingProject(false)}
                                onClose={() => setSelectedProject(null)}
                                onDelete={(e) => handleDeleteProject(e, selectedProject.id)}
                                onImportCommand={() => setCommandModalOpen(true)}
                                onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                                onWheel={handleHeaderWheel}
                            />

                            <div
                                className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/30 dark:bg-gray-950/50"
                                onClick={() => !isHeaderCollapsed && setIsHeaderCollapsed(true)}
                            >
                                {/* Left Sidebar: Stage Navigation */}
                                <StageNavigation
                                    viewStage={viewStage}
                                    onViewChange={setViewStage}
                                    currentProgress={selectedProject.subStage || 1}
                                    onToggleComplete={handleToggleStageComplete}
                                    customStageNames={selectedProject.stageNames || {}}
                                    onRenameStage={handleRenameStage}
                                    stageStats={stageStats}
                                />

                                {/* Right Content: Task List */}
                                <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                                    {/* Graduation Call To Action - Only if Stage 5 is active view AND progress is at 5 (waiting for graduation) OR 6 (advanced) */}
                                    {viewStage === 5 && (selectedProject.subStage || 1) >= 6 && (
                                        <div className="px-6 pt-6 -mb-4">
                                            <button
                                                onClick={() => setShowGraduationChecklist(true)}
                                                className="w-full py-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl text-emerald-800 font-bold uppercase tracking-widest text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trophy size={16} /> Enter Ascension Ritual
                                            </button>
                                        </div>
                                    )}

                                    <TaskList
                                        ref={taskListRef}
                                        tasks={selectedProject.tasks}
                                        projectId={selectedProject.id}
                                        activeStage={viewStage}
                                        onToggle={handleToggleTask}
                                        onDelete={handleDeleteTask}
                                        onAddTask={handleAddTask}
                                        onUpdateTask={handleUpdateTask}
                                        onReorder={handleReorderTasks}
                                        newTaskInput={newTaskInput}
                                        setNewTaskInput={setNewTaskInput}
                                        newTaskCategory={newTaskCategory}
                                        setNewTaskCategory={setNewTaskCategory}
                                        onImportCommand={() => setCommandModalOpen(true)}
                                        availableCommands={availableCommands}
                                        onScroll={(e) => {
                                            const scrollTop = e.currentTarget.scrollTop;
                                            if (scrollTop > 10 && !isHeaderCollapsed) {
                                                setIsHeaderCollapsed(true);
                                            }
                                        }}
                                    />
                                </div>
                            </div>


                            {/* Graduation Checklist Overlay (The Ascension Ritual) */}
                            <AnimatePresence mode="wait">
                                {showGraduationChecklist && (
                                    <motion.div
                                        key="graduation-ritual"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
                                    >
                                        <div className="max-w-xl w-full text-center relative">
                                            {/* Close Button */}
                                            <button
                                                onClick={() => setShowGraduationChecklist(false)}
                                                className="absolute -top-12 right-0 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                                            >
                                                <X size={24} />
                                            </button>

                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="mb-10"
                                            >
                                                <div className="w-24 h-24 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100/50">
                                                    <Sparkles size={40} className="text-emerald-500/80" />
                                                </div>
                                                <h2 className="text-4xl font-thin text-gray-900 mb-3 tracking-tight">The Ascension Ritual</h2>
                                                <p className="text-emerald-600/60 font-medium tracking-widest text-xs uppercase">Stabilize the Four Pillars to Proceed</p>
                                            </motion.div>

                                            <div className="space-y-4 text-left mb-12">
                                                {GRADUATION_PILLARS.map((pillar, i) => {
                                                    const isChecked = graduationChecks[pillar.id];
                                                    return (
                                                        <motion.button
                                                            key={pillar.id}
                                                            initial={{ x: -20, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            onClick={() => toggleGraduationCheck(pillar.id)}
                                                            className={`
                                                                w-full group flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-300
                                                                ${isChecked
                                                                    ? 'bg-emerald-50/50 border-emerald-200 shadow-lg shadow-emerald-100/50 scale-[1.02]'
                                                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                                }
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                                                ${isChecked ? 'border-emerald-500 bg-emerald-500 text-white rotate-0' : 'border-gray-200 text-transparent -rotate-180'}
                                                            `}>
                                                                <Check size={16} strokeWidth={3} />
                                                            </div>
                                                            <span className={`
                                                                text-lg font-light transition-colors duration-300
                                                                ${isChecked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}
                                                            `}>
                                                                {pillar.label}
                                                            </span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-center">
                                                <button
                                                    onClick={handleGraduateToFinal}
                                                    disabled={!allPillarsChecked}
                                                    className={`
                                                        px-12 py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3
                                                        ${allPillarsChecked
                                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-1 cursor-pointer'
                                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                        }
                                                    `}
                                                >
                                                    <Trophy size={18} className={allPillarsChecked ? 'animate-bounce' : ''} />
                                                    <span>Ascend Project</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ImportCommandModal
                isOpen={commandModalOpen}
                onClose={() => setCommandModalOpen(false)}
                onImport={handleLinkCommand}
                currentStage={viewStage}
                projectCategory={selectedProject?.category}
                themeColor="purple"
            />
        </div >
    );
};

export default PrimaryDevModule;
