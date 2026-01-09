import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Trash2, Edit2, Layers, Box, Terminal } from 'lucide-react';

const AdvancedStageNavigation = ({ stages = [], activeStageId, onChangeStage, onUpdateStages }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [editingStageId, setEditingStageId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const editInputRef = useRef(null);

    const handleAdd = () => {
        if (!newStageName.trim()) return;
        const newStage = {
            id: Date.now().toString(),
            name: newStageName,
            status: 'pending',
            dotColor: '#A855F7' // Default purple dot like screenshot
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

    const startEditing = (e, stage) => {
        e.stopPropagation();
        setEditingStageId(stage.id);
        setEditingName(stage.name);
    };

    const saveEdit = () => {
        if (editingName.trim()) {
            handleUpdateStage(editingStageId, { name: editingName });
        }
        setEditingStageId(null);
    };

    useEffect(() => {
        if (editingStageId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingStageId]);

    return (
        <div className="w-[380px] border-r border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-[#0D0D0D] flex flex-col h-full relative z-20">
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-10">
                    <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Pipeline Stages</h3>
                </div>

                <div className="space-y-4 relative">
                    <AnimatePresence mode="popLayout">
                        {stages.map((stage, index) => {
                            const isActive = activeStageId === stage.id;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => onChangeStage(stage.id)}
                                    key={stage.id}
                                    className={`
                                        group relative z-10 p-5 rounded-[1.5rem] cursor-pointer transition-all flex items-center gap-5
                                        ${isActive
                                            ? 'bg-[#12121A] dark:bg-[#1A1A24] shadow-2xl shadow-black/20'
                                            : 'hover:bg-gray-100 dark:hover:bg-white/5'}
                                    `}
                                >
                                    {/* Connection Line */}
                                    {index < stages.length - 1 && (
                                        <div className="absolute left-[34px] top-[4.5rem] w-px h-6 bg-gray-200 dark:bg-gray-800 -z-10" />
                                    )}

                                    {/* Icon Circle */}
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 border
                                        ${isActive
                                            ? 'bg-[#21212B] border-white/10 text-white'
                                            : 'bg-white dark:bg-[#151515] border-gray-100 dark:border-white/5 text-gray-400'}
                                    `}>
                                        {index === 0 ? <Layers size={20} /> : index === 1 ? <Terminal size={20} /> : <Box size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {editingStageId === stage.id ? (
                                            <input
                                                ref={editInputRef}
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onBlur={saveEdit}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                className="bg-transparent text-sm font-bold text-white border-b border-red-500 outline-none w-full"
                                            />
                                        ) : (
                                            <>
                                                <h4 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-400'}`}>
                                                    {stage.name}
                                                </h4>
                                                <span className={`text-[10px] font-medium mt-0.5 block ${isActive ? 'text-gray-400' : 'text-gray-400 opacity-60'}`}>
                                                    {stage.status === 'in-progress' ? 'In Progress' : stage.status === 'completed' ? 'Completed' : 'Pending'}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Dot / Status */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: stage.dotColor || '#A855F7' }} />

                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => startEditing(e, stage)} className="text-gray-400 hover:text-white transition-colors"><Edit2 size={12} /></button>
                                            <button onClick={(e) => handleDeleteStage(e, stage.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <div className="mt-8">
                    {isAdding ? (
                        <div className="space-y-3 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <input
                                autoFocus
                                type="text"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Stage Name..."
                                className="w-full bg-transparent text-sm font-medium outline-none p-1 border-b border-gray-200 dark:border-white/10"
                            />
                            <div className="flex gap-2 pt-2">
                                <button onClick={handleAdd} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-widest">Add</button>
                                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400"><X size={16} /></button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-gray-300 hover:text-gray-500 hover:border-gray-300 dark:hover:border-white/10 transition-all font-medium text-sm"
                        >
                            <Plus size={18} />
                            Add Milestone
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedStageNavigation;
