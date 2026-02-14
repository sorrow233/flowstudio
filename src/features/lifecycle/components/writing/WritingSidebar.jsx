import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import { stripMarkup } from './editorUtils';

const formatDocTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const WritingSidebarItem = ({ doc, isActive, onSelect, onDelete, t }) => {
    const category = WRITING_CATEGORIES.find((item) => item.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];

    const x = useMotionValue(0);
    const deleteBackgroundColor = useTransform(
        x,
        [0, -90, -170],
        ['rgba(14, 165, 233, 0)', 'rgba(244, 63, 94, 0.35)', 'rgba(225, 29, 72, 0.95)']
    );
    const deleteIconOpacity = useTransform(x, [0, -50, -110], [0, 0, 1]);

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <motion.div
                style={{ backgroundColor: deleteBackgroundColor }}
                className="absolute inset-0 flex items-center justify-end px-5"
            >
                <motion.div style={{ opacity: deleteIconOpacity }}>
                    <Trash2 className="h-5 w-5 text-white" />
                </motion.div>
            </motion.div>

            <motion.div
                layout
                style={{ x }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.22, right: 0.06 }}
                onDragEnd={(event, info) => {
                    const shouldDelete = info.offset.x < -170 || (info.offset.x < -60 && info.velocity.x < -420);
                    if (shouldDelete) {
                        onDelete(doc);
                    }
                }}
                onClick={() => onSelect(doc.id)}
                whileHover={{ scale: 1.007 }}
                whileTap={{ scale: 0.995 }}
                transition={{ x: { type: 'spring', stiffness: 520, damping: 30 } }}
                className={[
                    'cursor-pointer border px-4 py-3 transition',
                    isActive
                        ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-[0_14px_34px_-24px_rgba(59,130,246,0.6)] dark:border-sky-800 dark:from-sky-950/30 dark:to-slate-900 dark:shadow-none'
                        : 'border-sky-100 bg-white hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                ].join(' ')}
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {doc.title || t('inspiration.untitled')}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80">
                        {formatDocTime(doc.lastModified || doc.timestamp)}
                    </span>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                </p>

                <div className="mt-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-600 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${category.dotColor}`} />
                        {category.label}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onDelete, onRestore, onClose, isMobile }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filteredDocs = useMemo(() => {
        let list = documents;

        if (selectedCategory) {
            list = list.filter((doc) => (doc.category || 'draft') === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter((doc) =>
                (doc.title || '').toLowerCase().includes(query)
                || stripMarkup(doc.content || '').toLowerCase().includes(query)
            );
        }

        return list;
    }, [documents, searchQuery, selectedCategory]);

    const groupedDocs = useMemo(() => {
        const groups = { today: [], yesterday: [], week: [], older: [] };
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        filteredDocs.forEach((doc) => {
            const ts = doc.lastModified || doc.timestamp || Date.now();
            if (ts >= todayStart) groups.today.push(doc);
            else if (ts >= yesterdayStart) groups.yesterday.push(doc);
            else if (ts >= weekStart) groups.week.push(doc);
            else groups.older.push(doc);
        });

        return groups;
    }, [filteredDocs]);

    const handleDelete = (doc) => {
        onDelete(doc.id);
        toast.info(t('inspiration.ideaDeleted'), {
            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
            action: {
                label: t('common.undo'),
                onClick: () => {
                    if (onRestore) {
                        onRestore(doc);
                        return;
                    }

                    onCreate(doc);
                }
            },
            duration: 4000
        });
    };

    const renderGroup = (titleKey, docsInGroup) => {
        if (docsInGroup.length === 0) return null;

        return (
            <section className="mb-6">
                <h3 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-sky-500/60">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h3>

                <div className="space-y-2.5">
                    {docsInGroup.map((doc) => (
                        <WritingSidebarItem
                            key={doc.id}
                            doc={doc}
                            isActive={activeDocId === doc.id}
                            onSelect={onSelectDoc}
                            onDelete={handleDelete}
                            t={t}
                        />
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="flex h-full flex-col bg-[linear-gradient(170deg,rgba(248,252,255,0.96),rgba(255,255,255,0.9))] dark:bg-[linear-gradient(170deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9))]">
            {isMobile && <div className="pt-safe" />}

            <header className="border-b border-sky-100/90 px-4 pb-4 pt-5 dark:border-slate-800/90">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-white text-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}

                        <div className="min-w-0">
                            <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                                {t('inspiration.writing')}
                            </h2>
                            <p className="line-clamp-1 text-[11px] text-slate-400 dark:text-slate-500">
                                {t('inspiration.writingSubtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onCreate(selectedCategory)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.9)] transition hover:brightness-105"
                        title={t('inspiration.newDoc')}
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400/80" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t('inspiration.search')}
                        className="w-full rounded-xl border border-sky-100 bg-white px-9 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:shadow-[0_0_0_4px_rgba(125,211,252,0.25)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-700 dark:focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)]"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={[
                            'shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition',
                            selectedCategory === null
                                ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                : 'border-sky-100 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-sky-400'
                        ].join(' ')}
                    >
                        {t('common.all')}
                    </button>

                    {WRITING_CATEGORIES.map((cat) => {
                        const active = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(active ? null : cat.id)}
                                className={[
                                    'shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition',
                                    active
                                        ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                        : 'border-sky-100 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-sky-400'
                                ].join(' ')}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <span className={`h-1.5 w-1.5 rounded-full ${cat.dotColor}`} />
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                {filteredDocs.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-sky-300">
                        <FileText size={34} strokeWidth={1.4} />
                        <p className="mt-3 text-xs text-slate-400">
                            {documents.length === 0 ? t('inspiration.noDocs') : t('common.noData')}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {renderGroup('today', groupedDocs.today)}
                        {renderGroup('yesterday', groupedDocs.yesterday)}
                        {renderGroup('week', groupedDocs.week)}
                        {renderGroup('older', groupedDocs.older)}
                    </AnimatePresence>
                )}
            </div>

            {isMobile && <div className="h-safe-bottom" />}
        </div>
    );
};

export default WritingSidebar;
