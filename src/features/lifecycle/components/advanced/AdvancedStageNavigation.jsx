import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '../../../../components/shared/ConfirmDialog';

const AdvancedStageNavigation = ({
    stages = [],
    activeStageId,
    onChangeStage,
    onUpdateStages,
    moduleCounts = {},
    onMoveModule, // (moduleId, targetStageId) -> void
    isMobile = false,
    isOpen = false,
    onClose
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [dragOverStageId, setDragOverStageId] = useState(null);

    const handleAdd = () => {
        if (!newStageName.trim()) return;
        const newStage = {
            id: Date.now().toString(),
            name: newStageName,
            status: 'pending',
            color: '#A855F7'
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
        openConfirm({
            title: 'Delete Stage',
            message: 'Are you sure you want to delete this stage?',
            confirmText: 'Delete',
            onConfirm: () => onUpdateStages(stages.filter(s => s.id !== id))
        });
    };

    const { openConfirm, ConfirmDialogComponent } = useConfirmDialog();

    const toggleStatus = (e, stage) => {
        e.stopPropagation();
        const nextStatus = {
            'pending': 'in-progress',
            'in-progress': 'completed',
            'completed': 'pending'
        };
        handleUpdateStage(stage.id, { status: nextStatus[stage.status] });
    };

    // --- Drag & Drop Logic ---
    const handleDragOver = (e, stageId) => {
        e.preventDefault();
        e.stopPropagation();
        if (stageId !== activeStageId) {
            setDragOverStageId(stageId);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverStageId(null);
    };

    const handleDrop = (e, stageId) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverStageId(null);
        const moduleId = e.dataTransfer.getData('moduleId');
        if (moduleId && onMoveModule && stageId !== activeStageId) {
            onMoveModule(moduleId, stageId);
        }
    };

    const SidebarContent = (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pipeline</h3>
                    {isMobile && (
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {stages.map((stage) => {
                        const isActive = activeStageId === stage.id;
                        const isDragOver = dragOverStageId === stage.id;
                        const count = moduleCounts[stage.id] || 0;

                        return (
                            <div
                                key={stage.id}
                                className="relative group"
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                <motion.div
                                    layoutId={isActive ? "active-stage-bg" : undefined}
                                    onClick={() => {
                                        onChangeStage(stage.id);
                                        if (isMobile && onClose) onClose();
                                    }}
                                    className={`
                                        relative z-10 p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border
                                        ${isActive
                                            ? 'bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none border-gray-100 dark:border-gray-800 scale-[1.02]'
                                            : isDragOver
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 scale-[1.02]'
                                                : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-gray-900/50'}
                                    `}
                                >
                                    {/* Connection Line (Visual only) */}
                                    <div className="absolute left-7 top-[2.5rem] w-px h-8 bg-gray-200 dark:bg-gray-800 -z-10 last:hidden" />

                                    {/* Status Icon/Dot */}
                                    <div
                                        onClick={(e) => toggleStatus(e, stage)}
                                        className={`
                                            w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0
                                            ${stage.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-500' :
                                                stage.status === 'in-progress' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-500' :
                                                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-300'}
                                        `}
                                    >
                                        {stage.status === 'completed' ? <Check size={18} strokeWidth={3} /> :
                                            stage.status === 'in-progress' ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> :
                                                null}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                                {stage.name}
                                            </h4>
                                            {count > 0 && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' : 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-400'}`}>
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 capitalize mt-0.5 truncate">
                                            {isDragOver ? <span className="text-blue-500 font-bold">Drop to move</span> : (stage.status === 'in-progress' ? 'In Progress' : stage.status)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteStage(e, stage.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all shrink-0"
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
            <ConfirmDialogComponent />
        </div>
    );

    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute left-0 top-0 bottom-0 w-80 z-50 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 md:hidden"
                        >
                            {SidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return (
        <div className="hidden md:block w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 h-full overflow-hidden">
            {SidebarContent}
        </div>
    );
};

export default AdvancedStageNavigation;
