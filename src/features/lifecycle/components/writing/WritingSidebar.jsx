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
                    'cursor-pointer border px-3 py-2.5 transition',
                    isActive
                        ? 'border-rose-200 bg-rose-50/75 shadow-sm dark:border-rose-800/60 dark:bg-rose-900/20'
                        : 'border-gray-200/75 bg-white/80 hover:border-rose-200/80 hover:bg-white dark:border-gray-800 dark:bg-slate-900/70 dark:hover:border-rose-800/60'
                ].join(' ')}
            >
                <div className="flex items-start gap-2.5">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${category.dotColor}`} />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h4 className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="shrink-0 text-[10px] tabular-nums text-gray-400 dark:text-gray-600">
                                {new Date(doc.lastModified || doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <p className="line-clamp-1 text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            <section className="mb-4">
                <h3 className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h3>
                <div className="space-y-1.5">
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

            <header className="px-3 pb-3 pt-4 border-b border-gray-100 dark:border-gray-800/60">
                {/* Top Row: Title, Count, Actions */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300"
                            >
                                <ArrowLeft size={14} />
                            </button>
                        )}
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {t('inspiration.writing')}
                        </h2>
                        <span className="bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                            {documents.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search Dot Button */}
                        <div className="relative">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 140, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="absolute right-0 top-0 bottom-0 mr-8 overflow-hidden z-20"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                            placeholder="Search..."
                                            className="h-7 w-full rounded-full bg-gray-100/80 px-3 text-xs outline-none dark:bg-gray-800/80"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => {
                                    if (isSearchOpen && !searchQuery) setIsSearchOpen(false);
                                    else setIsSearchOpen(true);
                                }}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${isSearchOpen || searchQuery
                                    ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400'
                                    }`}
                            >
                                <Search size={14} />
                            </button>
                        </div>

                        {/* New Doc Button */}
                        <button
                            onClick={() => onCreate(selectedCategory)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-200 hover:bg-rose-600 dark:shadow-rose-900/20 transition-transform active:scale-95"
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Category Selector Capsule */}
                <div className="flex items-center p-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-full border border-gray-100/50 dark:border-gray-800/50 shadow-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:shadow-md hover:border-pink-100/30 dark:hover:border-pink-900/30 w-fit mx-auto md:mx-0">
                    {/* Label Section - Animated */}
                    <div className="flex items-center px-3 border-r border-gray-200/50 dark:border-gray-700/50 mr-1 min-w-[60px] justify-center relative overflow-hidden h-6">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={selectedCategory || 'all'}
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -15, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={`text-[11px] font-medium ${selectedCategory
                                    ? WRITING_CATEGORIES.find(c => c.id === selectedCategory)?.textColor
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {selectedCategory
                                    ? WRITING_CATEGORIES.find(c => c.id === selectedCategory)?.label
                                    : t('inspiration.system.all', '全部')
                                }
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Dots Section */}
                    <div className="flex items-center gap-1 pr-1">
                        {WRITING_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className="relative w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 group/dot flex-shrink-0"
                                title={cat.label}
                            >
                                {selectedCategory === cat.id && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`
                                    relative z-10 w-2 h-2 rounded-full transition-all duration-300
                                    ${cat.dotColor}
                                    ${selectedCategory === cat.id ? 'scale-110' : 'opacity-40 group-hover/dot:opacity-100 group-hover/dot:scale-110'}
                                `} />
                            </button>
                        ))}
                    </div>
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
