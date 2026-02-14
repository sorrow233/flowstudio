import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, PenSquare, Plus, FileText, Clock, Type } from 'lucide-react';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import { stripMarkup, computeWordCount } from './editorUtils';

const WritingDashboard = ({
    onCreate,
    documents,
    onToggleSidebar,
    isSidebarOpen,
    isMobile,
    t,
}) => {
    const recentDocs = useMemo(() => documents.slice(0, 6), [documents]);

    const stats = useMemo(() => {
        let totalWords = 0;
        let latestModified = 0;

        documents.forEach((doc) => {
            const text = stripMarkup(doc.content || '');
            totalWords += computeWordCount(text);
            const ts = doc.lastModified || doc.timestamp || 0;
            if (ts > latestModified) latestModified = ts;
        });

        return { totalWords, latestModified };
    }, [documents]);

    const statCards = [
        {
            icon: FileText,
            value: documents.length,
            label: t('inspiration.totalDocs') || '文档',
            color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
        },
        {
            icon: Type,
            value: stats.totalWords.toLocaleString(),
            label: t('inspiration.words') || '字数',
            color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400',
        },
        {
            icon: Clock,
            value: stats.latestModified
                ? new Date(stats.latestModified).toLocaleDateString()
                : '—',
            label: t('inspiration.lastSaved') || '最近编辑',
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
        },
    ];

    return (
        <div className="relative h-full w-full overflow-y-auto custom-scrollbar">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-50/25 to-transparent dark:from-rose-900/8" />
                <div className="absolute right-24 top-10 h-52 w-52 rounded-full bg-rose-200/25 blur-[80px] dark:bg-rose-600/8" />
                <div className="absolute -left-12 bottom-20 h-40 w-40 rounded-full bg-pink-200/20 blur-[60px] dark:bg-pink-600/6" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20 pt-10 md:px-10 md:pt-14">
                {/* Header bar */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 text-gray-500 shadow-sm transition hover:border-rose-200 hover:text-rose-500 dark:border-gray-800/50 dark:bg-slate-900/60 dark:text-gray-300"
                                title={t('inspiration.toggleSidebar')}
                            >
                                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                            </button>
                        )}
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                            {t('inspiration.writing')}
                        </p>
                    </div>
                </div>

                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400">
                                <PenSquare size={18} />
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
                                {t('inspiration.writing')}
                            </h1>
                            <p className="max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {t('inspiration.writingSubtitle') || 'Capture your thoughts and develop complete drafts.'}
                            </p>
                        </div>

                        <button
                            onClick={() => onCreate()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_-12px_rgba(244,63,94,0.6)] transition hover:bg-rose-600 active:scale-[0.98]"
                        >
                            <Plus size={16} />
                            {t('inspiration.newDoc')}
                        </button>
                    </div>
                </motion.section>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 }}
                    className="mb-10 grid grid-cols-3 gap-3"
                >
                    {statCards.map(({ icon: Icon, value, label, color }, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-gray-200/40 bg-white/70 p-4 backdrop-blur-sm dark:border-gray-800/40 dark:bg-slate-900/60"
                        >
                            <div className={`mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
                                <Icon size={15} />
                            </div>
                            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Recent docs */}
                {recentDocs.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.14 }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                                {t('inspiration.timeGroup.today')}
                            </h2>
                            {isMobile && (
                                <button onClick={() => onCreate()} className="text-xs text-rose-500 hover:text-rose-600">
                                    {t('common.new')}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {recentDocs.map((doc) => {
                                const category = WRITING_CATEGORIES.find((c) => c.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];
                                return (
                                    <motion.button
                                        key={doc.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2 }}
                                        onClick={() => onCreate(doc)}
                                        className="group rounded-2xl border border-gray-200/50 bg-white/75 p-4 text-left shadow-sm transition hover:border-rose-200/60 hover:shadow-md dark:border-gray-800/50 dark:bg-slate-900/60 dark:hover:border-rose-800/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${category.dotColor}`} />
                                                <span className="line-clamp-1 text-[13px] font-medium text-gray-800 transition group-hover:text-rose-600 dark:text-gray-100 dark:group-hover:text-rose-300">
                                                    {doc.title || t('inspiration.untitled')}
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(doc.lastModified || doc.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                            {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.section>
                )}

                {/* Empty state */}
                {documents.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center justify-center pt-16 text-center"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-400 dark:bg-rose-900/30 dark:text-rose-500">
                            <PenSquare size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('inspiration.noDocs')}
                        </p>
                        <button
                            onClick={() => onCreate()}
                            className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                        >
                            {t('inspiration.newDoc')}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WritingDashboard;
