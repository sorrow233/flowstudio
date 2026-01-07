import React from 'react';
import { motion } from 'framer-motion';
import { Layers, MonitorPlay, Bug, Sparkles, Flag, Terminal } from 'lucide-react';
import { DEV_STAGES } from '../../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Bug,
    4: Sparkles,
    5: Flag
};

const StageSelector = ({ activeStage, setActiveStage, commands }) => {
    return (
        <div className="w-72 shrink-0 flex flex-col gap-2 py-4">
            <div className="mb-10 px-4">
                <h2 className="text-2xl font-thin text-gray-900 flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                        <Terminal size={20} />
                    </div>
                    Command Center
                </h2>
                <p className="text-xs text-gray-400 mt-2 pl-1 font-light tracking-wide">
                    AI PROMPT ORCHESTRATION
                </p>
            </div>

            <div className="space-y-1">
                {DEV_STAGES.map(stage => {
                    const Icon = STAGE_ICONS[stage.id];
                    // Count items in this stage
                    const count = commands.filter(c => c.stageIds?.includes(stage.id)).length;
                    const isActive = activeStage === stage.id;

                    return (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                ${isActive ? 'bg-white shadow-xl shadow-gray-200/50 scale-105 z-10' : 'hover:bg-white/50 hover:pl-5 text-gray-500'}
                            `}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-white'}
                                `}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {stage.label}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="subtitle"
                                            className="text-[10px] text-gray-400 font-mono hidden xl:block"
                                        >
                                            STAGE 0{stage.id}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            {count > 0 && (
                                <span className={`text-[10px] font-mono px-2 py-1 rounded-full transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-400'}`}>
                                    {count}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 border-2 border-gray-100 rounded-2xl pointer-events-none"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StageSelector;
