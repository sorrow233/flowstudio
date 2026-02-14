import React, { useEffect, useState } from 'react';
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
        <header className="relative z-20 border-b border-sky-100/90 bg-white px-5 pb-5 pt-6 dark:border-slate-800/90 dark:bg-slate-900">
            <div className="min-w-0">
                <h2 className="line-clamp-1 text-[2.15rem] font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-100">
                    {t('inspiration.writing')}
                </h2>
                <p className="mt-2 line-clamp-1 text-[15px] leading-relaxed text-slate-400 dark:text-slate-500">
                    {t('inspiration.writingSubtitle')}
                </p>
            </div>

            <div className="mt-6">
                {!isSearchOpen ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-500 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400 dark:hover:border-slate-600"
                            title={t('inspiration.search')}
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={() => onCreate(selectedCategory)}
                            disabled={!selectedCategory}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-[420px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400/80" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(event) => onSearchQueryChange(event.target.value)}
                                placeholder={t('inspiration.search')}
                                className="w-full rounded-xl border border-sky-100 bg-white px-9 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:shadow-[0_0_0_4px_rgba(125,211,252,0.25)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-700 dark:focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)]"
                            />
                        </div>
                        <button
                            onClick={() => {
                                onSearchQueryChange('');
                                setIsSearchOpen(false);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-400 transition hover:bg-sky-50 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            title={t('common.close', '关闭')}
                        >
                            <X size={15} />
                        </button>
                        <button
                            onClick={() => onCreate(selectedCategory)}
                            disabled={!selectedCategory}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}
            </div>

            <WritingCategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                onOpenManager={() => setCategoryManagerOpen(true)}
                t={t}
            />

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
