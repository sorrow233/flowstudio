import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Activity, X, Settings, ChevronRight, Menu, Plus } from 'lucide-react';

import AdvancedStageNavigation from './AdvancedStageNavigation';
import ProjectSettingsModal from './ProjectSettingsModal';
import TaskList from '../primary/TaskList'; // Reusing Primary TaskList
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useSync } from '../../../sync/SyncContext';

const DEFAULT_STAGES = [
    { id: 'design', name: 'Design', status: 'in-progress', color: '#EC4899' },
    { id: 'development', name: 'Development', status: 'pending', color: '#3B82F6' },
    { id: 'polish', name: 'Polish', status: 'pending', color: '#F59E0B' }
];

const AdvancedProjectWorkspace = ({ project, onClose, updateProject, onDeleteProject }) => {
    const { doc } = useSync();

    // Stage Management
    const stages = (project.customStages && project.customStages.length > 0) ? project.customStages : DEFAULT_STAGES;
    const [activeStageId, setActiveStageId] = useState(stages[0]?.id);
    const activeStage = stages.find(s => s.id === activeStageId) || stages[0];

    // UI State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');

    // Force sync state for real-time updates
    const { projects: allCommands } = useSyncedProjects(doc, 'all_commands');

    // Update handlers wrapper
    const handleUpdateProject = (id, updates) => {
        updateProject(id, updates);
    };

    // Calculate task counts per stage for sidebar
    const taskCounts = (project.tasks || []).reduce((acc, t) => {
        const sId = t.stageId || stages[0]?.id;
        if (!t.done) {
            acc[sId] = (acc[sId] || 0) + 1;
        }
        return acc;
    }, {});


    // Ensure active stage is valid
    useEffect(() => {
        if (!activeStageId && stages.length > 0) {
            setActiveStageId(stages[0].id);
        } else if (activeStageId && !stages.find(s => s.id === activeStageId)) {
            setActiveStageId(stages[0]?.id);
        }
    }, [stages, activeStageId]);

    // --- Task Handlers (Mirrored from PrimaryDevModule) ---

    // Note: We use 'stageId' (string) for Advanced, unlike 'stage' (number) in Primary.
    // TaskList handles filtering by 'activeStage' prop. 
    // We need to ensure TaskList compares correctly. PROBABLY TaskList expects 'activeStage' to be what matches task.stage.
    // In Primary: activeStage is 1 (int). task.stage is 1 (int).
    // In Advanced: activeStageId is 'design' (string). task.stageId is 'design' (string).
    // TaskList prop is 'activeStage'. Inside TaskList: `t.stage || 1 === activeStage`.
    // Wait, TaskList uses `t.stage || 1`.

    // We should adapt the tasks to use `stage` property to store the stage ID, or update TaskList to handle `stageId`.
    // Let's use `stage` property on tasks to store the custom stage ID string.

    const handleAddTask = (projectId) => {
        if (!newTaskInput.trim()) return;

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: newTaskInput,
            done: false,
            category: newTaskCategory,
            stage: activeStageId, // Storing ID string here
            createdAt: new Date().toISOString()
        }];
        handleUpdateProject(projectId, { tasks: newTasks });
        setNewTaskInput('');
    };

    const handleDeleteTask = (projectId, taskId) => {
        const updatedTasks = (project.tasks || []).filter(t => t.id !== taskId);
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleToggleTask = (projectId, taskId) => {
        const updatedTasks = (project.tasks || []).map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleUpdateTask = (projectId, taskId, updates) => {
        const updatedTasks = (project.tasks || []).map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleReorderTasks = (newOrder, stageId) => {
        // Filter out tasks of OTHER stages
        const otherTasks = (project.tasks || []).filter(t => (t.stage || stages[0].id) !== stageId);
        const mergedTasks = [...otherTasks, ...newOrder];
        handleUpdateProject(project.id, { tasks: mergedTasks });
    };

    // --- Stage Handlers ---
    const handleUpdateStages = (newStages) => {
        handleUpdateProject(project.id, { customStages: newStages });
        if (activeStageId && !newStages.find(s => s.id === activeStageId)) {
            setActiveStageId(newStages[0]?.id);
        }
    };

    const handleMoveTaskToStage = (taskIdString, targetStageId) => {
        // taskId comes from DragDrop dataTransfer, usually string
        const taskId = parseInt(taskIdString);
        if (!taskId || !targetStageId) return;

        const updatedTasks = (project.tasks || []).map(t =>
            t.id === taskId ? { ...t, stage: targetStageId } : t
        );
        handleUpdateProject(project.id, { tasks: updatedTasks });
    };


    // Stats
    const currentStageTasks = (project.tasks || []).filter(t => (t.stage || stages[0].id) === activeStageId);
    const completedTasks = currentStageTasks.filter(t => t.done).length;
    const totalTasks = currentStageTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                layoutId={`advanced-card-${project.id}`}
                className="w-full h-full md:w-[98vw] md:h-[96vh] bg-white dark:bg-black rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar - Reused AdvancedStageNavigation but passing taskCounts */}
                <AdvancedStageNavigation
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                    onUpdateStages={handleUpdateStages}
                    moduleCounts={taskCounts} // Passing task counts
                    onMoveModule={handleMoveTaskToStage} // Reuse prop name but logic is task move
                    isMobile={false}
                    className="hidden md:block"
                />

                {/* Mobile Sidebar */}
                <AdvancedStageNavigation
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                    onUpdateStages={handleUpdateStages}
                    moduleCounts={taskCounts}
                    onMoveModule={handleMoveTaskToStage}
                    isMobile={true}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0A0A0A] relative overflow-hidden">

                    <div>
                        <div className="flex items-center gap-2 mb-0.5 opacity-60 hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-default">Project</span>
                            <ChevronRight size={10} className="text-gray-300" />
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{project.title}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">{activeStage ? activeStage.name : 'Unknown Stage'}</span>
                            {progress > 0 && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <span className="text-[10px] font-mono text-gray-400">{progress}% Complete</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    {/* Stats Pill - Only show if useful */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5 mr-2">
                        <Activity size={10} className={progress === 100 ? "text-green-500" : "text-gray-400"} />
                        <span className="text-[10px] font-mono text-gray-500">{completedTasks} / {totalTasks}</span>
                    </div>

                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                        <Settings size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>
        </div>

                        {/* Task List Area */ }
    <div className="flex-1 overflow-hidden relative flex flex-col">
        <TaskList
            tasks={project.tasks || []}
            projectId={project.id}
            activeStage={activeStageId} // Passing string ID
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onReorder={handleReorderTasks}
            newTaskInput={newTaskInput}
            setNewTaskInput={setNewTaskInput}
            newTaskCategory={newTaskCategory}
            setNewTaskCategory={setNewTaskCategory}
            availableCommands={allCommands}
            // onImportCommand={() => {}} // TODO: Add Command Import logic if needed
            themeColor={activeStage?.color ? 'custom' : 'red'}
        />
    </div>

    {/* Quick Input (Redundant if TaskList has input? Primary TaskList HAS input at bottom) */ }
    {/* Primary TaskList renders input at bottom. So we don't need another one. */ }
                    </div >

    <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
        onUpdate={handleUpdateProject}
        onDelete={(id) => { onDeleteProject(id); onClose(); }}
    />
            </motion.div >
        </div >
    );
};

export default AdvancedProjectWorkspace;
