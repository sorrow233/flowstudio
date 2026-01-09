import React from 'react';
import { motion } from 'framer-motion';
import { Layers, MonitorPlay, Bug, Sparkles, Flag, Terminal, Gem } from 'lucide-react';
import { DEV_STAGES } from '../../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Bug,
    4: Sparkles,
    5: Flag,
    6: Gem
};

const STAGE_THEMES = {
    1: 'bg-blue-500 text-white shadow-blue-200',
    2: 'bg-emerald-500 text-white shadow-emerald-200',
    3: 'bg-violet-500 text-white shadow-violet-200',
    4: 'bg-amber-500 text-white shadow-amber-200',
    5: 'bg-rose-500 text-white shadow-rose-200',
    6: 'bg-yellow-400 text-white shadow-yellow-100',
};

const StageSelector = ({ activeStage, setActiveStage, commands, selectedCategory }) => {
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
                <h2 className="text-xl md:text-2xl font-thin text-gray-900 dark:text-white flex items-center gap-3 tracking-tight whitespace-nowrap">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 dark:shadow-none">
                        <Terminal size={20} />
                    </div>
                    <span className="hidden md:inline">Command Center</span>
                    <span className="md:hidden">Cmd Center</span>
                </h2>
                <p className="hidden md:block text-xs text-gray-400 dark:text-gray-500 mt-2 pl-1 font-light tracking-wide">
                    AI PROMPT ORCHESTRATION
                </p>
            </div>

            <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-stretch">
                {DEV_STAGES.map(stage => {
                    const Icon = STAGE_ICONS[stage.id];
                    // Count items in this stage
                    // Count items in this stage AND category
                    const count = commands.filter(c =>
                        c.stageIds?.includes(stage.id) &&
                        (c.category || 'general') === selectedCategory
                    ).length;
                    const isActive = activeStage === stage.id;

                    return (
                        <button
                            key={stage.id}
                            ref={isActive ? activeBtnRef : null}
                            onClick={() => setActiveStage(stage.id)}
                            className={`
                                shrink-0 flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                ${isActive ? 'bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none scale-100 md:scale-105 z-10' : 'hover:bg-white/50 dark:hover:bg-gray-800/50 hover:pl-5 text-gray-500 dark:text-gray-400'}
                                min-w-[160px] md:min-w-0 md:w-full snap-center
                            `}
                        >
                            <div className="flex items-center gap-3 md:gap-4 relative z-10 show-full">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? STAGE_THEMES[stage.id] : 'bg-gray-100 text-gray-400 group-hover:bg-white'}
                                `}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {stage.label}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="subtitle"
                                            className={`text-[10px] font-mono hidden xl:block ${isActive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400'}`}
                                        >
                                            STAGE 0{stage.id}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            {count > 0 && (
                                <span className="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {count}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pointer-events-none"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div >
    );
};

export default StageSelector;
