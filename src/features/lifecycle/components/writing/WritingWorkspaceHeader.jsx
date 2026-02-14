import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import WritingCategorySelector from './WritingCategorySelector';
import WritingCategoryManager from './WritingCategoryManager';

const WritingWorkspaceHeader = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
    onCreate,
    searchQuery,
    onSearchQueryChange,
    onAddCategory,
    onUpdateCategory,
    onRemoveCategory
}) => {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

    useEffect(() => {
        if (searchQuery && !isSearchOpen) {
            setIsSearchOpen(true);
        }
    }, [searchQuery, isSearchOpen]);

    return (
        <header className="relative z-20 border-b border-sky-100/50 bg-white px-6 pb-4 pt-6 dark:border-slate-800/60 dark:bg-slate-900">
            <div className="flex items-end justify-between gap-6">
                <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1 text-[2.15rem] font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {t('inspiration.writing')}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-400 dark:text-slate-500">
                        {t('inspiration.writingSubtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {!isSearchOpen ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2"
                            >
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-sky-500 transition-all hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-sky-400 dark:hover:bg-slate-800"
                                    title={t('inspiration.search')}
                                >
                                    <Search size={18} />
                                </button>
                                <button
                                    onClick={() => onCreate(selectedCategory)}
                                    disabled={!selectedCategory}
                                    className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-sky-500 text-white shadow-[0_4px_12px_-4px_rgba(14,165,233,0.5)] transition-all hover:bg-sky-600 active:scale-95 disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                    <span className="text-sm font-bold">{t('inspiration.newDoc')}</span>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center gap-2 overflow-hidden"
                            >
                                <div className="relative w-64 lg:w-80">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => onSearchQueryChange(event.target.value)}
                                        placeholder={t('inspiration.search')}
                                        className="h-10 w-full rounded-xl border border-slate-200/60 bg-white/80 px-10 text-sm text-slate-700 outline-none transition-all focus:border-sky-400 focus:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-sky-600 dark:focus:bg-slate-800"
                                    />
                                    <button
                                        onClick={() => {
                                            onSearchQueryChange('');
                                            setIsSearchOpen(false);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                    <WritingCategorySelector
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={onSelectCategory}
                        onOpenManager={() => setCategoryManagerOpen(true)}
                        t={t}
                    />
                </div>
            </div>

            <WritingCategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setCategoryManagerOpen(false)}
                categories={categories}
                onAdd={onAddCategory}
                onUpdate={onUpdateCategory}
                onRemove={onRemoveCategory}
            />
        </header>
    );
};

export default WritingWorkspaceHeader;
