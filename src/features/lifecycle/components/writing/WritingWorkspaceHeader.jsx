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
        <header className={`relative z-20 border-b border-sky-100/50 bg-white dark:border-slate-800/60 dark:bg-slate-900 ${isMobile ? 'px-4 py-1.5' : 'px-6 pb-4 pt-6'}`}>
            <div className={`flex ${isMobile ? 'items-center justify-between' : 'items-end justify-between gap-6'}`}>
                <div className="min-w-0">
                    <h2 className={`line-clamp-1 font-bold tracking-tight text-slate-800 dark:text-slate-100 ${isMobile ? 'text-xl' : 'text-[2rem] md:text-[2.15rem]'}`}>
                        {t('inspiration.writing')}
                    </h2>
                    {!isMobile && (
                        <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-400 dark:text-slate-500">
                            {t('inspiration.writingSubtitle')}
                        </p>
                    )}
                </div>

                <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'flex-col gap-3 md:items-end md:gap-3'}`}>
                    <div className="flex items-center gap-1.5">
                        <AnimatePresence mode="wait">
                            {!isSearchOpen ? (
                                <motion.div
                                    key="actions"
                                    initial={{ opacity: 0, x: 5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 5 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className={`group inline-flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-sky-500 transition-all dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-sky-400 ${isMobile ? 'h-8 w-8' : 'h-10 w-10 hover:border-sky-300 hover:bg-white dark:hover:border-slate-600 dark:hover:bg-slate-800'}`}
                                        title={t('inspiration.search')}
                                    >
                                        <Search size={isMobile ? 15 : 18} className="transition-transform group-hover:scale-110" />
                                    </button>
                                    <button
                                        onClick={() => onCreate(selectedCategory)}
                                        disabled={!selectedCategory}
                                        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 font-bold text-white shadow-[0_2px_8px_-2px_rgba(14,165,233,0.4)] transition-all hover:bg-sky-600 active:scale-[0.97] disabled:opacity-50 ${isMobile ? 'h-8 w-8' : 'h-10 px-5'}`}
                                        title={t('inspiration.newDoc')}
                                    >
                                        <Plus size={isMobile ? 16 : 18} strokeWidth={2.5} />
                                        {!isMobile && <span className="text-[13.5px] tracking-tight">{t('inspiration.newDoc')}</span>}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="search"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-1.5 overflow-hidden"
                                >
                                    <div className={`relative ${isMobile ? 'w-32 xs:w-40' : 'w-64 lg:w-80'}`}>
                                        <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-sky-400" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(event) => onSearchQueryChange(event.target.value)}
                                            placeholder={t('inspiration.search')}
                                            className={`${isMobile ? 'h-8 px-7 text-[11px]' : 'h-10 px-10 text-sm'} w-full rounded-xl border border-slate-200/60 bg-white/80 text-slate-700 outline-none focus:border-sky-400 focus:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-sky-600 dark:focus:bg-slate-800`}
                                        />
                                        <button
                                            onClick={() => {
                                                onSearchQueryChange('');
                                                setIsSearchOpen(false);
                                            }}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isMobile && <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />}
                    </div>

                    {!isMobile && (
                        <WritingCategorySelector
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={onSelectCategory}
                            onOpenManager={() => setCategoryManagerOpen(true)}
                            isMobile={isMobile}
                            t={t}
                        />
                    )}
                </div>
            </div>

            {isMobile && (
                <div className="mt-1.5">
                    <WritingCategorySelector
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={onSelectCategory}
                        onOpenManager={() => setCategoryManagerOpen(true)}
                        isMobile={isMobile}
                        t={t}
                    />
                </div>
            )}

            <WritingCategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setCategoryManagerOpen(false)}
                categories={categories}
                onAdd={onAddCategory}
                onUpdate={onUpdateCategory}
                onRemove={onRemoveCategory}
            />
        </header >
    );
};

export default WritingWorkspaceHeader;
