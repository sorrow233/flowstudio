import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Trash2, Check, Rocket, Sparkles, Trophy, Star, X, Plus, CheckSquare, ListChecks, Copy, Terminal, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { STORAGE_KEYS } from '../../utils/constants';

// Simplified: No stage navigation, tasks are independent
import ProjectWorkspaceHeader from './components/primary/ProjectWorkspaceHeader';
import ImportCommandModal from './components/primary/ImportCommandModal';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import confetti from 'canvas-confetti';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';
import { Reorder } from 'framer-motion';
import TaskItem from './components/primary/TaskItem';
import { useConfirmDialog } from '../../components/shared/ConfirmDialog';
import { COMMAND_CATEGORIES } from '../../utils/constants';
import { LayoutGrid, Monitor, Server, Database, Container, Beaker } from 'lucide-react';

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
        projects: allProjects,
        addProject,
        updateProject,
        removeProject: deleteProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'all_projects');

    // Filter projects for this module (Optimization Stage)
    const projects = React.useMemo(() =>
        allProjects.filter(p => ['advanced', 'final', 'commercial', 'modules'].includes(p.stage)),
        [allProjects]);

    useUndoShortcuts(undo, redo);

    // --- Global State ---
    const [selectedProject, setSelectedProject] = useState(null);

    // --- Project Creation State ---
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    // --- UI/Interaction State ---
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    // --- Edit Mode State ---
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editForm, setEditForm] = useState({});

    // --- Task/Command State ---
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');
    const [commandModalOpen, setCommandModalOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [copiedTaskId, setCopiedTaskId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [lastSelectedId, setLastSelectedId] = useState(null);
    const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
    const { openConfirm, ConfirmDialogComponent } = useConfirmDialog();

    // Sync: Load Commands
    const { projects: availableCommands } = useSyncedProjects(doc, 'all_commands');

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

    // When opening a project
    const handleSelectProject = (project) => {
        setSelectedProject(project);
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
            title: newProjectTitle.trim(),
            desc: '新的最终开发项目',
            subStage: 1,
            tasks: [],
            stage: 'advanced' // Set stage to Advanced (Optimization)
        };
        addProject(newProject);
        setNewProjectTitle('');
        setIsCreatingProject(false);
    };


    // --- Project Handlers ---
    const handleDeleteProject = (e, id) => {
        e.stopPropagation();
        openConfirm({
            title: 'Delete Project',
            message: 'Delete project?',
            confirmText: 'Delete',
            onConfirm: () => {
                deleteProject(id);
                if (selectedProject?.id === id) setSelectedProject(null);
            }
        });
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

    // --- Task Handlers (Simplified: No stage binding) ---
    const handleAddTask = (projectId) => {
        if (!newTaskInput.trim()) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: newTaskInput,
            done: false,
            category: newTaskCategory
            // No stage field - tasks are independent
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

    const handleReorderTasks = (newOrder) => {
        const project = projects.find(p => p.id === selectedProject.id);
        if (!project) return;
        handleUpdateProject(selectedProject.id, { tasks: newOrder });
    };

    // --- Command Import Handler (Simplified: No stage binding) ---
    const handleLinkCommand = (command, tag = null) => {
        const project = projects.find(p => p.id === selectedProject.id);

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: command.title,
            done: false,
            isCommand: true,
            commandContent: command.content,
            commandUrl: command.url,
            commandId: command.id,
            commandType: command.type || 'utility',
            commandTags: command.tags || []
            // No stage field
        }];

        handleUpdateProject(selectedProject.id, { tasks: newTasks });

        if (tag) {
            navigator.clipboard.writeText(tag.value || command.content);
        }
    };

    // Category icons mapping
    const CATEGORY_ICONS = {
        'LayoutGrid': LayoutGrid,
        'Monitor': Monitor,
        'Server': Server,
        'Database': Database,
        'Container': Container,
        'Beaker': Beaker
    };

    // Task helper functions
    const allTasks = selectedProject?.tasks || [];
    const pendingTasks = allTasks.filter(t => !t.done);
    const completedTasks = allTasks.filter(t => t.done);

    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedTaskId(id);
        setTimeout(() => setCopiedTaskId(null), 2000);
    };

    const startEditingTask = (task) => {
        setEditingTaskId(task.id);
        setEditValue(task.text);
    };

    const saveEditTask = (taskId) => {
        if (editValue.trim()) {
            handleUpdateTask(selectedProject.id, taskId, { text: editValue });
        }
        setEditingTaskId(null);
    };

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        setLastSelectedId(id);
        if (!isSelectionMode) setIsSelectionMode(true);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === allTasks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allTasks.map(t => t.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        openConfirm({
            title: 'Delete Tasks',
            message: `Delete ${selectedIds.size} items?`,
            confirmText: 'Delete',
            onConfirm: () => {
                selectedIds.forEach(id => handleDeleteTask(selectedProject.id, id));
                setIsSelectionMode(false);
                setSelectedIds(new Set());
            }
        });
    };

    const handleBulkToggle = () => {
        selectedIds.forEach(id => handleToggleTask(selectedProject.id, id));
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    const handleBulkCopy = () => {
        const selectedTasks = allTasks.filter(t => selectedIds.has(t.id));
        const textToCopy = selectedTasks.map(t => t.commandContent || t.text).join('\n');
        navigator.clipboard.writeText(textToCopy);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Dashboard Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">进阶优化阶段</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">核心功能之外的深度性能优化与体验打磨</p>
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
                                placeholder="流程名称..."
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-300 dark:focus:border-indigo-700 outline-none w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                            <Plus size={16} /> 新建流程
                        </button>
                    )}
                    <div>
                        <span className="text-3xl font-thin text-gray-900 dark:text-white">{activeProjects.length}</span>
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
                            className={`group bg-white dark:bg-gray-900 border rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer relative h-[360px] flex flex-col
                                ${isHoly
                                    ? 'border-transparent shadow-[0_0_0_2px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                    : 'border-gray-100 dark:border-gray-800 hover:shadow-red-900/10 dark:hover:shadow-red-900/20 ring-1 ring-transparent hover:ring-red-50 dark:hover:ring-red-900/30'}
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
                                spotColor={isHoly ? "rgba(59, 130, 246, 0.15)" : "rgba(220, 38, 38, 0.1)"}
                            >
                                {/* Card Background */}
                                <div className="absolute inset-0 z-0 h-48">
                                    <div className="w-full h-full relative">
                                        <img
                                            src={project.bgImage || getDefaultBackground(project.id)}
                                            alt=""
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-gray-900 dark:via-gray-900/60 dark:to-transparent" />
                                    </div>
                                </div>

                                <div className="p-8 relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 backdrop-blur rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-110 duration-300
                                            ${isHoly ? 'bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-200/50 dark:border-emerald-700/30 text-emerald-700 dark:text-emerald-400' : 'bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-white/10 text-gray-900 dark:text-white group-hover:text-red-900 dark:group-hover:text-red-400'}
                                        `}>
                                            <Code2 size={24} strokeWidth={1.5} />
                                        </div>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/30 backdrop-blur rounded-full hover:bg-white dark:hover:bg-black/50">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className={`text-2xl font-light mb-2 line-clamp-1 transition-colors
                                            ${isHoly ? 'text-emerald-900 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300' : 'text-gray-900 dark:text-white group-hover:text-red-900 dark:group-hover:text-red-400'}
                                        `}>{project.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em] leading-relaxed">{project.desc || 'No description provided.'}</p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100/50 dark:border-gray-800/50">
                                        {/* Mini Stage Visualization */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            {[1, 2, 3].map(step => (
                                                <div
                                                    key={step}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-red-500 shadow-sm shadow-red-200 dark:shadow-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${isHoly ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                                                <span>{(project.tasks || []).filter(t => !t.done).length} Tasks</span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                Active
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
                            <Sparkles size={40} className="text-gray-400 dark:text-gray-500" strokeWidth={1} />
                        </div>
                        <span className="text-xl font-light text-gray-900 dark:text-white mb-2">暂无进阶项目</span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 max-w-sm text-center leading-relaxed">创建项目以开始深度优化与体验打磨</span>
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
                            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md"
                            onClick={() => { setSelectedProject(null); setIsEditingProject(false); }}
                        />
                        <motion.div
                            layoutId={`final-card-${selectedProject.id}`}
                            className="w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl overflow-hidden relative z-10 h-[90vh] flex flex-col ring-1 ring-gray-100 dark:ring-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ProjectWorkspaceHeader
                                project={selectedProject}
                                activeStage={1}
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
                                themeColor="red"
                            />

                            {/* Flat Task List (No Stages) */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/30 dark:bg-gray-900/30">
                                <div
                                    ref={taskListRef}
                                    className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar"
                                >
                                    <div className="min-h-full flex flex-col pt-4 pb-20">
                                        {allTasks.length > 0 ? (
                                            <div className="space-y-3">
                                                {/* Pending Tasks - Reorderable */}
                                                {pendingTasks.length > 0 && (
                                                    <Reorder.Group
                                                        axis="y"
                                                        values={pendingTasks}
                                                        onReorder={(newOrder) => {
                                                            handleReorderTasks([...newOrder, ...completedTasks]);
                                                        }}
                                                        className="space-y-3"
                                                    >
                                                        {pendingTasks.map(task => (
                                                            <TaskItem
                                                                key={task.id}
                                                                task={task}
                                                                projectId={selectedProject.id}
                                                                isMandatory={task.isCommand && task.commandType === 'mandatory'}
                                                                isLink={task.isCommand && task.commandType === 'link'}
                                                                isUtility={task.isCommand && task.commandType === 'utility'}
                                                                copiedTaskId={copiedTaskId}
                                                                onToggle={handleToggleTask}
                                                                onDelete={handleDeleteTask}
                                                                handleCopy={handleCopy}
                                                                startEditing={startEditingTask}
                                                                isEditing={editingTaskId === task.id}
                                                                editValue={editValue}
                                                                setEditValue={setEditValue}
                                                                saveEdit={saveEditTask}
                                                                availableCommands={availableCommands}
                                                                onUpdateTask={handleUpdateTask}
                                                                themeColor="red"
                                                                isSelectionMode={isSelectionMode}
                                                                isSelected={selectedIds.has(task.id)}
                                                                onSelect={() => toggleSelection(task.id)}
                                                            />
                                                        ))}
                                                    </Reorder.Group>
                                                )}

                                                {/* Completed Tasks Section */}
                                                {completedTasks.length > 0 && (
                                                    <motion.div layout className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                        <button
                                                            onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                                                            className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all group"
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: isCompletedCollapsed ? 0 : 90 }}
                                                                className="flex items-center justify-center w-5 h-5 rounded-md bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                            >
                                                                <ChevronRight size={12} strokeWidth={2.5} />
                                                            </motion.div>
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 size={14} className="text-red-500" />
                                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">已完成</span>
                                                            </div>
                                                            <div className="flex-1" />
                                                            <span className="text-[11px] tabular-nums px-2 py-0.5 rounded-md font-bold text-red-600/80 bg-red-50 dark:bg-red-900/30 dark:text-red-400">
                                                                {completedTasks.length}
                                                            </span>
                                                        </button>

                                                        <AnimatePresence initial={false}>
                                                            {!isCompletedCollapsed && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="space-y-2 pt-2 pb-2">
                                                                        {completedTasks.map(task => (
                                                                            <motion.div key={task.id}>
                                                                                <TaskItem
                                                                                    task={task}
                                                                                    projectId={selectedProject.id}
                                                                                    isMandatory={task.isCommand && task.commandType === 'mandatory'}
                                                                                    isLink={task.isCommand && task.commandType === 'link'}
                                                                                    isUtility={task.isCommand && task.commandType === 'utility'}
                                                                                    copiedTaskId={copiedTaskId}
                                                                                    onToggle={handleToggleTask}
                                                                                    onDelete={handleDeleteTask}
                                                                                    handleCopy={handleCopy}
                                                                                    startEditing={startEditingTask}
                                                                                    isEditing={editingTaskId === task.id}
                                                                                    editValue={editValue}
                                                                                    setEditValue={setEditValue}
                                                                                    saveEdit={saveEditTask}
                                                                                    availableCommands={availableCommands}
                                                                                    onUpdateTask={handleUpdateTask}
                                                                                    themeColor="red"
                                                                                    isSelectionMode={isSelectionMode}
                                                                                    isSelected={selectedIds.has(task.id)}
                                                                                    onSelect={() => toggleSelection(task.id)}
                                                                                    disableReorder={true}
                                                                                />
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}

                                                {/* All done message */}
                                                {pendingTasks.length === 0 && completedTasks.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex flex-col items-center py-10 text-center"
                                                    >
                                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm border bg-gradient-to-br from-red-50 to-orange-50 border-red-100/50">
                                                            <CheckCircle2 size={24} className="text-red-500" />
                                                        </div>
                                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">所有任务已完成</h4>
                                                        <p className="text-xs text-gray-400 max-w-[200px]">继续添加新任务或导入指令</p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 opacity-60"
                                            >
                                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                                    <CheckSquare size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                                </div>
                                                <h4 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-2">暂无任务</h4>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">添加任务或导入指令开始工作</p>
                                                <button
                                                    onClick={() => setCommandModalOpen(true)}
                                                    className="mt-6 flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                                >
                                                    <Terminal size={14} />
                                                    <span>Import Command</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Input Footer / Bulk Actions */}
                                <div className="p-6 pt-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shrink-0 border-t border-gray-100/50 dark:border-gray-800/50 relative z-20">
                                    <AnimatePresence mode="wait">
                                        {isSelectionMode ? (
                                            <motion.div
                                                key="bulk-actions"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                className="flex items-center justify-between backdrop-blur border rounded-2xl p-2 px-4 shadow-lg bg-red-50/90 border-red-100 shadow-red-500/10"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={handleSelectAll}
                                                        className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors text-red-600 hover:text-red-700"
                                                    >
                                                        {selectedIds.size === allTasks.length ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                    <span className="text-sm font-medium text-red-900">
                                                        {selectedIds.size} Selected
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button onClick={handleBulkDelete} className="p-2 rounded-lg hover:bg-white text-red-500 hover:text-red-600 transition-all" title="Delete Selected">
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <div className="w-px h-4 mx-1 bg-red-200" />
                                                    <button onClick={handleBulkToggle} className="p-2 rounded-lg hover:bg-white transition-all text-red-600 hover:text-red-700" title="Mark Done/Undone">
                                                        <CheckSquare size={18} />
                                                    </button>
                                                    <button onClick={handleBulkCopy} className="p-2 rounded-lg hover:bg-white transition-all text-red-600 hover:text-red-700" title="Copy Content">
                                                        <Copy size={18} />
                                                    </button>
                                                    <div className="w-px h-4 mx-1 bg-red-200" />
                                                    <button
                                                        onClick={() => setIsSelectionMode(false)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                                                        title="Cancel (Esc)"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="input"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                className="relative group rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 transition-all hover:shadow-2xl flex items-center focus-within:ring-red-200 dark:focus-within:ring-red-800 focus-within:border-red-300 shadow-red-500/5 hover:shadow-red-500/10"
                                            >
                                                <input
                                                    type="text"
                                                    value={newTaskInput}
                                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(selectedProject.id)}
                                                    placeholder="添加新任务..."
                                                    className="flex-1 bg-transparent border-0 rounded-l-2xl py-4 pl-14 pr-4 transition-all outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 text-lg font-light text-gray-800 dark:text-white"
                                                />

                                                {/* Category Selector */}
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                    <button
                                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all"
                                                    >
                                                        {(() => {
                                                            const activeCat = COMMAND_CATEGORIES.find(c => c.id === newTaskCategory);
                                                            const ActiveIcon = CATEGORY_ICONS[activeCat?.icon] || LayoutGrid;
                                                            return <ActiveIcon size={18} className={activeCat?.color.split(' ')[1]} />;
                                                        })()}
                                                    </button>

                                                    <AnimatePresence>
                                                        {isCategoryOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    className="absolute bottom-full left-0 mb-3 p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 flex flex-col gap-1 min-w-[140px]"
                                                                >
                                                                    {COMMAND_CATEGORIES.map(cat => {
                                                                        const Icon = CATEGORY_ICONS[cat.icon] || LayoutGrid;
                                                                        return (
                                                                            <button
                                                                                key={cat.id}
                                                                                onClick={() => {
                                                                                    setNewTaskCategory(cat.id);
                                                                                    setIsCategoryOpen(false);
                                                                                }}
                                                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${newTaskCategory === cat.id ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                                                            >
                                                                                <Icon size={16} className={cat.color.split(' ')[1]} />
                                                                                {cat.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Multi-select Toggle */}
                                                <div className="pr-2 border-l border-gray-100 pl-2">
                                                    <button
                                                        onClick={() => setIsSelectionMode(true)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                                        title="Multi-select"
                                                    >
                                                        <ListChecks size={20} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>


                            <ConfirmDialogComponent />
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >

            <ImportCommandModal
                isOpen={commandModalOpen}
                onClose={() => setCommandModalOpen(false)}
                onImport={handleLinkCommand}
                currentStage={1}
                projectCategory={selectedProject?.category}
                themeColor="red"
            />
        </div >
    );
};

export default FinalDevModule;
