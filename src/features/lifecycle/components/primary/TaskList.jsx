import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LayoutGrid, Monitor, Server, Database, Container, Beaker, CheckSquare, ListChecks, Copy, X, ChevronDown, ChevronRight, CheckCircle2, Trash2, ArrowRight, Terminal } from 'lucide-react';
import { COMMAND_CATEGORIES, STAGE_EMPTY_STATES, DEV_STAGES } from '../../../../utils/constants';
import TaskItem from './TaskItem';

const CATEGORY_ICONS = {
    'LayoutGrid': LayoutGrid,
    'Monitor': Monitor,
    'Server': Server,
    'Database': Database,
    'Container': Container,
    'Beaker': Beaker
};


const TaskList = React.forwardRef(({ tasks, projectId, activeStage, onToggle, onDelete, onAddTask, onUpdateTask, newTaskInput, setNewTaskInput, newTaskCategory, setNewTaskCategory, onScroll, onReorder, onImportCommand, availableCommands }, ref) => {
    const [copiedTaskId, setCopiedTaskId] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const [localTasks, setLocalTasks] = useState([]);

    // Multi-select State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [lastSelectedId, setLastSelectedId] = useState(null); // For Shift+click range selection

    // Completed section collapse state - default collapsed
    const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

    useEffect(() => {
        const filtered = tasks?.filter(t => (t.stage || 1) === activeStage) || [];
        // Compare using stringified state to detect property changes (e.g., done status)
        const currentState = JSON.stringify(localTasks.map(t => ({ id: t.id, done: t.done, text: t.text })));
        const newState = JSON.stringify(filtered.map(t => ({ id: t.id, done: t.done, text: t.text })));
        if (currentState !== newState) {
            setLocalTasks(filtered);
        }
    }, [tasks, activeStage]);

    // Reset selection when stage changes
    useEffect(() => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    }, [activeStage]);

    // Keyboard shortcuts: Cmd/Ctrl+A for select all
    useEffect(() => {
        if (!isSelectionMode) return;

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }
            if (e.key === 'Escape') {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
                setLastSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSelectionMode, localTasks]);

    // Separate tasks into pending and completed
    const pendingTasks = localTasks.filter(t => !t.done);
    const completedTasks = localTasks.filter(t => t.done);

    // Shift+click range selection
    const handleShiftSelect = (id, e) => {
        if (!e.shiftKey || !lastSelectedId) {
            // Normal click
            toggleSelection(id);
            setLastSelectedId(id);
            return;
        }

        // Shift+click: select range
        const allIds = localTasks.map(t => t.id);
        const lastIdx = allIds.indexOf(lastSelectedId);
        const currentIdx = allIds.indexOf(id);

        if (lastIdx === -1 || currentIdx === -1) {
            toggleSelection(id);
            setLastSelectedId(id);
            return;
        }

        const start = Math.min(lastIdx, currentIdx);
        const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);

        const newSelected = new Set(selectedIds);
        rangeIds.forEach(rid => newSelected.add(rid));
        setSelectedIds(newSelected);
        if (!isSelectionMode) setIsSelectionMode(true);
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
        if (selectedIds.size === localTasks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(localTasks.map(t => t.id)));
        }
    };

    // Bulk Actions
    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (confirm(`Delete ${selectedIds.size} items?`)) {
            selectedIds.forEach(id => onDelete(projectId, id));
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        }
    };

    const handleBulkToggle = () => {
        if (selectedIds.size === 0) return;
        selectedIds.forEach(id => onToggle(projectId, id));
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    const handleBulkCopy = () => {
        if (selectedIds.size === 0) return;
        // Filter tasks to preserve order
        const selectedTasks = localTasks.filter(t => selectedIds.has(t.id));
        const textToCopy = selectedTasks
            .map(t => t.commandContent || t.text)
            .join('\n');

        navigator.clipboard.writeText(textToCopy);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    };

    // Bulk Move to Stage
    const handleBulkMove = (targetStage) => {
        if (selectedIds.size === 0 || targetStage === activeStage) return;
        selectedIds.forEach(id => {
            onUpdateTask(projectId, id, { stage: targetStage });
        });
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    };

    const handleReorder = (newOrder) => {
        setLocalTasks(newOrder);
        if (onReorder) {
            onReorder(newOrder, activeStage);
        }
    };

    const stageInfo = DEV_STAGES.find(s => s.id === activeStage);
    const emptyState = STAGE_EMPTY_STATES[activeStage];

    // Stage Themes Mapping
    const STAGE_THEMES = {
        1: 'purple',
        2: 'blue',
        3: 'violet',
        4: 'amber',
        5: 'rose'
    };
    const activeTheme = STAGE_THEMES[activeStage] || 'purple';


    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedTaskId(id);
        setTimeout(() => setCopiedTaskId(null), 2000);
    };

    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditValue(task.text);
    };

    const saveEdit = (taskId) => {
        if (editValue.trim()) {
            onUpdateTask(projectId, taskId, { text: editValue });
        }
        setEditingTaskId(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

            {/* Scrollable List */}
            <div
                ref={ref}
                className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 custom-scrollbar"
                onScroll={onScroll}
            >
                <div className="min-h-full flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {localTasks.length > 0 ? (
                            <div className="space-y-3 pt-4 pb-20">
                                {/* Pending Tasks - Reorderable */}
                                {pendingTasks.length > 0 && (
                                    <Reorder.Group
                                        axis="y"
                                        values={pendingTasks}
                                        onReorder={(newOrder) => {
                                            // Merge reordered pending with completed
                                            handleReorder([...newOrder, ...completedTasks]);
                                        }}
                                        className="space-y-3"
                                    >
                                        {pendingTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                projectId={projectId}
                                                isMandatory={task.isCommand && task.commandType === 'mandatory'}
                                                isLink={task.isCommand && task.commandType === 'link'}
                                                isUtility={task.isCommand && task.commandType === 'utility'}
                                                copiedTaskId={copiedTaskId}
                                                onToggle={onToggle}
                                                onDelete={onDelete}
                                                handleCopy={handleCopy}
                                                startEditing={startEditing}
                                                isEditing={editingTaskId === task.id}
                                                editValue={editValue}
                                                setEditValue={setEditValue}
                                                saveEdit={saveEdit}
                                                availableCommands={availableCommands}
                                                onUpdateTask={onUpdateTask}
                                                themeColor={activeTheme}
                                                isSelectionMode={isSelectionMode}
                                                isSelected={selectedIds.has(task.id)}
                                                onSelect={(e) => handleShiftSelect(task.id, e)}
                                            />
                                        ))}
                                    </Reorder.Group>
                                )}

                                {/* Completed Tasks Section - Collapsible */}
                                {completedTasks.length > 0 && (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 pt-4 border-t border-dashed border-gray-200"
                                    >
                                        {/* Completed Section Header */}
                                        <button
                                            onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                                            className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-purple-50/50 rounded-xl transition-all group"
                                        >
                                            <motion.div
                                                animate={{ rotate: isCompletedCollapsed ? 0 : 90 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100/80 text-purple-600"
                                            >
                                                <ChevronRight size={12} strokeWidth={2.5} />
                                            </motion.div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-purple-500" />
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">已完成</span>
                                            </div>
                                            <div className="flex-1" />
                                            <span className="text-[11px] font-bold text-purple-600/80 bg-purple-50 px-2 py-0.5 rounded-md tabular-nums">
                                                {completedTasks.length}
                                            </span>
                                        </button>

                                        {/* Completed Tasks List */}
                                        <AnimatePresence initial={false}>
                                            {!isCompletedCollapsed && (
                                                <motion.div
                                                    key="completed-list"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                        transition: {
                                                            height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                                            opacity: { duration: 0.2, delay: 0.1 }
                                                        }
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        height: 0,
                                                        transition: {
                                                            height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                                                            opacity: { duration: 0.1 }
                                                        }
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-2 pt-2 pb-2">
                                                        {completedTasks.map((task, index) => (
                                                            <motion.div
                                                                key={task.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                    transition: { delay: index * 0.03 }
                                                                }}
                                                            >
                                                                <TaskItem
                                                                    task={task}
                                                                    projectId={projectId}
                                                                    isMandatory={task.isCommand && task.commandType === 'mandatory'}
                                                                    isLink={task.isCommand && task.commandType === 'link'}
                                                                    isUtility={task.isCommand && task.commandType === 'utility'}
                                                                    copiedTaskId={copiedTaskId}
                                                                    onToggle={onToggle}
                                                                    onDelete={onDelete}
                                                                    handleCopy={handleCopy}
                                                                    startEditing={startEditing}
                                                                    isEditing={editingTaskId === task.id}
                                                                    editValue={editValue}
                                                                    setEditValue={setEditValue}
                                                                    saveEdit={saveEdit}
                                                                    availableCommands={availableCommands}
                                                                    onUpdateTask={onUpdateTask}
                                                                    themeColor={activeTheme}
                                                                    isSelectionMode={isSelectionMode}
                                                                    isSelected={selectedIds.has(task.id)}
                                                                    onSelect={(e) => handleShiftSelect(task.id, e)}
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

                                {/* Empty pending state when all tasks are done */}
                                {pendingTasks.length === 0 && completedTasks.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.4 }}
                                        className="flex flex-col items-center py-10 text-center"
                                    >
                                        <motion.div
                                            className="w-14 h-14 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-100/50"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                rotate: [0, 3, -3, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                        >
                                            <CheckCircle2 size={24} className="text-purple-500" />
                                        </motion.div>
                                        <h4 className="text-base font-semibold text-gray-800 mb-1">阶段任务已完成</h4>
                                        <p className="text-xs text-gray-400 max-w-[200px]">所有任务都已完成，可以进入下一阶段</p>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 opacity-60"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckSquare size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                </div>
                                <h4 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-2">{emptyState?.title}</h4>
                                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">{emptyState?.desc}</p>
                                <button
                                    onClick={onImportCommand}
                                    className="mt-6 flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                >
                                    <Terminal size={14} />
                                    <span>Import Command</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Footer / Bulk Actions */}
            <div className="p-8 pt-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shrink-0 border-t border-gray-100/50 dark:border-gray-800/50 relative z-20">
                <AnimatePresence mode="wait">
                    {isSelectionMode ? (
                        <motion.div
                            key="bulk-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`flex items-center justify-between bg-purple-50/90 backdrop-blur border border-purple-100 rounded-2xl p-2 px-4 shadow-lg shadow-purple-500/10`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleSelectAll()}
                                    className={`text-xs font-bold uppercase tracking-wider text-purple-600 hover:text-purple-700 px-2 py-1 rounded transition-colors`}
                                >
                                    {selectedIds.size === localTasks.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className={`text-sm font-medium text-purple-900`}>
                                    {selectedIds.size} Selected
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedIds.size === 0}
                                    className={`p-2 rounded-lg hover:bg-white text-red-500 hover:text-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                    title="Delete Selected"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className={`w-px h-4 bg-purple-200 mx-1`} />
                                <button
                                    onClick={handleBulkToggle}
                                    disabled={selectedIds.size === 0}
                                    className={`p-2 rounded-lg hover:bg-white text-purple-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                    title="Mark Done/Undone"
                                >
                                    <CheckSquare size={18} />
                                </button>
                                <button
                                    onClick={handleBulkCopy}
                                    disabled={selectedIds.size === 0}
                                    className={`p-2 rounded-lg hover:bg-white text-purple-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                    title="Copy Content"
                                >
                                    <Copy size={18} />
                                </button>
                                <div className={`w-px h-4 bg-purple-200 mx-1`} />
                                {/* Move to Stage Buttons */}
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
                                        <ArrowRight size={12} /> Move
                                    </span>
                                    {DEV_STAGES.filter(s => s.id !== activeStage).map(stage => {
                                        const stageColors = {
                                            1: 'hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-200',
                                            2: 'hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200',
                                            3: 'hover:bg-violet-100 hover:text-violet-700 hover:border-violet-200',
                                            4: 'hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200',
                                            5: 'hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200'
                                        };
                                        return (
                                            <button
                                                key={stage.id}
                                                onClick={() => handleBulkMove(stage.id)}
                                                disabled={selectedIds.size === 0}
                                                className={`px-2 py-1 rounded-md text-[10px] font-medium border border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 bg-white/50 ${stageColors[stage.id]}`}
                                                title={`Move to ${stage.label}`}
                                            >
                                                {stage.label.split(' ')[0]}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className={`w-px h-4 bg-purple-200 mx-1`} />
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
                            className="relative group shadow-xl shadow-purple-500/5 dark:shadow-none rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-800 focus-within:border-purple-300 transition-all hover:shadow-2xl hover:shadow-purple-500/10 flex items-center"
                        >
                            <input
                                type="text"
                                value={newTaskInput}
                                onChange={(e) => setNewTaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onAddTask(projectId)}
                                placeholder={`Add a task to ${stageInfo?.label || 'stage'}...`}
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
                                        return <ActiveIcon size={18} className={activeCat?.color.split(' ')[1]} />
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
        </div >
    );
});

TaskItem.displayName = 'TaskItem';
TaskList.displayName = 'TaskList';

export default TaskList;
