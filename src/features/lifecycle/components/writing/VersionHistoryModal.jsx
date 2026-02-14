import React from 'react';
import { motion } from 'framer-motion';
import { History, X, RotateCcw } from 'lucide-react';
import { formatTimestamp } from './editorUtils';

const VersionHistoryModal = ({ versions, onRestore, onClose, t }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/22 px-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white/98 p-0 shadow-[0_32px_70px_-20px_rgba(37,99,235,0.35)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="flex items-center justify-between border-b border-sky-100 px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <History size={16} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-slate-800">
                        {t('inspiration.versionHistory')}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-slate-600"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-6 py-3 custom-scrollbar">
                {versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-300">
                            <History size={22} />
                        </div>
                        <p className="text-sm text-slate-400">
                            {t('inspiration.noVersions')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-sky-100/80">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className="group flex items-center justify-between gap-4 py-3.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-slate-800">
                                        {version.title || t('inspiration.untitled')}
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                        <span>{formatTimestamp(version.timestamp)}</span>
                                        <span className="text-sky-300">·</span>
                                        <span>{version.wordCount || 0} {t('inspiration.words')}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRestore(version)}
                                    className="flex items-center gap-1.5 rounded-xl border border-sky-100 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 opacity-0 transition group-hover:opacity-100 hover:border-sky-200 hover:text-sky-700"
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
