import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Trash2, LayoutGrid } from 'lucide-react';
import { useConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { useTranslation } from '../../../i18n';

const AdvancedStageNavigation = ({
    stages = [],
    activeStageId,
    onChangeStage,
    onUpdateStages,
    moduleCounts = {},
    onMoveModule, // (moduleId, targetStageId) -> void
    isMobile = false,
    isOpen = false,
    onClose,
    className
}) => {
    const { t } = useTranslation();
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

    const { openConfirm, ConfirmDialogComponent } = useConfirmDialog();

    const handleUpdateStage = (id, updates) => {
        const updated = stages.map(s => s.id === id ? { ...s, ...updates } : s);
        onUpdateStages(updated);
    };

    const handleDeleteStage = (e, id) => {
        e.stopPropagation();
        openConfirm({
            title: t('advanced.stage.deleteTitle'),
            message: t('advanced.stage.deleteConfirm'),
            confirmText: t('advanced.stage.delete'),
            onConfirm: () => onUpdateStages(stages.filter(s => s.id !== id))
        });
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
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-xl">
            {/* Header: Minimalist */}
            <div className="p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-gray-400">
                    <LayoutGrid size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('advanced.stage.pipeline')}</span>
                </div>
                {isMobile && (
                    <button onClick={onClose} className="p-1 -mr-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1">
                {stages.map((stage) => {
                    const isActive = activeStageId === stage.id;
                    const isDragOver = dragOverStageId === stage.id;
                    const count = moduleCounts[stage.id] || 0;

                    return (
                        <div
                            key={stage.id}
                            className="relative"
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
                                    relative z-10 p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border
                                    ${isActive
                                        ? 'bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800'
                                        : isDragOver
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' // Glow effect base
                                            : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50'}
                                `}
                            >
                                {/* Drag Pulse Indicator */}
                                {isDragOver && (
                                    <motion.div
                                        layoutId="drag-pulse"
                                        className="absolute inset-0 rounded-xl ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-black z-20 pointer-events-none"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}

                                {/* Status Dot */}
                                <div className={`
                                    w-2 h-2 rounded-full shrink-0
                                    ${isActive ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}
                                    ${isDragOver ? 'bg-blue-500 scale-150' : ''}
                                    transition-all duration-300
                                `} />

                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <h4 className={`text-xs font-medium truncate transition-colors ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {stage.name}
                                    </h4>
                                    {count > 0 && (
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300' : 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-400'}`}>
                                            {count}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => handleDeleteStage(e, stage.id)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-gray-300 p-1 transition-all"
                                >
                                    <X size={12} />
                                </button>
                            </motion.div>
                        </div>
                    );
                })}

                <div className="pt-2 px-1">
                    {isAdding ? (
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-1">
                            <input
                                autoFocus
                                type="text"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder={t('advanced.stage.placeholder')}
                                className="flex-1 bg-transparent text-xs outline-none min-w-0 text-gray-900 dark:text-white placeholder-gray-400 ml-1"
                            />
                            <button onClick={handleAdd} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded bg-gray-50 dark:bg-gray-800"><Check size={12} className="text-green-500" /></button>
                            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X size={12} className="text-gray-400" /></button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
                        >
                            <Plus size={14} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{t('advanced.stage.add')}</span>
                        </button>
                    )}
                </div>
            </div>
            <ConfirmDialogComponent />
        </div>
    );

    // ... Mobile Wrapper remains similar but simplified ...
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
                            className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                            className="absolute left-0 top-0 bottom-0 w-64 z-50 md:hidden bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 shadow-2xl"
                        >
                            {SidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return (
        <div className={`w-64 border-r border-gray-100 dark:border-gray-800 h-full overflow-hidden shrink-0 ${className}`}>
            {SidebarContent}
        </div>
    );
};

export default AdvancedStageNavigation;
