import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Check, X, MoreVertical, Trash2 } from 'lucide-react';

const AdvancedStageNavigation = ({ stages = [], activeStageId, onChangeStage, onUpdateStages }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newStageName, setNewStageName] = useState('');

    const handleAdd = () => {
        if (!newStageName.trim()) return;
        const newStage = {
            id: Date.now().toString(),
            name: newStageName,
            status: 'pending', // pending | in-progress | completed
            color: '#A855F7' // Default purple
        };
        onUpdateStages([...stages, newStage]);
        setNewStageName('');
        setIsAdding(false);
    };

    const handleUpdateStage = (id, updates) => {
        const updated = stages.map(s => s.id === id ? { ...s, ...updates } : s);
        onUpdateStages(updated);
    };

    const handleDeleteStage = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this stage?')) {
            onUpdateStages(stages.filter(s => s.id !== id));
        }
    };

    const toggleStatus = (e, stage) => {
        e.stopPropagation();
        const nextStatus = {
            'pending': 'in-progress',
            'in-progress': 'completed',
            'completed': 'pending'
        };
        handleUpdateStage(stage.id, { status: nextStatus[stage.status] });
    };

    return (
        <div className="w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex flex-col h-full overflow-hidden">
            <div className="p-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Pipeline Stages</h3>

                <div className="space-y-3">
                    {stages.map((stage) => {
                        const isActive = activeStageId === stage.id;
                        return (
                            <div key={stage.id} className="relative group">
                                <motion.div
                                    onClick={() => onChangeStage(stage.id)}
                                    className={`
                                        relative z-10 p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4
                                        ${isActive
                                            ? 'bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 scale-[1.02]'
                                            : 'hover:bg-white/50 dark:hover:bg-gray-900/50'}
                                    `}
                                >
                                    {/* Connection Line (Visual only) */}
                                    <div className="absolute left-7 top-[2.5rem] w-px h-8 bg-gray-200 dark:bg-gray-800 -z-10 last:hidden" />

                                    {/* Status Icon/Dot */}
                                    <div
                                        onClick={(e) => toggleStatus(e, stage)}
                                        className={`
                                            w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all bg-gray-50 dark:bg-gray-800
                                            ${stage.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-500' :
                                                stage.status === 'in-progress' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-500' :
                                                    'border-gray-200 dark:border-gray-700 text-gray-300'}
                                        `}
                                    >
                                        {stage.status === 'completed' ? <Check size={18} strokeWidth={3} /> :
                                            stage.status === 'in-progress' ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> :
                                                null}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                            {stage.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                                            {stage.status === 'in-progress' ? 'In Progress' : stage.status}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteStage(e, stage.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    {isAdding ? (
                        <div className="space-y-3">
                            <input
                                autoFocus
                                type="text"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Stage name..."
                                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleAdd} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold uppercase tracking-widest">Add</button>
                                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400"><X size={18} /></button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-300 hover:text-gray-500 hover:border-gray-200 transition-all"
                        >
                            <Plus size={18} />
                            <span className="text-sm font-medium">New Stage</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedStageNavigation;
