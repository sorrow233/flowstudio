import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, ExternalLink, Terminal, Tag, LayoutGrid, Monitor, Server, Database, Container, Beaker, CheckSquare, Globe } from 'lucide-react';
import { COMMAND_CATEGORIES, STAGE_EMPTY_STATES, DEV_STAGES } from '../../../../utils/constants';

const CATEGORY_ICONS = {
    'LayoutGrid': LayoutGrid,
    'Monitor': Monitor,
    'Server': Server,
    'Database': Database,
    'Container': Container,
    'Beaker': Beaker
};

const TaskList = ({ tasks, projectId, activeStage, onToggle, onDelete, onAddTask, newTaskInput, setNewTaskInput, newTaskCategory, setNewTaskCategory, onScroll }) => {
    const [copiedTaskId, setCopiedTaskId] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Filter tasks for the current active stage view
    const visibleTasks = tasks?.filter(t => (t.stage || 1) === activeStage) || [];

    // Get info for the empty state
    const stageInfo = DEV_STAGES.find(s => s.id === activeStage);
    const emptyState = STAGE_EMPTY_STATES[activeStage];

    // Helper to handle copy with feedback
    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedTaskId(id);
        setTimeout(() => setCopiedTaskId(null), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

            {/* Scrollable List with forced min-height to enable scroll events even when empty */}
            <div
                className="flex-1 overflow-y-auto px-8 pb-4 custom-scrollbar"
                onScroll={onScroll}
            >
                {/* Min-height wrapper ensures the container is always scrollable (by 1px at least if 101%) to trigger scroll events */}
                <div className="min-h-[101%] flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {visibleTasks.length > 0 ? (
                            <div className="space-y-3 min-h-[100px] pt-4 pb-20">
                                {visibleTasks.map(task => {
                                    const isMandatory = task.isCommand && task.commandType === 'mandatory';
                                    const isLink = task.isCommand && task.commandType === 'link';
                                    const isUtility = task.isCommand && task.commandType === 'utility';

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.2 } }}
                                            key={task.id}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={{ right: 0.05, left: 0.5 }}
                                            onDragEnd={(e, info) => {
                                                if (info.offset.x < -100 || info.velocity.x < -500) {
                                                    onDelete(projectId, task.id);
                                                }
                                            }}
                                            whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 50 }}
                                            onClick={() => {
                                                if (task.isCommand) {
                                                    if (isLink) {
                                                        if (task.commandUrl) window.open(task.commandUrl, '_blank');
                                                    } else {
                                                        handleCopy(task.id, task.commandContent);
                                                    }
                                                } else {
                                                    onToggle(projectId, task.id);
                                                }
                                            }}
                                            className={`
                                                group flex items-center gap-5 p-5 rounded-2xl transition-all cursor-pointer border relative overflow-hidden select-none touch-pan-y
                                                ${isMandatory && !task.done
                                                    ? 'bg-white border-red-100 shadow-sm shadow-red-100 hover:border-red-200'
                                                    : isMandatory && task.done
                                                        ? 'bg-emerald-50/50 border-emerald-100 opacity-60' // Dim mandatory when done
                                                        : isLink
                                                            ? 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                                            : task.done
                                                                ? 'bg-gray-50 border-gray-100 opacity-60'
                                                                : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5'
                                                }
                                            `}
                                        >
                                            {/* Slide Action Context */}
                                            <motion.div className="absolute inset-y-0 right-0 bg-red-500 -z-10 flex items-center justify-end pr-5 text-white font-bold uppercase tracking-wider text-xs pointer-events-none" style={{ width: '100%', x: '100%' }}>
                                                <Trash2 size={16} />
                                            </motion.div>

                                            {/* Leading Icon/Check */}
                                            {isUtility || isLink ? (
                                                <div className={`
                                                    w-10 h-10 flex items-center justify-center transition-all rounded-xl shadow-sm
                                                    ${isLink
                                                        ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                                                        : 'bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white'}
                                                `}>
                                                    {copiedTaskId === task.id ? <Check size={20} className="animate-bounce" /> : (isLink ? <Globe size={20} /> : <Terminal size={20} />)}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onToggle(projectId, task.id); }}
                                                    className={`
                                                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0
                                                        ${task.done
                                                            ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                                            : isMandatory
                                                                ? 'border-red-200 text-transparent hover:border-red-400 bg-red-50 hover:bg-red-100'
                                                                : 'border-gray-200 text-transparent group-hover:border-gray-400 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-base font-medium transition-all ${task.done ? 'opacity-50 line-through decoration-emerald-500/30' : 'text-gray-700'}`}>
                                                        {task.text}
                                                    </span>

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
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {task.commandTags.map(tag => (
                                                                    <button
                                                                        key={tag.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCopy(`${task.id}-${tag.id}`, tag.value);
                                                                        }}
                                                                        className="group/tag flex items-center gap-1 px-2 py-0.5 bg-gray-50 hover:bg-emerald-100 text-gray-500 hover:text-emerald-700 rounded text-[10px] font-medium border border-gray-200 hover:border-emerald-200 transition-all relative overflow-hidden"
                                                                    >
                                                                        <Tag size={8} className="opacity-60" />
                                                                        {tag.label}
                                                                        {copiedTaskId === `${task.id}-${tag.id}` && (
                                                                            <div className="absolute inset-0 bg-emerald-500 text-white flex items-center justify-center">
                                                                                <Check size={10} strokeWidth={3} />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Copied Feedback Badge */}
                                            {task.isCommand && copiedTaskId === task.id && (
                                                <span className="absolute top-2 right-2 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                                                    Copied
                                                </span>
                                            )}
                                        </motion.div>
                                    );
                                })}
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Footer */}
            <div className="p-8 pt-4 bg-white/90 backdrop-blur-md shrink-0 border-t border-gray-100/50 relative z-20">
                <div className="relative group shadow-xl shadow-gray-200/50 rounded-2xl bg-white ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-gray-900 transition-all hover:shadow-2xl hover:shadow-gray-200/50">
                    <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddTask(projectId)}
                        placeholder={`Add a task to ${stageInfo?.label || 'stage'}...`}
                        className="w-full bg-transparent border-0 rounded-2xl py-4 pl-14 pr-4 transition-all outline-none placeholder:text-gray-300 text-lg font-light text-gray-800"
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
                                                    onClick={() => { setNewTaskCategory(cat.id); setIsCategoryOpen(false); }}
                                                    className={`
                                                        px-3 py-2 rounded-lg transition-all flex items-center gap-3 w-full text-left
                                                        ${newTaskCategory === cat.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}
                                                    `}
                                                >
                                                    <Icon size={14} />
                                                    <span className="text-xs font-medium">{cat.label}</span>
                                                </button>
                                            )
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
