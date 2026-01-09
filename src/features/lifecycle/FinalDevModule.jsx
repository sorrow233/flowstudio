import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Trash2, Check, Rocket, Sparkles, Trophy, Star, X, Plus } from 'lucide-react';
import { STORAGE_KEYS, FINAL_STAGES } from '../../utils/constants';

// Reusing Primary Components (Assuming they are generic enough or we might need to duplicate/adapt if they have hardcoded 'Primary' logic)
// Based on PrimaryDevModule imports:
import StageNavigation from './components/primary/StageNavigation';
import TaskList from './components/primary/TaskList';
import ProjectWorkspaceHeader from './components/primary/ProjectWorkspaceHeader';
import ImportCommandModal from './components/primary/ImportCommandModal';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import confetti from 'canvas-confetti';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';

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


const FinalDevModule = () => {
    // --- Sync Integration (using 'final_projects' key) ---
    const { doc } = useSync();
    const {
        projects,
        addProject, // Need addProject for Final module specific creation
        updateProject,
        removeProject: deleteProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'final_projects');

    useUndoShortcuts(undo, redo);

    // --- Global State ---
    const [selectedProject, setSelectedProject] = useState(null);

    // --- Project Creation State ---
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    // --- UI/Interaction State ---
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [viewStage, setViewStage] = useState(1);

    // --- Edit Mode State ---
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editForm, setEditForm] = useState({});

    // --- Task/Command State ---
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');
    const [commandModalOpen, setCommandModalOpen] = useState(false);
    const [availableCommands, setAvailableCommands] = useState([]);

    // Load commands for sync check
    useEffect(() => {
        const loadCommands = () => {
            const savedCmds = localStorage.getItem(STORAGE_KEYS.COMMANDS);
            if (savedCmds) {
                setAvailableCommands(JSON.parse(savedCmds));
            }
        };
        loadCommands();
        window.addEventListener('focus', loadCommands);
        return () => window.removeEventListener('focus', loadCommands);
    }, []);

    // --- Scroll Handling Ref ---
    const taskListRef = useRef(null);

    const handleHeaderWheel = (e) => {
        if (taskListRef.current) {
            taskListRef.current.scrollTop += e.deltaY;
        }
    };

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


    // --- Project Filtering ---
    // For Final module, we might not have 'advanced' separation internally like Primary, 
    // or maybe 'Completed' projects are separated. 
    // For now, let's treat all as active unless marked complete? 
    // Primary separated by stage < 6. Final has only 3 stages.
    // Let's assume all are active for now, or maybe separate fully completed ones later.
    const activeProjects = projects;
    // If we want to separate 'Done' ones:
    // const activeProjects = projects.filter(p => (p.subStage || 1) <= 3);
    // const completedProjects = projects.filter(p => (p.subStage || 1) > 3);
    // But specific requirement was just "Final becomes Primary's card format".


    // --- Create Project Handler (Inline, no prompt) ---
    const handleCreateProject = () => {
        if (!newProjectTitle.trim()) return;

        const newProject = {
            id: Date.now().toString(),
            title: newProjectTitle.trim(),
            desc: '新的最终开发项目',
            subStage: 1,
            tasks: [],
            createdAt: Date.now()
        };
        addProject(newProject);
        setNewProjectTitle('');
        setIsCreatingProject(false);
    };


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

        // Auto-switch view for Final module? Maybe not strictly needed but good UX
        if (isComplete && newSubStage <= 3) { // Max stage 3
            setViewStage(newSubStage);
        }
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
        FINAL_STAGES.forEach(stage => {
            const stageTasks = selectedProject.tasks.filter(t => (t.stage || 1) === stage.id);
            stats[stage.id] = {
                taskCount: stageTasks.filter(t => !t.isCommand && !t.done).length,
                commandCount: stageTasks.filter(t => t.isCommand && !t.done).length
            };
        });
        return stats;
    }, [selectedProject?.tasks]);

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Dashboard Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">最终开发阶段</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">优化、功能与修复</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                    {isCreatingProject ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateProject();
                                    if (e.key === 'Escape') { setIsCreatingProject(false); setNewProjectTitle(''); }
                                }}
                                placeholder="项目名称..."
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none w-48"
                            />
                            <button
                                onClick={handleCreateProject}
                                disabled={!newProjectTitle.trim()}
                                className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                            >
                                创建
                            </button>
                            <button
                                onClick={() => { setIsCreatingProject(false); setNewProjectTitle(''); }}
                                className="text-gray-400 hover:text-gray-600 p-2"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} /> 新建项目
                        </button>
                    )}
                    <div>
                        <span className="text-3xl font-thin text-gray-900">{activeProjects.length}</span>
                        <span className="text-gray-400 text-xs uppercase tracking-widest ml-2">TOTAL</span>
                    </div>
                </div>
            </div>

            {/* Active Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {activeProjects.map((project) => {
                    const isHoly = project.hasHolyGlow;

                    return (
                        <motion.div
                            layoutId={`final-card-${project.id}`}
                            key={project.id}
                            onClick={() => handleSelectProject(project)}
                            className={`group bg-white border rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer relative h-[360px] flex flex-col
                                ${isHoly
                                    ? 'border-transparent shadow-[0_0_0_2px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                    : 'border-gray-100 hover:shadow-gray-200/50 ring-1 ring-transparent hover:ring-gray-100'}
                            `}
                        >
                            {/* Holy Flowing Border Animation */}
                            {isHoly && (
                                <motion.div
                                    className="absolute inset-0 rounded-[2rem] pointer-events-none z-50"
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
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                />
                            )}

                            <Spotlight
                                className="w-full h-full"
                                spotColor={isHoly ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.2)"}
                            >
                                {/* Card Background */}
                                <div className="absolute inset-0 z-0 h-48">
                                    <div className="w-full h-full relative">
                                        <img
                                            src={project.bgImage || getDefaultBackground(project.id)}
                                            alt=""
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                                    </div>
                                </div>

                                <div className="p-8 relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 backdrop-blur rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-105
                                            ${isHoly ? 'bg-emerald-50/80 border-emerald-200/50 text-emerald-700' : 'bg-white/80 border-white/50 text-gray-900'}
                                        `}>
                                            <Code2 size={24} strokeWidth={1.5} />
                                        </div>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur rounded-full hover:bg-white">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className={`text-2xl font-light mb-2 line-clamp-1 transition-colors
                                            ${isHoly ? 'text-emerald-900 group-hover:text-emerald-700' : 'text-gray-900 group-hover:text-emerald-900'}
                                        `}>{project.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">{project.desc || 'No description provided.'}</p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100/50">
                                        {/* Mini Stage Visualization */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            {[1, 2, 3].map(step => (
                                                <div
                                                    key={step}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-indigo-500 shadow-sm shadow-indigo-200' : 'bg-gray-100'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${isHoly ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                                                <span>Step {project.subStage || 1}</span>
                                            </div>
                                            <span className="text-gray-900 font-medium">
                                                {project.stageNames?.[project.subStage || 1] || FINAL_STAGES[(project.subStage || 1) - 1]?.label}
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
                    <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-gray-300 min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 opacity-50 animate-pulse">
                            <Sparkles size={40} className="text-gray-400" strokeWidth={1} />
                        </div>
                        <span className="text-xl font-light text-gray-900 mb-2">暂无最终项目</span>
                        <span className="text-sm text-gray-400 max-w-sm text-center leading-relaxed">创建项目以开始优化与功能完善</span>
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className="mt-6 text-indigo-500 hover:text-indigo-600 font-medium text-sm transition-colors"
                        >
                            + 创建首个项目
                        </button>
                    </div>
                )}
            </div>

            {/* Project Workspace Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-md"
                            onClick={() => { setSelectedProject(null); setIsEditingProject(false); }}
                        />
                        <motion.div
                            layoutId={`final-card-${selectedProject.id}`}
                            className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 h-[90vh] flex flex-col ring-1 ring-gray-100"
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
                                stages={FINAL_STAGES} // Pass custom stages as 'stages' prop
                            />

                            <div
                                className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/30"
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
                                    stages={FINAL_STAGES} // Use FINAL_STAGES here
                                />

                                {/* Right Content: Task List */}
                                <div className="flex-1 flex flex-col relative w-full overflow-hidden">
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
                stages={FINAL_STAGES}
            />
        </div>
    );
};

export default FinalDevModule;
