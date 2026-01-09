import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sprout, TreeDeciduous, TreePine, AlertTriangle, RefreshCw, Calendar, Activity, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

/**
 * ProjectManageModal - 项目管理模态框 (Premium Redesign)
 * 双击 Nursery 卡片时弹出，提供沉浸式的详情查看和管理体验
 */
const ProjectManageModal = ({ project, isOpen, onClose, onDelete }) => {
    const [deleteStep, setDeleteStep] = useState('initial'); // initial, confirming, deleting

    if (!isOpen || !project) return null;

    const handleDelete = () => {
        setDeleteStep('deleting');
        setTimeout(() => {
            onDelete(project.id);
            onClose();
            // Reset state after close
            setTimeout(() => setDeleteStep('initial'), 300);
        }, 800); // Fake delay for satisfaction
    };

    const getStageIcon = (stage, subStage = 1) => {
        if (stage === 'advanced' || subStage >= 6) {
            return <TreePine size={32} className="text-amber-500" strokeWidth={1.5} />;
        }
        if (subStage >= 3) {
            return <TreeDeciduous size={32} className="text-emerald-500" strokeWidth={1.5} />;
        }
        return <Sprout size={32} className="text-emerald-400" strokeWidth={1.5} />;
    };

    const stageLabel = project.stage === 'advanced' ? 'Advanced Stage' : 'Nursery Stage';
    const progress = ((project.subStage || 1) / 5) * 100;
    const formattedDate = project.createdAt ? format(new Date(project.createdAt), 'yyyy.MM.dd') : 'Recently';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[90vw] md:w-[480px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl z-[101] overflow-hidden border border-white/20 ring-1 ring-black/5"
                    >
                        {/* Header Section with Ambient Glow */}
                        <div className="relative h-40 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            <div className={`absolute inset-0 opacity-30 bg-gradient-to-b ${project.stage === 'advanced' ? 'from-amber-200/50' : 'from-emerald-200/50'
                                } to-transparent`} />

                            {/* Animated Background Particles (Simplified) */}
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                                color: project.stage === 'advanced' ? '#f59e0b' : '#10b981'
                            }} />

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-xl relative z-10 border border-white/50 dark:border-gray-700"
                            >
                                {getStageIcon(project.stage, project.subStage)}

                                {/* Holy Glow Ring */}
                                {project.hasHolyGlow && (
                                    <div className="absolute inset-0 rounded-3xl ring-2 ring-emerald-400/30 animate-pulse" />
                                )}
                            </motion.div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-md rounded-full transition-all z-20 group"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    {project.title}
                                </h2>
                                <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                                    {project.desc || 'No description provided.'}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-blue-50 dark:border-gray-800">
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Stage</div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Activity size={14} className={project.stage === 'advanced' ? 'text-amber-500' : 'text-emerald-500'} />
                                        {stageLabel}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100 dark:border-gray-800">
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Created</div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <Calendar size={14} className="text-blue-500" />
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                    <span>Growth Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${project.stage === 'advanced' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    />
                                </div>
                            </div>

                            {/* Actions Zone */}
                            <AnimatePresence mode="wait">
                                {deleteStep === 'initial' && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onClick={() => setDeleteStep('confirming')}
                                        className="w-full py-4 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/30 text-gray-400 hover:text-red-500 rounded-2xl transition-all flex items-center justify-center gap-2 group font-medium"
                                    >
                                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                        <span>回炉重造 (Recycle)</span>
                                    </motion.button>
                                )}

                                {deleteStep === 'confirming' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30"
                                    >
                                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                                            <AlertTriangle size={20} className="shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-sm">确定要重置吗？</h4>
                                                <p className="text-xs opacity-80">此项目将永久删除，无法恢复。</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setDeleteStep('initial')}
                                                className="flex-1 py-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                确认删除
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {deleteStep === 'deleting' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full py-4 flex items-center justify-center gap-3 text-red-500"
                                    >
                                        <RefreshCw size={20} className="animate-spin" />
                                        <span className="font-medium">正在回收...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectManageModal;
