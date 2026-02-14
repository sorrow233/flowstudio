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
    onRemoveCategory,
    isMobile = false
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
        <header className={`relative z-20 border-b border-sky-100/50 bg-white dark:border-slate-800/60 dark:bg-slate-900 ${isMobile ? 'px-4 pb-3 pt-3' : 'px-4 pb-4 pt-4 md:px-6 md:pt-6'}`}>
            <div className={`flex flex-col ${isMobile ? 'gap-3' : 'gap-4'} md:flex-row md:items-end md:justify-between md:gap-6`}>
                <div className="min-w-0 flex-1">
                    <h2 className={`line-clamp-1 font-bold tracking-tight text-slate-800 dark:text-slate-100 ${isMobile ? 'text-[1.85rem]' : 'text-[2rem] md:text-[2.15rem]'}`}>
                        {t('inspiration.writing')}
                    </h2>
                    <p className={`mt-1 line-clamp-1 font-medium text-slate-400 dark:text-slate-500 ${isMobile ? 'text-[13px]' : 'text-sm'}`}>
                        {t('inspiration.writingSubtitle')}
                    </p>
                </div>

                <div className="flex min-w-0 flex-col gap-3 md:items-end">
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
                                    className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-sky-500 transition-all hover:border-sky-300 hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-sky-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                    title={t('inspiration.search')}
                                >
                                    <Search size={18} className="transition-transform group-hover:scale-110" />
                                </button>

                                <button
                                    onClick={() => onCreate(selectedCategory)}
                                    disabled={!selectedCategory}
                                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-sky-500 text-white shadow-[0_2px_8px_-2px_rgba(14,165,233,0.4)] transition-all hover:bg-sky-600 active:scale-[0.97] dark:border-sky-300/25 dark:bg-sky-600/90 dark:text-sky-50 dark:hover:border-sky-200/40 dark:hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${isMobile ? 'w-10 px-0' : 'px-5 font-bold'}`}
                                    title={t('inspiration.newDoc')}
                                >
                                    {isMobile ? (
                                        <Plus size={18} strokeWidth={2.6} />
                                    ) : (
                                        <>
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 dark:bg-sky-200/20">
                                                <Plus size={15} strokeWidth={2.6} />
                                            </span>
                                            <span className="text-[13.5px] tracking-tight">{t('inspiration.newDoc')}</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex w-full items-center gap-2 overflow-hidden md:w-auto"
                            >
                                <div className={`relative ${isMobile ? 'w-full' : 'w-64 lg:w-80'}`}>
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

                                <button
                                    onClick={() => onCreate(selectedCategory)}
                                    disabled={!selectedCategory}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    title={t('inspiration.newDoc')}
                                >
                                    <Plus size={18} strokeWidth={2.6} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-full md:w-auto">
                        <WritingCategorySelector
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={onSelectCategory}
                            onOpenManager={() => setCategoryManagerOpen(true)}
                            isMobile={isMobile}
                            t={t}
                        />
                    </div>
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
