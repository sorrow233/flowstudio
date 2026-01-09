import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Trash2, Layout, Sparkles, Activity } from 'lucide-react';

const AdvancedStageNavigation = ({ stages = [], activeStageId, onChangeStage, onUpdateStages }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newStageName, setNewStageName] = useState('');

    const handleAdd = () => {
        if (!newStageName.trim()) return;
        const newStage = {
            id: Date.now().toString(),
            name: newStageName,
            status: 'pending',
            color: '#FF4D4D' // Red theme
        };
        onUpdateStages([...stages, newStage]);
        setNewStageName('');
        setIsAdding(false);
    };

    const handleUpdateStage = (id, updates) => {
        onUpdateStages(stages.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleDeleteStage = (e, id) => {
        e.stopPropagation();
        if (confirm('Permanently remove this stage?')) {
            onUpdateStages(stages.filter(s => s.id !== id));
        }
    };

    const toggleStatus = (e, stage) => {
        e.stopPropagation();
        const cycle = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
        handleUpdateStage(stage.id, { status: cycle[stage.status] });
    };

    return (
        <div className="w-[340px] border-r border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/40 backdrop-blur-3xl flex flex-col h-full relative z-20">
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-8 h-px bg-red-500/30" />
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">Flow Pipeline</h3>
                </div>

                <div className="space-y-6 relative">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-gray-100 via-gray-100 to-transparent dark:from-white/5 dark:via-white/5 dark:to-transparent" />

                    <AnimatePresence mode="popLayout">
                        {stages.map((stage) => {
                            const isActive = activeStageId === stage.id;
                            const statusColor = stage.status === 'completed' ? 'emerald' : stage.status === 'in-progress' ? 'blue' : 'gray';

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => onChangeStage(stage.id)}
                                    key={stage.id}
                                    className={`
                                        group relative z-10 p-5 rounded-[2rem] cursor-pointer transition-all flex items-center gap-5 border
                                        ${isActive
                                            ? 'bg-white dark:bg-white/5 shadow-2xl shadow-red-500/10 border-white/50 dark:border-white/10 scale-[1.05]'
                                            : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5 hover:border-white/20'}
                                    `}
                                >
                                    {/* Status Indicator */}
                                    <button
                                        onClick={(e) => toggleStatus(e, stage)}
                                        className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-inner
                                            ${stage.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' :
                                                stage.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-500' :
                                                    'bg-gray-100 dark:bg-white/5 text-gray-300'}
                                        `}
                                    >
                                        {stage.status === 'completed' ? <Check size={20} strokeWidth={3} /> :
                                            stage.status === 'in-progress' ? <Activity size={20} className="animate-pulse" /> :
                                                <Layout size={20} strokeWidth={1} />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                            {stage.name}
                                        </h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block opacity-50 ${isActive ? 'text-red-500' : 'text-gray-400'}`}>
                                            {stage.status}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={(e) => handleDeleteStage(e, stage.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                    >
                                        <X size={14} />
                                    </button>

                                    {/* Active Glow */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-glow"
                                            className="absolute -inset-1 bg-red-500/5 rounded-[2.2rem] blur-xl -z-10"
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <div className="mt-12">
                    {isAdding ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <input
                                autoFocus
                                type="text"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Stage Name"
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-red-500/5 transition-all outline-none shadow-inner"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleAdd} className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">Confirm</button>
                                <button onClick={() => setIsAdding(false)} className="px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-gray-600"><X size={16} /></button>
                            </div>
                        </motion.div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Add Milestone</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Footer Attribution */}
            <div className="p-8 px-10 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                        <Sparkles size={14} className="text-white dark:text-gray-900" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-none">Flow Studio</p>
                        <p className="text-[9px] text-gray-400 font-medium">Infinite Workflows</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedStageNavigation;
