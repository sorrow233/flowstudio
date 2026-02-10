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
        className="absolute inset-x-0 top-0 z-40 border-b border-rose-200/70 bg-rose-50/95 backdrop-blur-md dark:border-rose-800/60 dark:bg-rose-950/80"
        style={{ paddingTop: safeTop ? safeTop + 8 : undefined }}
    >
        <div className={`mx-auto flex w-full max-w-5xl px-5 py-3 ${isMobile ? 'flex-col gap-3' : 'items-center justify-between gap-6'}`}>
            <div className="flex min-w-0 items-start gap-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
                <div className="min-w-0">
                    <p className="text-[13px] font-medium text-rose-700 dark:text-rose-200">
                        {t('inspiration.conflictDetected')}
                    </p>
                    {conflictPreview && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-rose-600/80 dark:text-rose-300/60">
                            {conflictPreview}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    onClick={onUseRemote}
                    className="rounded-full border border-rose-200/80 bg-white/90 px-3.5 py-1.5 text-[12px] font-medium text-rose-600 transition hover:bg-white dark:border-rose-800/60 dark:bg-slate-900/60 dark:text-rose-300 dark:hover:bg-slate-900"
                >
                    {t('inspiration.useRemote')}
                </button>
                <button
                    onClick={onKeepLocal}
                    className="rounded-full bg-rose-500 px-3.5 py-1.5 text-[12px] font-medium text-white transition hover:bg-rose-600 active:scale-[0.97]"
                >
                    {t('inspiration.keepLocal')}
                </button>
            </div>
        </div>
    </motion.div>
);

export default ConflictBanner;
