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

                            {/* Manual Completion Switch */}
                            {/* Only show for current or completed stages (allow undo) */}
                            {(!isLocked) && (
                                <div className="pl-2 border-l border-gray-100/10 ml-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Toggle: If completed (isCompleted is true), mark false (undo). 
                                            // If current (isCompleted is false), mark true (complete).
                                            // Wait, logic check: 
                                            // If I am at Stage 3. Stage 1 and 2 are < 3 (Completed).
                                            // If I click Stage 1 toggle -> Undo?
                                            // If I undo Stage 1, Stage 2 also becomes invalid/locked effectively.
                                            // Handling pure standard logic:
                                            // If isCompleted -> Undo this stage means setting progress TO this stage.
                                            // If isCurrent -> Complete this stage means setting progress TO Next stage.

                                            if (isCompleted) {
                                                // Undo: Set progress back to THIS stage
                                                onToggleComplete(stage.id, false);
                                            } else {
                                                // Complete: Set progress to NEXT stage (stage.id + 1)
                                                // BUT, user said "5 switches". 
                                                // If I complete Stage 5 -> Progress 6.
                                                onToggleComplete(stage.id, true);
                                            }
                                        }}
                                        className={`
                                            w-10 h-6 rounded-full flex items-center transition-colors duration-300 relative
                                            ${isCompleted || (isCurrentProgress && false) // Logic fix: Switch is ON if isCompleted
                                                ? 'bg-emerald-500 justify-end'
                                                : 'bg-gray-200 justify-start hover:bg-gray-300'
                                            }
                                            ${isViewActive ? 'ring-1 ring-white/20' : ''}
                                        `}
                                        title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                                    >
                                        <motion.div
                                            layout
                                            className="w-4 h-4 bg-white rounded-full shadow-sm mx-1"
                                        />
                                    </button>
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
