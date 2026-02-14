import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, ArrowLeft, LayoutGrid } from 'lucide-react';
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

const WritingSidebarItem = ({ doc, isActive, onSelect, onUpdate, onDelete, t }) => {
    const category = WRITING_CATEGORIES.find((item) => item.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(doc.title || '');
    const inputRef = useRef(null);

    const x = useMotionValue(0);
    const deleteBackgroundColor = useTransform(
        x,
        [0, -90, -170],
        ['rgba(14, 165, 233, 0)', 'rgba(244, 63, 94, 0.35)', 'rgba(225, 29, 72, 0.95)']
    );
    const deleteIconOpacity = useTransform(x, [0, -50, -110], [0, 0, 1]);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    // Update editTitle when doc.title changes externally, but only if not renaming
    useEffect(() => {
        if (!isRenaming) {
            setEditTitle(doc.title || '');
        }
    }, [doc.title, isRenaming]);

    const handleRename = () => {
        if (editTitle.trim() !== (doc.title || '')) {
            onUpdate?.(doc.id, { title: editTitle.trim() || t('inspiration.untitled') });
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setEditTitle(doc.title || '');
            setIsRenaming(false);
        }
    };

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
                onClick={() => {
                    if (!isRenaming) onSelect(doc.id);
                }}
                whileHover={{ scale: 1.007 }}
                whileTap={{ scale: 0.995 }}
                transition={{ x: { type: 'spring', stiffness: 520, damping: 30 } }}
                className={[
                    'cursor-pointer border px-4 py-3 transition rounded-2xl',
                    isActive
                        ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-[0_14px_34px_-24px_rgba(59,130,246,0.6)] dark:border-sky-800 dark:from-sky-950/30 dark:to-slate-900 dark:shadow-none'
                        : 'border-sky-100/80 bg-white/86 hover:border-sky-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                ].join(' ')}
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {isRenaming ? (
                            <input
                                ref={inputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 outline-none border-b border-sky-300 dark:border-sky-600 pb-0.5 placeholder:text-slate-400"
                                placeholder={t('inspiration.untitled')}
                            />
                        ) : (
                            <span
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setIsRenaming(true);
                                }}
                                className="line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-200 select-none"
                                title={t('common.doubleClickToRename', 'Double click to rename')}
                            >
                                {doc.title || t('inspiration.untitled')}
                            </span>
                        )}
                    </div>
                    <span className="shrink-0 text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80 ml-2">
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

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onUpdate, onDelete, onRestore, onClose, isMobile }) => {
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
                            onUpdate={onUpdate}
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
                        className="w-full rounded-xl border border-sky-100 bg-white/95 px-9 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:shadow-[0_0_0_4px_rgba(125,211,252,0.25)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-700 dark:focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)]"
                    />
                </div>

                {/* Category Selector - Redesigned to match InspirationModule exactly */}
                <div className="flex justify-center -mb-2 mt-4 px-1 relative z-20">
                    <div className="flex items-center p-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-full border border-sky-100/50 dark:border-slate-800/50 shadow-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-md hover:border-sky-200/30 dark:hover:border-sky-800/30 group/selector">

                        {/* Label Section - Animated */}
                        <div className="flex items-center px-3 border-r border-sky-200/50 dark:border-slate-700/50 mr-1 min-w-[60px] justify-center relative overflow-hidden h-7">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={selectedCategory || 'all'}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className={`text-xs font-medium ${selectedCategory
                                        ? (WRITING_CATEGORIES.find(c => c.id === selectedCategory)?.textColor || 'text-slate-700 dark:text-slate-300')
                                        : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    {selectedCategory
                                        ? WRITING_CATEGORIES.find(c => c.id === selectedCategory)?.label
                                        : t('common.all')}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        {/* Dots Section */}
                        <div className="flex items-center gap-1">
                            {/* All Button */}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group/dot flex-shrink-0"
                                title={t('common.all')}
                            >
                                {selectedCategory === null && (
                                    <motion.div
                                        layoutId="writingActiveCategory"
                                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-sky-100 dark:border-slate-600"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <LayoutGrid
                                    size={14}
                                    className={`relative z-10 transition-all duration-300 ${selectedCategory === null
                                        ? 'text-sky-500 dark:text-sky-400 scale-105'
                                        : 'text-slate-400 opacity-40 group-hover/dot:opacity-100 group-hover/dot:scale-110'
                                        }`}
                                />
                            </button>

                            {/* Categories */}
                            {WRITING_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group/dot flex-shrink-0"
                                    title={cat.label}
                                >
                                    {selectedCategory === cat.id && (
                                        <motion.div
                                            layoutId="writingActiveCategory"
                                            className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-sky-100 dark:border-slate-600"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={`
                                            relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-300
                                            ${cat.dotColor}
                                            ${selectedCategory === cat.id ? 'scale-110' : 'opacity-40 group-hover/dot:opacity-100 group-hover/dot:scale-110'}
                                        `} />
                                </button>
                            ))}
                        </div>
                    </div>
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
