import React from 'react';
import { Layers, MonitorPlay, Container, Sparkles, Flag, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEV_STAGES } from '../../../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Container,
    4: Sparkles,
    5: Flag
};

const StageNavigation = ({ activeStage, currentStage, onStageSelect }) => {
    return (
        <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 overflow-y-auto shrink-0 custom-scrollbar relative">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-8 px-2">System Status</h3>

            <div className="space-y-0 relative">
                {/* Circuit Line Background */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100/80 z-0 overflow-hidden rounded-full">
                    {/* Active Progress Line */}
                    <div
                        className="w-full bg-emerald-500/30 transition-all duration-700 ease-in-out absolute top-0"
                        style={{ height: `${((currentStage - 1) / 4) * 100}%` }}
                    />

                    {/* "Data Packet" Animation */}
                    <motion.div
                        className="absolute top-0 left-0 w-full bg-emerald-400 h-10 blur-[2px]"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 1
                        }}
                        style={{ opacity: 0.5 }}
                    />
                </div>

                {DEV_STAGES.map((stage) => {
                    const isActive = activeStage === stage.id;
                    const isCompleted = currentStage > stage.id;
                    const isCurrent = currentStage === stage.id;
                    const Icon = STAGE_ICONS[stage.id];

                    return (
                        <div
                            key={stage.id}
                            onClick={() => onStageSelect(stage.id)}
                            className={`
                                relative z-10 flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group mb-4 last:mb-0
                                ${isActive ? 'bg-gray-900 shadow-xl shadow-gray-200 scale-105 ring-1 ring-black/5' : 'hover:bg-gray-50'}
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 relative
                                ${isActive
                                    ? 'bg-white/20 text-white shadow-inner'
                                    : isCompleted
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : isCurrent
                                            ? 'bg-white border-2 border-emerald-500 text-emerald-600'
                                            : 'bg-white border-2 border-gray-100 text-gray-300 group-hover:border-gray-300 group-hover:text-gray-400'
                                }
                            `}>
                                {/* Pulse Rings for Active State */}
                                {isActive && (
                                    <>
                                        <span className="absolute inset-0 rounded-full border border-white/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        <span className="absolute -inset-1 rounded-full border border-emerald-500/20 animate-pulse" />
                                    </>
                                )}

                                {isCompleted ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <Icon size={16} className={`${isActive ? 'animate-pulse' : ''}`} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                    {stage.label}
                                </div>
                                <div className={`text-[10px] truncate transition-colors ${isActive ? 'text-white/50' : 'text-gray-400'}`}>
                                    {stage.title}
                                </div>
                            </div>

                            {/* Active Indicator Arrow */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-dot"
                                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StageNavigation;
