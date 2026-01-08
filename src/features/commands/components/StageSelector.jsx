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
    const scrollContainerRef = React.useRef(null);
    const activeBtnRef = React.useRef(null);

    React.useEffect(() => {
        if (activeBtnRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const btn = activeBtnRef.current;

            // Simple scroll into view logic for horizontal list
            const containerLeft = container.getBoundingClientRect().left;
            const btnLeft = btn.getBoundingClientRect().left;
            const offset = btnLeft - containerLeft;

            // Center the button if possible, or at least ensure visibility
            const scrollLeft = container.scrollLeft + offset - (container.clientWidth / 2) + (btn.clientWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeStage]);

    return (
        <div
            ref={scrollContainerRef}
            className="w-full md:w-72 shrink-0 flex flex-row md:flex-col gap-2 py-4 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
            <div className="mb-0 md:mb-10 px-0 md:px-4 shrink-0 flex items-center md:block mr-4 md:mr-0 snap-center">
                <h2 className="text-xl md:text-2xl font-thin text-gray-900 flex items-center gap-3 tracking-tight whitespace-nowrap">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                        <Terminal size={20} />
                    </div>
                    <span className="hidden md:inline">Command Center</span>
                    <span className="md:hidden">Cmd Center</span>
                </h2>
                <p className="hidden md:block text-xs text-gray-400 mt-2 pl-1 font-light tracking-wide">
                    AI PROMPT ORCHESTRATION
                </p>
            </div>

            <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-stretch">
                {DEV_STAGES.map(stage => {
                    const Icon = STAGE_ICONS[stage.id];
                    // Count items in this stage
                    const count = commands.filter(c => c.stageIds?.includes(stage.id)).length;
                    const isActive = activeStage === stage.id;

                    return (
                        <button
                            key={stage.id}
                            ref={isActive ? activeBtnRef : null}
                            onClick={() => setActiveStage(stage.id)}
                            className={`
                                shrink-0 flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                ${isActive ? 'bg-white shadow-xl shadow-gray-200/50 scale-100 md:scale-105 z-10' : 'hover:bg-white/50 hover:pl-5 text-gray-500'}
                                min-w-[160px] md:min-w-0 md:w-full snap-center
                            `}
                        >
                            <div className="flex items-center gap-3 md:gap-4 relative z-10 show-full">
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
