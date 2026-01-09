import React, { useState, useRef, useEffect } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Check, Trash2, ExternalLink, Terminal, Tag, CheckSquare, Globe } from 'lucide-react';

const TaskItem = ({
    task,
    projectId,
    isMandatory,
    isLink,
    isUtility,
    copiedTaskId,
    onToggle,
    onDelete,
    handleCopy,
    startEditing,
    isEditing,
    editValue,
    setEditValue,
    saveEdit,
    availableCommands,
    onUpdateTask,
    themeColor,
    isSelectionMode,
    isSelected,
    onSelect,
    disableReorder = false
}) => {
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

    const theme = COLOR_MAP[themeColor] || COLOR_MAP.emerald;

    const getCheckboxStyle = () => {
        const shapeClass = task.isCommand ? 'rounded-full' : 'rounded-md';
        if (task.done) {
            return `w-5 h-5 ${shapeClass} flex items-center justify-center transition-all ${theme.main} text-white shadow-sm scale-100`;
        }
        return `w-5 h-5 ${shapeClass} border-2 ${theme.border} bg-white transition-all shadow-sm hover:scale-105 active:scale-95 group-hover:border-opacity-100`;
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
                    if (isSelectionMode || e.shiftKey || e.metaKey || e.ctrlKey) {
                        onSelect(e);
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
                    <div className="w-10 h-10 flex items-center justify-center transition-all rounded-full shadow-sm shrink-0 bg-blue-50 text-blue-500 group-hover:bg-blue-100">
                        {isLink ? <Globe size={20} /> : <Terminal size={20} />}
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(projectId, task.id); }}
                        className={getCheckboxStyle()}
                    >
                        {/* Only show check icon when task is done */}
                        {task.done && <Check size={10} strokeWidth={3} />}
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
                                // Let event bubble to parent for selection if mode is active OR modifier keys pressed
                                if (isSelectionMode || e.shiftKey || e.metaKey || e.ctrlKey) return;

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

export default TaskItem;
