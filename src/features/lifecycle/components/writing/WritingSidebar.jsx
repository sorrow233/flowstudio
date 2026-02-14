import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import { stripMarkup } from './editorUtils';

const WritingSidebarItem = ({ doc, isActive, onSelect, onDelete, t }) => {
    const category = WRITING_CATEGORIES.find((item) => item.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];

    const x = useMotionValue(0);
    const deleteBackgroundColor = useTransform(x, [0, -80, -170], ['rgba(244, 63, 94, 0)', 'rgba(244, 63, 94, 0.35)', 'rgba(244, 63, 94, 1)']);
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ x: { type: 'spring', stiffness: 520, damping: 30 } }}
                className={[
                    'cursor-pointer border px-4 py-3 transition',
                    isActive
                        ? 'border-rose-200 bg-rose-50/75 shadow-sm dark:border-rose-800/60 dark:bg-rose-900/20'
                        : 'border-gray-200/75 bg-white/80 hover:border-rose-200/80 hover:bg-white dark:border-gray-800 dark:bg-slate-900/70 dark:hover:border-rose-800/60'
                ].join(' ')}
            >
                <div className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full ${category.dotColor}`} />

                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                            <h4 className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                                {new Date(doc.lastModified || doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                        </p>
                    </div>
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
            const q = searchQuery.toLowerCase();
            list = list.filter((doc) =>
                (doc.title || '').toLowerCase().includes(q)
                || stripMarkup(doc.content || '').toLowerCase().includes(q)
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
            <section className="mb-5">
                <h3 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h3>

                <div className="space-y-2">
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
        <div className="flex h-full flex-col bg-white/86 backdrop-blur-xl dark:bg-slate-950/82">
            {isMobile && <div className="pt-safe" />}

            <header className="border-b border-gray-200/70 px-4 pb-4 pt-5 dark:border-gray-800/80">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}

                        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                            {t('inspiration.writing')}
                        </h2>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {documents.length}
                        </span>
                    </div>

                    <button
                        onClick={() => onCreate(selectedCategory)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-[0_12px_22px_-15px_rgba(244,63,94,0.9)] transition hover:bg-rose-600"
                        title={t('inspiration.newDoc')}
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t('inspiration.search')}
                        className="w-full rounded-xl border border-gray-200 bg-white px-9 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-rose-300 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-rose-700"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {WRITING_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                                className={[
                                    'flex-shrink-0 rounded-full border px-3 py-1.5 text-xs transition',
                                    isSelected
                                        ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 dark:hover:border-gray-700'
                                ].join(' ')}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                {filteredDocs.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <FileText size={34} strokeWidth={1.4} />
                        <p className="mt-3 text-xs">
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
