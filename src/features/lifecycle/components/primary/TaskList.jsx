import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Check, Trash2, ExternalLink, Terminal, Tag, LayoutGrid, Monitor, Server, Database, Container, Beaker, CheckSquare, Globe, Edit2, RefreshCw, ListChecks, Copy, X, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { COMMAND_CATEGORIES, STAGE_EMPTY_STATES, DEV_STAGES } from '../../../../utils/constants';

const CATEGORY_ICONS = {
    'LayoutGrid': LayoutGrid,
    'Monitor': Monitor,
    'Server': Server,
    'Database': Database,
    'Container': Container,
    'Beaker': Beaker
};

// Separated Task Item Component to handle individual drag controls properly
const TaskItem = ({ task, projectId, isMandatory, isLink, isUtility, copiedTaskId, onToggle, onDelete, handleCopy, startEditing, isEditing, editValue, setEditValue, saveEdit, availableCommands, onUpdateTask, themeColor, isSelectionMode, isSelected, onSelect, disableReorder = false }) => {
    const dragControls = useDragControls();

    // Long Press Logic
    const longPressTimer = useRef(null);
    const isLongPress = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const [isGrabbing, setIsGrabbing] = useState(false);
    const lastClickTimeRef = useRef(0); // For manual double-click detection

    const handlePointerDown = (e) => {
        // Prevent default only if needed, but here we want to allow potential swipes
        startPos.current = { x: e.clientX, y: e.clientY };
        isLongPress.current = false;

        // Disable drag/long-press in selection mode
        if (isSelectionMode) return;

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setIsGrabbing(true);
            if (navigator.vibrate) navigator.vibrate(50);
            dragControls.start(e);
        }, 300); // 300ms long press threshold
    };

    const handlePointerMove = (e) => {
        if (longPressTimer.current && !isLongPress.current) {
            const moveX = Math.abs(e.clientX - startPos.current.x);
            const moveY = Math.abs(e.clientY - startPos.current.y);
            // Cancel if moved more than 10px (swipe/scroll intent)
            if (moveX > 10 || moveY > 10) {
                clearTimeout(longPressTimer.current);
            }
        }
    };

    const handlePointerUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
        setIsGrabbing(false);
    };

    // Auto-sync outdated commands
    const sourceCommand = task.isCommand && availableCommands?.find(c => c.id === task.commandId);
    const isOutdated = sourceCommand && (sourceCommand.content !== task.commandContent || sourceCommand.title !== task.text);

    // Automatically update if outdated (silent sync)
    useEffect(() => {
        if (isOutdated && onUpdateTask) {
            onUpdateTask(projectId, task.id, {
                text: sourceCommand.title,
                commandContent: sourceCommand.content,
                commandTags: sourceCommand.tags || []
            });
        }
    }, [isOutdated, sourceCommand, task.id, projectId, onUpdateTask]);

    // Explicit Color Mapping for Tailwind (Dynamic template literals don't work reliably with JIT/Purge)
    const COLOR_MAP = {
        emerald: {
            main: 'bg-emerald-500 border-emerald-500',
            border: 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50',
            decoration: 'decoration-emerald-500/30',
            inputBorder: 'border-emerald-200',
            inputRing: 'focus:ring-emerald-100',
            grab: 'border-emerald-300 ring-emerald-100 bg-emerald-50/10',
            action: 'hover:text-emerald-500 hover:bg-emerald-50'
        },
        blue: {
            main: 'bg-blue-500 border-blue-500',
            border: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50',
            decoration: 'decoration-blue-500/30',
            inputBorder: 'border-blue-200',
            inputRing: 'focus:ring-blue-100',
            grab: 'border-blue-300 ring-blue-100 bg-blue-50/10',
            action: 'hover:text-blue-500 hover:bg-blue-50'
        },
        violet: {
            main: 'bg-violet-500 border-violet-500',
            border: 'border-violet-300 hover:border-violet-400 hover:bg-violet-50',
            decoration: 'decoration-violet-500/30',
            inputBorder: 'border-violet-200',
            inputRing: 'focus:ring-violet-100',
            grab: 'border-violet-300 ring-violet-100 bg-violet-50/10',
            action: 'hover:text-violet-500 hover:bg-violet-50'
        },
        amber: {
            main: 'bg-amber-500 border-amber-500',
            border: 'border-amber-300 hover:border-amber-400 hover:bg-amber-50',
            decoration: 'decoration-amber-500/30',
            inputBorder: 'border-amber-200',
            inputRing: 'focus:ring-amber-100',
            grab: 'border-amber-300 ring-amber-100 bg-amber-50/10',
            action: 'hover:text-amber-500 hover:bg-amber-50'
        },
        rose: {
            main: 'bg-rose-500 border-rose-500',
            border: 'border-rose-300 hover:border-rose-400 hover:bg-rose-50',
            decoration: 'decoration-rose-500/30',
            inputBorder: 'border-rose-200',
            inputRing: 'focus:ring-rose-100',
            grab: 'border-rose-300 ring-rose-100 bg-rose-50/10',
            action: 'hover:text-rose-500 hover:bg-rose-50'
        }
    };

    // Fallback
    const theme = COLOR_MAP[themeColor] || COLOR_MAP.emerald;

    // Dynamic Color Classes
    const getCheckboxStyle = () => {
        // Dynamic Color Classes (Force hash refresh)
        const base = `shrink-0 flex items-center justify-center transition-all duration-300 border-2`;
        // Unified smaller size w-4 h-4 (16px), Commands=Circle, Tasks=Square (rounded for subtle corners)
        const shape = task.isCommand ? 'w-4 h-4 rounded-full' : 'w-4 h-4 rounded';

        if (task.done) {
            // Completed state
            return `${base} ${shape} ${theme.main} text-white`;
        }

        // Idle state
        if (task.isCommand) {
            return `${base} ${shape} ${theme.border} bg-transparent text-transparent`;
        } else {
            // Default Task Idle
            if (isMandatory) return `${base} ${shape} border-red-200 text-transparent hover:border-red-400 bg-red-50`;
            return `${base} ${shape} border-gray-200 text-transparent group-hover:border-gray-400 hover:bg-gray-50`;
        }
    };

    // Wrapper component based on disableReorder
    const Wrapper = disableReorder ? motion.div : Reorder.Item;
    const wrapperProps = disableReorder
        ? {
            initial: { opacity: 0, scale: 0.95, y: 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
            className: "relative"
        }
        : {
            value: task,
            id: task.id,
            dragListener: !isSelectionMode,
            dragControls: dragControls,
            initial: { opacity: 0, scale: 0.95, y: 10 },
            animate: {
                opacity: 1,
                scale: isGrabbing ? 1.02 : 1,
                y: 0,
                transition: { scale: { duration: 0.2 } }
            },
            exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
            className: "relative",
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerUp
        };

    return (
        <Wrapper {...wrapperProps}>
            <motion.div
                drag={(isSelectionMode || isEditing || disableReorder) ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ right: 0.05, left: 0.5 }}
                onDragEnd={(e, info) => {
                    if (info.offset.x < -100 || info.velocity.x < -500) {
                        onDelete(projectId, task.id);
                    }
                    setIsGrabbing(false);
                }}
                onPointerDown={disableReorder ? undefined : handlePointerDown}
                onPointerMove={disableReorder ? undefined : handlePointerMove}
                onClick={(e) => {
                    if (isSelectionMode) {
                        onSelect();
                        return;
                    }
                    // Manual double-click detection (Framer Motion drag conflicts with native dblclick)
                    const now = Date.now();
                    const DOUBLE_CLICK_THRESHOLD = 300;
                    if (lastClickTimeRef.current && (now - lastClickTimeRef.current < DOUBLE_CLICK_THRESHOLD)) {
                        // Double click detected
                        if (task.isCommand) {
                            onToggle(projectId, task.id);
                        } else {
                            startEditing(task);
                        }
                        lastClickTimeRef.current = 0; // Reset
                    } else {
                        lastClickTimeRef.current = now;
                    }
                }}
                className={`
                    group flex items-center gap-4 p-5 rounded-2xl transition-all border relative overflow-hidden select-none touch-pan-y
                    ${isSelectionMode && isSelected
                        ? `border-${themeColor}-400 ring-1 ring-${themeColor}-400 bg-${themeColor}-50`
                        : ''}
                    ${isGrabbing ? `shadow-md ring-1 ${theme.grab}` : ''}
                    ${!isSelectionMode && isMandatory && !task.done
                        ? 'bg-white border-red-100 shadow-sm shadow-red-100 hover:border-red-200'
                        : !isSelectionMode && isMandatory && task.done
                            ? 'bg-emerald-50/50 border-emerald-100 opacity-60'
                            : !isSelectionMode && isLink
                                ? 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                : !isSelectionMode && task.done
                                    ? 'bg-gray-50 border-gray-100 opacity-60'
                                    : !isSelectionMode && !isSelected
                                        ? 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5'
                                        : ''
                    }
                `}
            >
                {/* Slide Action Context (Behind content) */}
                <motion.div className="absolute inset-y-0 right-0 bg-red-500 -z-10 flex items-center justify-end pr-5 text-white font-bold uppercase tracking-wider text-xs pointer-events-none" style={{ width: '100%', x: '100%' }}>
                    <Trash2 size={16} />
                </motion.div>


                {/* Leading Icon/Check */}
                {isLink ? (
                    <div className="w-10 h-10 flex items-center justify-center transition-all rounded-xl shadow-sm shrink-0 bg-blue-50 text-blue-500 group-hover:bg-blue-100">
                        {isLink ? <Globe size={20} /> : <Terminal size={20} />}
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(projectId, task.id); }}
                        className={getCheckboxStyle()}
                    >
                        {/* Icon size adjusted for 16px checkbox */}
                        <Check size={10} strokeWidth={3} />
                    </button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(task.id)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                            className={`w-full bg-white border rounded px-2 py-1 text-base focus:ring-2 outline-none ${theme.inputBorder} ${theme.inputRing}`}
                        />
                    ) : (

                        <div
                            className={`flex flex-col gap-1 ${task.isCommand ? 'cursor-pointer' : ''}`}
                            onClick={(e) => {
                                if (isSelectionMode) return; // Let event bubble to parent for selection
                                if (task.isCommand && handleCopy) {
                                    // Remove stopPropagation to ensure double-click bubbles correctly
                                    handleCopy(task.id, task.commandContent || task.text);
                                }
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`text-base font-medium transition-all truncate ${task.done ? `opacity-60 line-through decoration-2 text-gray-400 ${theme.decoration}` : 'text-gray-700'}`}>
                                    {task.text}
                                </span>
                            </div>

                            {/* Tags Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                {isMandatory && (
                                    <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
                                        Mandatory
                                    </span>
                                )}
                                {isLink && (
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100 flex items-center gap-1">
                                        <ExternalLink size={8} /> Link
                                    </span>
                                )}

                                {/* Command Tags */}
                                {(task.commandTags && task.commandTags.length > 0) && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {task.commandTags.map(tag => {
                                            // Simple color rotation matching ImportCommandModal
                                            const colors = [
                                                'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
                                                'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
                                                'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100',
                                                'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100'
                                            ];
                                            const colorClass = colors[tag.label.length % colors.length];

                                            return (
                                                <button
                                                    key={tag.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(`${task.id}-${tag.id}`, tag.value);
                                                    }}
                                                    className={`group/tag flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all relative overflow-hidden ${colorClass}`}
                                                >
                                                    <Tag size={8} className="opacity-70" />
                                                    {tag.label}
                                                    {copiedTaskId === `${task.id}-${tag.id}` && (
                                                        <div className="absolute inset-0 bg-emerald-500 text-white flex items-center justify-center">
                                                            <Check size={8} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Copied Feedback Badge */}
                {task.isCommand && copiedTaskId === task.id && (
                    <span className="absolute top-2 right-2 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                        Copied
                    </span>
                )}
            </motion.div>
        </Wrapper>
    );
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
    }, [activeStage]);

    // Separate tasks into pending and completed
    const pendingTasks = localTasks.filter(t => !t.done);
    const completedTasks = localTasks.filter(t => t.done);

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
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
        1: 'emerald',
        2: 'blue',
        3: 'violet',
        4: 'amber',
        5: 'rose'
    };
    const activeTheme = STAGE_THEMES[activeStage] || 'emerald';

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
                className="flex-1 overflow-y-auto px-8 pb-4 custom-scrollbar"
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
                                                onSelect={() => toggleSelection(task.id)}
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
                                            className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-emerald-50/50 rounded-xl transition-all group"
                                        >
                                            <motion.div
                                                animate={{ rotate: isCompletedCollapsed ? 0 : 90 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100/80 text-emerald-600"
                                            >
                                                <ChevronRight size={12} strokeWidth={2.5} />
                                            </motion.div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">已完成</span>
                                            </div>
                                            <div className="flex-1" />
                                            <span className="text-[11px] font-bold text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums">
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

                                {/* Empty pending state when all tasks are done */}
                                {pendingTasks.length === 0 && completedTasks.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.4 }}
                                        className="flex flex-col items-center py-10 text-center"
                                    >
                                        <motion.div
                                            className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-100/50"
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
                                            <CheckCircle2 size={24} className="text-emerald-500" />
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
                                    <CheckSquare size={32} className="text-gray-300" strokeWidth={1} />
                                </div>
                                <h4 className="text-xl font-light text-gray-900 mb-2">{emptyState?.title}</h4>
                                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{emptyState?.desc}</p>
                                <button
                                    onClick={onImportCommand}
                                    className="mt-6 flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm hover:shadow-md"
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
            <div className="p-8 pt-4 bg-white/90 backdrop-blur-md shrink-0 border-t border-gray-100/50 relative z-20">
                <AnimatePresence mode="wait">
                    {isSelectionMode ? (
                        <motion.div
                            key="bulk-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`flex items-center justify-between bg-${activeTheme}-50/50 border border-${activeTheme}-100 rounded-2xl p-2 px-4 shadow-lg shadow-${activeTheme}-100/20`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleSelectAll()}
                                    className={`text-xs font-bold uppercase tracking-wider text-${activeTheme}-600 hover:text-${activeTheme}-700 px-2 py-1 rounded transition-colors`}
                                >
                                    {selectedIds.size === localTasks.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className={`text-sm font-medium text-${activeTheme}-900`}>
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
                                <div className={`w-px h-4 bg-${activeTheme}-200 mx-1`} />
                                <button
                                    onClick={handleBulkToggle}
                                    disabled={selectedIds.size === 0}
                                    className={`p-2 rounded-lg hover:bg-white text-${activeTheme}-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                    title="Mark Done/Undone"
                                >
                                    <CheckSquare size={18} />
                                </button>
                                <button
                                    onClick={handleBulkCopy}
                                    disabled={selectedIds.size === 0}
                                    className={`p-2 rounded-lg hover:bg-white text-${activeTheme}-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                    title="Copy Content"
                                >
                                    <Copy size={18} />
                                </button>
                                <div className={`w-px h-4 bg-${activeTheme}-200 mx-1`} />
                                <button
                                    onClick={() => setIsSelectionMode(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                                    title="Cancel"
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
                            className="relative group shadow-xl shadow-gray-200/50 rounded-2xl bg-white ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-gray-900 transition-all hover:shadow-2xl hover:shadow-gray-200/50 flex items-center"
                        >
                            <input
                                type="text"
                                value={newTaskInput}
                                onChange={(e) => setNewTaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onAddTask(projectId)}
                                placeholder={`Add a task to ${stageInfo?.label || 'stage'}...`}
                                className="flex-1 bg-transparent border-0 rounded-l-2xl py-4 pl-14 pr-4 transition-all outline-none placeholder:text-gray-300 text-lg font-light text-gray-800"
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
                                                className="absolute bottom-full left-0 mb-3 p-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col gap-1 min-w-[140px]"
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
                                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${newTaskCategory === cat.id ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
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
    );
});

TaskItem.displayName = 'TaskItem';
TaskList.displayName = 'TaskList';

export default TaskList;
