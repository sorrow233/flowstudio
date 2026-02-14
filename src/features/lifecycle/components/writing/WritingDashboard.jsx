import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    PanelLeftClose,
    PanelLeftOpen,
    PenSquare,
    Plus,
    FileText,
    Clock,
    Type,
    Sparkles
} from 'lucide-react';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import { stripMarkup, computeWordCount } from './editorUtils';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingDashboard = ({
    onCreate,
    documents,
    categories = WRITING_CATEGORIES,
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
            const timestamp = doc.lastModified || doc.timestamp || 0;
            if (timestamp > latestModified) latestModified = timestamp;
        });

        return { totalWords, latestModified };
    }, [documents]);

    const statCards = [
        {
            icon: FileText,
            value: documents.length,
            label: t('inspiration.totalDocs') || '文档',
            tint: 'bg-sky-100 text-sky-700',
        },
        {
            icon: Type,
            value: stats.totalWords.toLocaleString(),
            label: t('inspiration.words') || '字数',
            tint: 'bg-blue-100 text-blue-700',
        },
        {
            icon: Clock,
            value: stats.latestModified
                ? new Date(stats.latestModified).toLocaleDateString()
                : '—',
            label: t('inspiration.lastSaved') || '最近编辑',
            tint: 'bg-cyan-100 text-cyan-700',
        },
    ];

    return (
        <div className="relative h-full w-full overflow-y-auto custom-scrollbar">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute top-6 right-20 h-56 w-56 rounded-full bg-sky-200/30 blur-[90px]" />
                <div className="absolute -left-16 bottom-16 h-48 w-48 rounded-full bg-blue-200/20 blur-[70px]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 pt-10 md:px-10 md:pt-14">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-600 shadow-sm transition hover:border-sky-200"
                                title={t('inspiration.toggleSidebar')}
                            >
                                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                            </button>
                        )}

                        <p className="text-[11px] uppercase tracking-[0.24em] text-sky-500/70">
                            {t('inspiration.writing')}
                        </p>
                    </div>
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-10 rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_30px_70px_-45px_rgba(14,116,255,0.5)] md:p-8"
                >
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-700 text-white dark:bg-slate-600">
                                <Sparkles size={18} />
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
                                {t('inspiration.writing')}
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
                                {t('inspiration.writingSubtitle') || 'Capture your thoughts and develop complete drafts.'}
                            </p>
                            <p className="text-[12px] italic text-sky-500/80">
                                把想法写成云，把句子写成光。
                            </p>
                        </div>

                        <button
                            onClick={() => onCreate()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition hover:bg-slate-700 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            <Plus size={16} />
                            {t('inspiration.newDoc')}
                        </button>
                    </div>
                </motion.section>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.07 }}
                    className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                    {statCards.map(({ icon: Icon, value, label, tint }, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-sky-100 bg-white p-4"
                        >
                            <div className={`mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
                                <Icon size={16} />
                            </div>
                            <p className="text-2xl font-semibold text-slate-800">{value}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{label}</p>
                        </div>
                    ))}
                </motion.div>

                {recentDocs.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.13 }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[13px] font-medium text-slate-600">
                                {t('inspiration.timeGroup.today')}
                            </h2>
                            {isMobile && (
                                <button onClick={() => onCreate()} className="text-xs text-sky-600 hover:text-sky-700">
                                    {t('common.new')}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {recentDocs.map((doc) => {
                                const category = categories.find((cat) => cat.id === (doc.category || categories[0]?.id)) || categories[0] || WRITING_CATEGORIES[0];
                                return (
                                    <motion.button
                                        key={doc.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -3 }}
                                        onClick={() => onCreate(doc)}
                                        className="group rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:shadow-[0_18px_36px_-24px_rgba(37,99,235,0.65)]"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${category.dotColor}`} />
                                                <span className="line-clamp-1 text-[13px] font-medium text-slate-800 transition group-hover:text-sky-700">
                                                    {doc.title || t('inspiration.untitled')}
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-[10px] text-slate-400">
                                                {new Date(doc.lastModified || doc.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                                            {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                                        </p>
                                        <p className="mt-2 text-[10px] text-slate-400">
                                            {resolveWritingCategoryLabel(category, t, '')}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.section>
                )}

                {documents.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-white py-16 text-center"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <PenSquare size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-slate-500">
                            {t('inspiration.noDocs')}
                        </p>
                        <button
                            onClick={() => onCreate()}
                            className="mt-4 rounded-xl border border-slate-300 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
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
