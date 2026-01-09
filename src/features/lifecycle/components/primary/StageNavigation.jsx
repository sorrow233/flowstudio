import React from 'react';
import { Layers, MonitorPlay, Container, Flower2, Flag, Check, Lock, Terminal, CheckSquare, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEV_STAGES } from '../../../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Container,
    4: Flower2,
    5: Flag,
    6: CheckCircle2
};

const StageNavigation = ({ viewStage, onViewChange, currentProgress, onToggleComplete, customStageNames = {}, onRenameStage, stageStats = {}, stages = DEV_STAGES, extraStages = [] }) => {
    const [editingStageId, setEditingStageId] = React.useState(null);
    const [editValue, setEditValue] = React.useState('');

    const startEditing = (e, stage) => {
        e.stopPropagation();
        setEditingStageId(stage.id);
        const currentName = customStageNames[stage.id] || stage.label;
        setEditValue(currentName);
    };

    const cancelEditing = () => {
        setEditingStageId(null);
        setEditValue('');
    };

    const saveEditing = () => {
        if (!editingStageId) return;
        if (editValue.trim()) {
            onRenameStage(editingStageId, editValue.trim());
        }
        setEditingStageId(null);
        setEditValue('');
    };
    return (
        <div className="w-full md:w-80 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 md:p-8 overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar relative flex md:block gap-4 md:gap-0 items-center md:items-stretch no-scrollbar">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest md:mb-8 px-2 hidden md:block">Pipeline Stages</h3>

            <div className="flex md:block gap-4 md:gap-0 md:space-y-4 relative w-full md:w-auto">
                {/* Circuit Line Background - Desktop Only */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100/80 z-0 overflow-hidden rounded-full hidden md:block">
                    {/* Progress Line - Based on Actual Progress, not View */}

                </div>

                {stages.map((stage) => {
                    const isViewActive = viewStage === stage.id;
                    const isCompleted = currentProgress > stage.id;
                    const isCurrentProgress = currentProgress === stage.id;
                    // const isLocked = currentProgress < stage.id; // Removed lock logic as per user request

                    const stats = stageStats[stage.id] || { taskCount: 0, commandCount: 0 };
                    const Icon = STAGE_ICONS[stage.id];

                    return (
                        <div
                            key={stage.id}
                            className={`
                                relative z-10 flex items-center p-2 rounded-xl transition-all duration-300 group min-w-[260px] md:min-w-0
                                ${isViewActive ? 'bg-gray-900 dark:bg-gray-800 shadow-xl shadow-gray-200 dark:shadow-none ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                            `}
                        >
                            {/* Clickable Area for VIEWING */}
                            <div
                                onClick={() => onViewChange(stage.id)}
                                className="flex items-center gap-3 cursor-pointer min-w-0 w-full"
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 relative
                                    ${isViewActive
                                        ? 'bg-white/20 text-white shadow-inner'
                                        : isCompleted
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : isCurrentProgress
                                                ? 'bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Check size={16} strokeWidth={3} />
                                    ) : (
                                        <Icon size={18} className={`${isCurrentProgress ? 'animate-pulse' : ''}`} />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    {editingStageId === stage.id ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={saveEditing}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEditing();
                                                if (e.key === 'Escape') cancelEditing();
                                                e.stopPropagation(); // Prevent triggering other listeners
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-transparent border-b border-white/50 text-white text-sm font-bold tracking-tight outline-none p-0"
                                        />
                                    ) : (
                                        <div
                                            title="Double click to rename"
                                            className={`text-sm font-bold tracking-tight transition-colors cursor-text ${isViewActive ? 'text-white' : isCompleted ? 'text-emerald-900 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {customStageNames[stage.id] || stage.label}
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-2 mt-0.5 text-[10px] truncate transition-colors ${isViewActive ? 'text-white/50' : 'text-gray-400'}`}>
                                        <span className={isCompleted ? 'text-emerald-600/70' : ''}>{isCompleted ? 'Completed' : isCurrentProgress ? 'In Progress' : 'Pending'}</span>

                                        {/* Content Badges */}
                                        {!isCompleted && (stats.commandCount > 0 || stats.taskCount > 0) && (
                                            <div className="flex items-center gap-2 ml-1 opacity-80">
                                                {stats.commandCount > 0 && (
                                                    <span className="flex items-center gap-0.5" title={`${stats.commandCount} Commands awaiting`}>
                                                        <Terminal size={8} /> {stats.commandCount}
                                                    </span>
                                                )}
                                                {stats.taskCount > 0 && (
                                                    <span className="flex items-center gap-0.5" title={`${stats.taskCount} Tasks awaiting`}>
                                                        <CheckSquare size={8} /> {stats.taskCount}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Manual Completion Dot - Double Click to Toggle */}
                                <div className="group/dot relative flex items-center justify-center ml-2">
                                    <motion.button
                                        whileHover={{ scale: 1.5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (isCompleted) {
                                                onToggleComplete(stage.id, false);
                                            } else {
                                                onToggleComplete(stage.id, true);
                                            }
                                        }}
                                        className={`
                                            w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm
                                            ${isCompleted
                                                ? 'bg-emerald-500 shadow-emerald-200 ring-2 ring-emerald-100'
                                                : (() => {
                                                    const stageColors = {
                                                        1: 'bg-blue-400',
                                                        2: 'bg-emerald-400',
                                                        3: 'bg-violet-400',
                                                        4: 'bg-amber-400',
                                                        5: 'bg-rose-400',
                                                        6: 'bg-emerald-400'
                                                    };
                                                    return stageColors[stage.id] || 'bg-gray-300';
                                                })()
                                            }
                                        `}
                                        title={isCompleted ? "Double click to undo" : "Double click to complete"}
                                    />
                                    {/* Minimal Hover Hint */}
                                    <div className="absolute right-0 top-full mt-1 opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                        <span className="bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg">
                                            Double Click
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Additional Flows Section */}
                {extraStages.length > 0 && (
                    <>
                        <div className="my-6 border-t border-gray-100 relative">
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2 bg-white text-[10px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
                                Other Flows
                            </span>
                        </div>
                        {extraStages.map((stage) => {
                            const isViewActive = viewStage === stage.id;
                            const stats = stageStats[stage.id] || { taskCount: 0, commandCount: 0 };
                            const Icon = stage.id === 6 ? CheckCircle2 : (STAGE_ICONS[stage.id] || Zap);

                            return (
                                <div
                                    key={stage.id}
                                    className={`
                                        relative z-10 flex items-center p-2 rounded-xl transition-all duration-300 group min-w-[260px] md:min-w-0
                                        ${isViewActive ? 'bg-gray-900 dark:bg-gray-800 shadow-xl shadow-gray-200 dark:shadow-none ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                    `}
                                >
                                    <div
                                        onClick={() => onViewChange(stage.id)}
                                        className="flex items-center gap-3 cursor-pointer min-w-0 w-full"
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 relative
                                            ${isViewActive
                                                ? 'bg-white/20 text-white shadow-inner'
                                                : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                                            }
                                        `}>
                                            <Icon size={18} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className={`text-sm font-bold tracking-tight transition-colors ${isViewActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {customStageNames[stage.id] || stage.label}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-0.5 text-[10px] truncate transition-colors ${isViewActive ? 'text-white/50' : 'text-gray-400'}`}>
                                                <span>Active Phase</span>
                                            </div>
                                        </div>

                                        {/* Status Dot */}
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm ml-2" />
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

export default StageNavigation;
