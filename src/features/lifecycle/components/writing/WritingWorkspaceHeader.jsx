import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArchiveRestore, Plus, Search, Settings2, X } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import WritingCategorySelector from './WritingCategorySelector';
import WritingCategoryManager from './WritingCategoryManager';
import { findWritingCategoryPreset, resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingWorkspaceHeader = ({
    compact = false,
    categories = [],
    selectedCategory,
    onSelectCategory,
    onCreate,
    viewMode = 'active',
    onViewModeChange,
    trashCount = 0,
    searchQuery,
    onSearchQueryChange,
    onAddCategory,
    onUpdateCategory,
    onRemoveCategory,
    categoryDocCountMap = {},
    isMobile = false,
    isCollapsed = false,
}) => {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const isTrashView = viewMode === 'trash';
    const collapsed = !compact && isCollapsed;

    useEffect(() => {
        if (searchQuery && !isSearchOpen) {
            setIsSearchOpen(true);
        }
    }, [searchQuery, isSearchOpen]);

    const selectedCategoryObj = categories.find((item) => item.id === selectedCategory);
    const selectedCategoryPreset = findWritingCategoryPreset(selectedCategoryObj);

    const getButtonStyle = () => {
        const fallback = {
            className: 'bg-sky-100 text-sky-600 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50',
        };

        if (!selectedCategoryPreset) return fallback;

        return {
            className: `${selectedCategoryPreset.buttonClass} ${selectedCategoryPreset.darkButtonClass}`,
        };
    };

    const buttonStyle = getButtonStyle();

    const compactCategories = useMemo(() => categories.slice(0, 10), [categories]);
    const selectedCategoryLabel = resolveWritingCategoryLabel(selectedCategoryObj, t, t('common.noData'));
    const selectedCategoryTextClass = selectedCategoryObj?.dotColor
        ? selectedCategoryObj.dotColor.replace('bg-', 'text-')
        : 'text-slate-500';

    const renderCompactHeader = () => (
        <>
            <AnimatePresence mode="wait">
                {!isSearchOpen ? (
                    <motion.div
                        key="compact-tools"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2"
                    >
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/85 text-sky-500 transition-all hover:border-sky-300 hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/85 dark:text-sky-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                            title={t('inspiration.search')}
                        >
                            <Search size={18} className="transition-transform group-hover:scale-110" />
                        </button>

                        <button
                            onClick={() => onCreate(selectedCategory)}
                            disabled={!selectedCategory || isTrashView}
                            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 font-bold transition-all active:scale-[0.97] disabled:opacity-50 ${buttonStyle.className}`}
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            {!isMobile && <span className="truncate text-[13px] tracking-tight">{t('inspiration.newDoc')}</span>}
                        </button>

                        <button
                            onClick={() => onViewModeChange?.(isTrashView ? 'active' : 'trash')}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${isTrashView
                                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300'
                                : 'border-slate-200/70 bg-white/85 text-slate-500 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-sky-400'
                                }`}
                            title={isTrashView ? t('writing.system.all', '全部') : `${t('writing.system.trash', '废纸篓')} (${trashCount})`}
                        >
                            <ArchiveRestore size={16} />
                        </button>

                        <button
                            onClick={() => setCategoryManagerOpen(true)}
                            disabled={isTrashView}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-500 transition hover:border-sky-300 hover:text-sky-600 disabled:opacity-45 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-sky-400"
                            title={t('writing.manageCategories', '管理分类')}
                        >
                            <Settings2 size={16} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="compact-search"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-2"
                    >
                        <div className="relative min-w-0">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(event) => onSearchQueryChange(event.target.value)}
                                placeholder={t('inspiration.search')}
                                className="h-10 w-full rounded-xl border border-slate-200/70 bg-white/85 px-10 text-sm text-slate-700 outline-none transition focus:border-sky-400 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-sky-600"
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
                            onClick={() => onViewModeChange?.(isTrashView ? 'active' : 'trash')}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${isTrashView
                                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300'
                                : 'border-slate-200/70 bg-white/85 text-slate-500 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-sky-400'
                                }`}
                            title={isTrashView ? t('writing.system.all', '全部') : `${t('writing.system.trash', '废纸篓')} (${trashCount})`}
                        >
                            <ArchiveRestore size={16} />
                        </button>

                        <button
                            onClick={() => setCategoryManagerOpen(true)}
                            disabled={isTrashView}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-500 transition hover:border-sky-300 hover:text-sky-600 disabled:opacity-45 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-sky-400"
                            title={t('writing.manageCategories', '管理分类')}
                        >
                            <Settings2 size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`${isTrashView ? 'pointer-events-none opacity-55' : ''}`}>
                <div className="flex h-12 items-center rounded-3xl border border-slate-200/80 bg-white/88 px-1.5 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.85)] dark:border-slate-700/70 dark:bg-slate-800/85">
                    <div className="flex shrink-0 items-center gap-2 px-2">
                        <span className={`max-w-[5.5rem] truncate text-[13px] font-semibold ${selectedCategoryTextClass}`}>
                            {selectedCategoryLabel}
                        </span>
                        <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-x-auto">
                        <div className="flex min-w-max items-center gap-1.5 pr-1">
                            {compactCategories.map((category) => {
                                const label = resolveWritingCategoryLabel(category, t, t('common.noData'));
                                const isActive = selectedCategory === category.id;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => onSelectCategory(category.id)}
                                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${isActive
                                            ? 'border-slate-200 bg-white shadow-[0_4px_10px_-8px_rgba(15,23,42,0.65)] dark:border-slate-600 dark:bg-slate-700'
                                            : 'border-transparent hover:border-slate-200/80 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-700/70'
                                            }`}
                                        title={label}
                                        aria-label={label}
                                    >
                                        <span className={`rounded-full ${category.dotColor} ${isActive ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <motion.header
            className={`relative z-20 overflow-hidden border-b border-sky-100/50 bg-white dark:border-slate-800/60 dark:bg-slate-900 ${isMobile ? 'px-3' : compact ? 'px-3.5' : 'px-6'}`}
            initial={false}
            animate={{
                height: collapsed ? 0 : 'auto',
                paddingTop: collapsed ? 0 : (compact ? 10 : (isMobile ? 16 : 24)),
                paddingBottom: collapsed ? 0 : (compact ? 10 : 16),
                borderBottomWidth: collapsed ? 0 : 1,
                opacity: collapsed ? 0 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.725, 0.25, 1] }}
        >
            <div className={`flex flex-col ${compact ? 'gap-2.5' : isMobile ? 'gap-4' : 'gap-5'}`}>
                {compact ? (
                    renderCompactHeader()
                ) : (
                    <>
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
                                        disabled={!selectedCategory || isTrashView}
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
                                            viewMode={viewMode}
                                            onViewModeChange={onViewModeChange}
                                            trashCount={trashCount}
                                            categoryDocCountMap={categoryDocCountMap}
                                            disabled={isTrashView}
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
                                        disabled={!selectedCategory || isTrashView}
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
                                            viewMode={viewMode}
                                            onViewModeChange={onViewModeChange}
                                            trashCount={trashCount}
                                            categoryDocCountMap={categoryDocCountMap}
                                            disabled={isTrashView}
                                            isMobile={isMobile}
                                            t={t}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            <WritingCategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setCategoryManagerOpen(false)}
                categories={categories}
                onAdd={onAddCategory}
                onUpdate={onUpdateCategory}
                onRemove={onRemoveCategory}
                categoryDocCountMap={categoryDocCountMap}
            />
        </motion.header>
    );
};

export default WritingWorkspaceHeader;
