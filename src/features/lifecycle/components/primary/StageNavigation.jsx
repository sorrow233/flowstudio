import React from 'react';
import { Layers, MonitorPlay, Container, Sparkles, Flag, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEV_STAGES } from '../../../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Container,
    4: Sparkles,
    5: Flag
};

const StageNavigation = ({ viewStage, onViewChange, currentProgress, onToggleComplete }) => {
    return (
        <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 overflow-y-auto shrink-0 custom-scrollbar relative">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-8 px-2">Pipeline Stages</h3>

            <div className="space-y-4 relative">
                {/* Circuit Line Background */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100/80 z-0 overflow-hidden rounded-full">
                    {/* Progress Line - Based on Actual Progress, not View */}
                    <div
                        className="w-full bg-emerald-500/30 transition-all duration-700 ease-in-out absolute top-0"
                        style={{ height: `${Math.min(((currentProgress - 1) / 5) * 100, 100)}%` }}
                    />
                </div>

                {DEV_STAGES.map((stage) => {
                    const isViewActive = viewStage === stage.id;
                    const isCompleted = currentProgress > stage.id;
                    const isCurrentProgress = currentProgress === stage.id;
                    const isLocked = currentProgress < stage.id; // Future stages

                    const Icon = STAGE_ICONS[stage.id];

                    return (
                        <div
                            key={stage.id}
                            className={`
                                relative z-10 flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group
                                ${isViewActive ? 'bg-gray-900 shadow-xl shadow-gray-200 ring-1 ring-black/5' : 'hover:bg-gray-50'}
                            `}
                        >
                            {/* Clickable Area for VIEWING */}
                            <div
                                onClick={() => onViewChange(stage.id)}
                                className="flex items-center gap-4 flex-1 cursor-pointer min-w-0"
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 relative
                                    ${isViewActive
                                        ? 'bg-white/20 text-white shadow-inner'
                                        : isCompleted
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : isCurrentProgress
                                                ? 'bg-white border-2 border-emerald-500 text-emerald-600'
                                                : 'bg-white border-2 border-gray-100 text-gray-300'
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Check size={16} strokeWidth={3} />
                                    ) : isLocked ? (
                                        <Lock size={14} className="text-gray-300" />
                                    ) : (
                                        <Icon size={18} className={`${isCurrentProgress ? 'animate-pulse' : ''}`} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-bold tracking-tight transition-colors ${isViewActive ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-gray-600'}`}>
                                        {stage.label}
                                    </div>
                                    <div className={`text-[10px] truncate transition-colors ${isViewActive ? 'text-white/50' : 'text-gray-400'}`}>
                                        {isCompleted ? 'Completed' : isCurrentProgress ? 'In Progress' : 'Locked'}
                                    </div>
                                </div>
                            </div>

                            {/* Manual Completion Dot - Double Click to Toggle */}
                            {/* Only show for current or completed stages (allow undo) */}
                            {(!isLocked) && (
                                <div className="pl-2 border-l border-gray-100/10 ml-2 group/dot relative">
                                    <motion.button
                                        whileHover={{ scale: 1.3 }}
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
                                            w-4 h-4 rounded-full transition-all duration-300 shadow-sm
                                            ${isCompleted
                                                ? 'bg-emerald-500 shadow-emerald-200'
                                                : (() => {
                                                    // Different colors for each stage
                                                    const stageColors = {
                                                        1: 'bg-slate-400',
                                                        2: 'bg-blue-400',
                                                        3: 'bg-violet-400',
                                                        4: 'bg-amber-400',
                                                        5: 'bg-rose-400'
                                                    };
                                                    return stageColors[stage.id] || 'bg-gray-300';
                                                })()
                                            }
                                        `}
                                        title={isCompleted ? "Double click to undo" : "Double click to complete"}
                                    />
                                    {/* Hover Hint Tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                        <span className="bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-lg font-medium">
                                            Double click to {isCompleted ? 'undo' : 'complete'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend / Tip */}
            <div className="mt-8 px-4 py-3 bg-gray-50 rounded-xl text-[10px] text-gray-400 leading-relaxed border border-gray-100">
                <p><strong>提示:</strong> 自由查看各阶段。使用 <span className="inline-block w-6 h-3 bg-gray-200 rounded-full align-middle mx-1"></span> 开关手动标记阶段完成。</p>
            </div>
        </div>
    );
};

export default StageNavigation;
