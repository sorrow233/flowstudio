import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConflictBanner = ({
    conflictPreview,
    onUseRemote,
    onKeepLocal,
    isMobile,
    safeTop,
    t
}) => (
    <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="absolute inset-x-0 top-0 z-40 border-b border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-slate-900"
        style={{ paddingTop: safeTop ? safeTop + 8 : undefined }}
    >
        <div className={`mx-auto flex w-full max-w-5xl px-5 py-3 ${isMobile ? 'flex-col gap-3' : 'items-center justify-between gap-6'}`}>
            <div className="flex min-w-0 items-start gap-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                <div className="min-w-0">
                    <p className="text-[13px] font-medium text-sky-800 dark:text-sky-200">
                        {t('inspiration.conflictDetected')}
                    </p>
                    {conflictPreview && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400">
                            {conflictPreview}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    onClick={onUseRemote}
                    className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                >
                    {t('inspiration.useRemote')}
                </button>
                <button
                    onClick={onKeepLocal}
                    className="rounded-full bg-sky-600 px-3.5 py-1.5 text-[12px] font-medium text-white transition hover:bg-sky-500 active:scale-[0.97] dark:bg-sky-500 dark:hover:bg-sky-400"
                >
                    {t('inspiration.keepLocal')}
                </button>
            </div>
        </div>
    </motion.div>
);

export default ConflictBanner;
