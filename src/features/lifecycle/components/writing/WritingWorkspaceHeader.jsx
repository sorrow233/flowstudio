import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import WritingCategorySelector from './WritingCategorySelector';
import WritingCategoryManager from './WritingCategoryManager';
import { WRITING_CATEGORY_COLORS } from './writingCategoryUtils';

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

    const getButtonStyle = () => {
        if (!selectedCategory) {
            return {
                className: 'bg-sky-500 text-white hover:bg-sky-600 shadow-[0_2px_8px_-2px_rgba(14,165,233,0.4)]',
                iconColor: 'text-white'
            };
        }

        const categoryColor = WRITING_CATEGORY_COLORS.find(c => c.color === selectedCategory.color || c.dotColor === selectedCategory.dotColor);
        if (!categoryColor) {
            return {
                className: 'bg-sky-500 text-white hover:bg-sky-600 shadow-[0_2px_8px_-2px_rgba(14,165,233,0.4)]',
                iconColor: 'text-white'
            };
        }

        return {
            className: `${categoryColor.buttonClass} ${categoryColor.darkButtonClass}`,
            iconColor: 'currentColor'
        };
    };

    const buttonStyle = getButtonStyle();


    return (
        <header className={`relative z-20 border-b border-sky-100/50 bg-white dark:border-slate-800/60 dark:bg-slate-900 ${isMobile ? 'px-4 pb-4 pt-4' : 'px-6 pb-4 pt-6'}`}>
            <div className={`flex flex-col ${isMobile ? 'gap-4' : 'gap-5'}`}>
                <div className="min-w-0">
                    <h2 className={`line-clamp-1 font-bold tracking-tight text-slate-800 dark:text-slate-100 ${isMobile ? 'text-[2rem]' : 'text-[2.15rem]'}`}>
                        {t('inspiration.writing')}
                    </h2>
                    <p className={`mt-1 line-clamp-1 font-medium text-slate-400 dark:text-slate-500 ${isMobile ? 'text-[14px]' : 'text-sm'}`}>
                        {t('inspiration.writingSubtitle')}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isSearchOpen ? (
                        <motion.div
                            key="actions"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="flex items-center gap-2"
                        >
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-sky-500 transition-all hover:border-sky-300 hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-sky-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                title={t('inspiration.search')}
                            >
                                <Search size={18} className="transition-transform group-hover:scale-110" />
                            </button>
                            <button
                                onClick={() => onCreate(selectedCategory)}
                                disabled={!selectedCategory}
                                className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.97] disabled:opacity-50 ${isMobile ? 'w-10 px-0' : 'px-5'} ${buttonStyle.className}`}
                                title={t('inspiration.newDoc')}
                            >
                                <Plus size={22} strokeWidth={2.5} />
                                {!isMobile && <span className="text-[13.5px] tracking-tight">{t('inspiration.newDoc')}</span>}
                            </button>
                            <div className="min-w-0 flex-1">
                                <WritingCategorySelector
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={onSelectCategory}
                                    onOpenManager={() => setCategoryManagerOpen(true)}
                                    isMobile={isMobile}
                                    t={t}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="flex w-full items-center gap-2"
                        >
                            <div className="relative min-w-0 flex-1">
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
                                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyle.className}`}
                                title={t('inspiration.newDoc')}
                            >
                                <Plus size={22} strokeWidth={2.5} />
                            </button>
                            <div className="shrink-0">
                                <WritingCategorySelector
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={onSelectCategory}
                                    onOpenManager={() => setCategoryManagerOpen(true)}
                                    isMobile={isMobile}
                                    t={t}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
