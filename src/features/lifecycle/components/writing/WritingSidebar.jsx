import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, ArrowLeft, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import WritingCategoryManager from './WritingCategoryManager';
import { stripMarkup } from './editorUtils';

const DEFAULT_WRITING_CATEGORY_LABELS = {
    draft: 'Draft',
    plot: 'Plot',
    character: 'Character',
    world: 'World',
    final: 'Final',
};

const DEFAULT_WRITING_CATEGORY_I18N_KEYS = {
    draft: 'writing.categoryDraft',
    plot: 'writing.categoryPlot',
    character: 'writing.categoryCharacter',
    world: 'writing.categoryWorld',
    final: 'writing.categoryFinal',
};

const formatDocTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const resolveCategoryLabel = (category, t) => {
    if (!category) return t('common.noData');
    const key = DEFAULT_WRITING_CATEGORY_I18N_KEYS[category.id];
    const defaultLabel = DEFAULT_WRITING_CATEGORY_LABELS[category.id];
    if (key && (!category.label || category.label === defaultLabel)) {
        return t(key, defaultLabel);
    }
    return category.label || t('common.noData');
};

const WritingSidebarItem = ({ doc, isActive, onSelect, onUpdate, onDelete, categories, defaultCategoryId, t }) => {
    const category = categories.find((item) => item.id === (doc.category || defaultCategoryId)) || categories[0];
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

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleRename();
        } else if (event.key === 'Escape') {
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
                    'cursor-pointer rounded-2xl border px-4 py-3 transition',
                    isActive
                        ? 'border-sky-200 bg-sky-50 shadow-[0_14px_34px_-24px_rgba(59,130,246,0.6)] dark:border-sky-800 dark:bg-slate-900 dark:shadow-none'
                        : 'border-sky-100/80 bg-white/86 hover:border-sky-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                ].join(' ')}
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {isRenaming ? (
                            <input
                                ref={inputRef}
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                onBlur={handleRename}
                                onKeyDown={handleKeyDown}
                                onClick={(event) => event.stopPropagation()}
                                className="w-full border-b border-sky-300 bg-transparent pb-0.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:border-sky-600 dark:text-slate-200"
                                placeholder={t('inspiration.untitled')}
                            />
                        ) : (
                            <span
                                onDoubleClick={(event) => {
                                    event.stopPropagation();
                                    setIsRenaming(true);
                                }}
                                className="line-clamp-1 select-none text-sm font-medium text-slate-800 dark:text-slate-200"
                                title={t('common.doubleClickToRename', 'Double click to rename')}
                            >
                                {doc.title || t('inspiration.untitled')}
                            </span>
                        )}
                    </div>
                    <span className="ml-2 shrink-0 text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80">
                        {formatDocTime(doc.lastModified || doc.timestamp)}
                    </span>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                </p>

                <div className="mt-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-600 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${category?.dotColor || 'bg-sky-400'}`} />
                        {resolveCategoryLabel(category, t)}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

const WritingSidebar = ({
    documents = [],
    categories = [],
    activeDocId,
    onSelectDoc,
    onCreate,
    onUpdate,
    onDelete,
    onAddCategory,
    onUpdateCategory,
    onRemoveCategory,
    onRestore,
    onClose,
    isMobile
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(() => categories[0]?.id || null);

    const defaultCategoryId = categories[0]?.id || null;

    useEffect(() => {
        if (searchQuery && !isSearchOpen) {
            setIsSearchOpen(true);
        }
    }, [searchQuery, isSearchOpen]);

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategory(null);
            return;
        }
        const exists = categories.some((category) => category.id === selectedCategory);
        if (!exists) {
            setSelectedCategory(categories[0].id);
        }
    }, [categories, selectedCategory]);

    const filteredDocs = useMemo(() => {
        if (!selectedCategory) return [];

        let list = documents.filter((doc) => (doc.category || defaultCategoryId) === selectedCategory);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter((doc) =>
                (doc.title || '').toLowerCase().includes(query)
                || stripMarkup(doc.content || '').toLowerCase().includes(query)
            );
        }

        return list;
    }, [documents, searchQuery, selectedCategory, defaultCategoryId]);

    const groupedDocs = useMemo(() => {
        const groups = { today: [], yesterday: [], week: [], older: [] };
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        filteredDocs.forEach((doc) => {
            const timestamp = doc.lastModified || doc.timestamp || Date.now();
            if (timestamp >= todayStart) groups.today.push(doc);
            else if (timestamp >= yesterdayStart) groups.yesterday.push(doc);
            else if (timestamp >= weekStart) groups.week.push(doc);
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
                            categories={categories}
                            defaultCategoryId={defaultCategoryId}
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

    const selectedCategoryInfo = categories.find((category) => category.id === selectedCategory) || categories[0];

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-900">
            {isMobile && <div className="pt-safe" />}

            <header className="border-b border-sky-100/90 px-4 pb-4 pt-5 dark:border-slate-800/90">
                <div className="mb-6 flex items-start justify-between gap-3">
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
                            <h2 className="line-clamp-1 text-[2.15rem] font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-100">
                                {t('inspiration.writing')}
                            </h2>
                            <p className="mt-2 line-clamp-1 text-[15px] leading-relaxed text-slate-400 dark:text-slate-500">
                                {t('inspiration.writingSubtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onCreate(selectedCategory)}
                        disabled={!selectedCategory}
                        className="inline-flex h-11 items-center gap-2.5 rounded-2xl border border-slate-300 bg-slate-700 px-4 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                        title={t('inspiration.newDoc')}
                    >
                        <Plus size={18} />
                        <span>{t('inspiration.newDoc')}</span>
                    </button>
                </div>

                <div className="mb-4">
                    {!isSearchOpen ? (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-500 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400 dark:hover:border-slate-600"
                            title={t('inspiration.search')}
                        >
                            <Search size={16} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400/80" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={t('inspiration.search')}
                                    className="w-full rounded-xl border border-sky-100 bg-white px-9 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:shadow-[0_0_0_4px_rgba(125,211,252,0.25)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-700 dark:focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)]"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setIsSearchOpen(false);
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-400 transition hover:bg-sky-50 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                title={t('common.close', '关闭')}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative z-20 mt-5 flex items-center justify-center gap-2 px-1">
                    <div className="flex items-center rounded-full border border-sky-100 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 group/selector">
                        <div className="relative mr-1 flex h-8 min-w-[60px] items-center justify-center overflow-hidden border-r border-sky-200/50 px-3 dark:border-slate-700/50">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={selectedCategory || 'none'}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className={`text-xs font-medium ${selectedCategoryInfo?.textColor || 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    {resolveCategoryLabel(selectedCategoryInfo, t)}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-1">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="group/dot relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                                    title={resolveCategoryLabel(category, t)}
                                >
                                    {selectedCategory === category.id && (
                                        <motion.div
                                            layoutId="writingActiveCategory"
                                            className="absolute inset-0 rounded-full border border-sky-100 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div
                                        className={`relative z-10 h-2.5 w-2.5 rounded-full transition-all duration-300 ${category.dotColor} ${selectedCategory === category.id
                                            ? 'scale-110'
                                            : 'opacity-40 group-hover/dot:scale-110 group-hover/dot:opacity-100'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setCategoryManagerOpen(true)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-400 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-sky-400"
                        title="管理分类"
                    >
                        <Settings2 size={15} />
                    </button>
                </div>
            </header>

            <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
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

            <WritingCategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setCategoryManagerOpen(false)}
                categories={categories}
                onAdd={onAddCategory}
                onUpdate={onUpdateCategory}
                onRemove={onRemoveCategory}
            />
        </div>
    );
};

export default WritingSidebar;
