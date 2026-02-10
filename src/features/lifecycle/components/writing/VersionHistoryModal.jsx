import React from 'react';
import { motion } from 'framer-motion';
import { History, X, RotateCcw } from 'lucide-react';
import { formatTimestamp } from './editorUtils';

const VersionHistoryModal = ({ versions, onRestore, onClose, t }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="w-full max-w-lg rounded-3xl border border-gray-200/60 bg-white/98 p-0 shadow-[0_32px_70px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-gray-800/60 dark:bg-slate-900/98"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800/70">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-900/40 dark:text-rose-400">
                        <History size={16} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                        {t('inspiration.versionHistory')}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-[55vh] overflow-y-auto px-6 py-3 custom-scrollbar">
                {versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600">
                            <History size={22} />
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {t('inspiration.noVersions')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className="group flex items-center justify-between gap-4 py-3.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-gray-800 dark:text-gray-100">
                                        {version.title || t('inspiration.untitled')}
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                                        <span>{formatTimestamp(version.timestamp)}</span>
                                        <span className="text-gray-300 dark:text-gray-700">·</span>
                                        <span>{version.wordCount || 0} {t('inspiration.words')}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRestore(version)}
                                    className="flex items-center gap-1.5 rounded-xl border border-gray-200/70 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600 opacity-0 transition group-hover:opacity-100 hover:border-rose-200 hover:text-rose-600 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:border-rose-800 dark:hover:text-rose-400"
                                >
                                    <RotateCcw size={12} />
                                    {t('inspiration.restore')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    </motion.div>
);

export default VersionHistoryModal;
