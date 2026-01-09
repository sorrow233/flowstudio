import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sprout, TreeDeciduous, TreePine, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ProjectManageModal - 项目管理模态框
 * 双击 Nursery 卡片时弹出，用于查看详情和"回炉重造"（删除）
 */
const ProjectManageModal = ({ project, isOpen, onClose, onDelete }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isOpen || !project) return null;

    const handleDelete = () => {
        onDelete(project.id);
        setIsConfirming(false);
        onClose();
    };

    const getStageIcon = (stage, subStage = 1) => {
        if (stage === 'advanced' || subStage >= 6) {
            return <TreePine size={24} className="text-amber-500" />;
        }
        if (subStage >= 3) {
            return <TreeDeciduous size={24} className="text-emerald-500" />;
        }
        return <Sprout size={24} className="text-emerald-400" />;
    };

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[90vw] md:w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[101] overflow-hidden border border-gray-100 dark:border-gray-800"
                    >
                        {/* Header Image / Icon Area */}
                        <div className="h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 dark:to-black/10" />
                            {/* Background pattern or subtle effect could go here */}

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-lg relative z-10"
                            >
                                {getStageIcon(project.stage, project.subStage)}
                            </motion.div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm rounded-full transition-colors z-20"
                            >
                                <X size={16} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {project.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {project.desc || '这个项目正在茁壮成长...'}
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${project.stage === 'advanced'
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {project.stage === 'advanced' ? 'Advanced Stage' : 'Nursery Stage'}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                    ID: {project.id.slice(0, 8)}
                                </div>
                            </div>

                            {/* Actions */}
                            <AnimatePresence mode="wait">
                                {isConfirming ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3">
                                            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">确定要回炉重造吗？</p>
                                                <p className="text-xs text-red-500/80 dark:text-red-400/80">此操作将永久删除该项目及其所有进度，无法恢复。</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setIsConfirming(false)}
                                                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                确认删除
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setIsConfirming(true)}
                                        className="w-full py-3 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                        回炉重造
                                    </motion.button>
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
