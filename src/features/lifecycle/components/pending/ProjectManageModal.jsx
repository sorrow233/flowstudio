import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sprout, TreeDeciduous, TreePine } from 'lucide-react';
import Spotlight from '../../../../components/shared/Spotlight';

/**
 * ProjectManageModal - 项目管理模态框 (Premium Redesign)
 * 双击 Nursery 卡片时弹出，用于查看详情和"修剪"（删除）
 */
const ProjectManageModal = ({ project, isOpen, onClose, onDelete }) => {
    if (!isOpen || !project) return null;

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
                        className="fixed inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[90vw] md:w-[420px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl z-[101] overflow-hidden ring-1 ring-white/10"
                    >
                        {/* 1. Header with Background Image */}
                        <div className="h-40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gray-900">
                                {project.bgImage ? (
                                    <img
                                        src={project.bgImage}
                                        alt="Background"
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-gray-900" />
                                )}
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                            {/* Floating Icon */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900 z-10"
                            >
                                {getStageIcon(project.stage, project.subStage)}
                            </motion.div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/10 overflow-hidden group/close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* 2. Content Area */}
                        <Spotlight className="pt-12 pb-8 px-8 text-center" spotColor="rgba(16, 185, 129, 0.1)">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400">
                                {project.title}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light font-mono min-h-[3em]">
                                {project.desc || 'Waiting for the first sprout of inspiration...'}
                            </p>

                            {/* Metadata Pills */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 mb-8">
                                <div className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    ID: {project.id.slice(0, 6)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${project.stage === 'advanced'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                    }`}>
                                    {project.stage === 'advanced' ? 'Advanced Stage' : 'Nursery Stage'}
                                </div>
                            </div>

                            {/* 3. Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => onDelete(project.id)}
                                    className="w-full group relative py-3.5 px-4 rounded-xl overflow-hidden bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
                                >
                                    <div className="relative flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-medium z-10">
                                        <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-300" />
                                        <span>Prune this Seed</span>
                                    </div>
                                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left" />
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    Cancel and keep growing
                                </button>
                            </div>
                        </Spotlight>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectManageModal;
