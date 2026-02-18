import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArchiveRestore, ListChecks, Plus, Search, Settings2, X } from 'lucide-react';
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
    isSelectionMode = false,
    onToggleSelectionMode,
}) => {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [isCompactPanelOpen, setIsCompactPanelOpen] = useState(false);
    const isTrashView = viewMode === 'trash';
    const collapsed = !compact && isCollapsed;

    useEffect(() => {
        if (searchQuery && !isSearchOpen) {
            setIsSearchOpen(true);
        }
    }, [searchQuery, isSearchOpen]);

    useEffect(() => {
        if (!compact) return;
        if (searchQuery && !isCompactPanelOpen) {
            setIsCompactPanelOpen(true);
        }
    }, [compact, isCompactPanelOpen, searchQuery]);

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

    const renderCompactCategoryBar = () => (
        <div className="flex items-center gap-1.5">
            <div className={`min-w-0 flex-1 ${isTrashView ? 'pointer-events-none opacity-55' : ''}`}>
                <div className="flex h-10 items-center rounded-full border border-slate-200/70 bg-white/72 px-1 backdrop-blur-sm dark:border-slate-700/65 dark:bg-slate-800/65">
                    <div className="flex shrink-0 items-center gap-1.5 px-1.5">
                        <span className={`max-w-[4.6rem] truncate text-[12px] font-semibold ${selectedCategoryTextClass}`}>
                            {selectedCategoryLabel}
                        </span>
                        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-x-auto">
                        <div className="flex min-w-max items-center gap-1 pr-1">
                            {compactCategories.map((category) => {
                                const label = resolveWritingCategoryLabel(category, t, t('common.noData'));
                                const isActive = selectedCategory === category.id;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => onSelectCategory(category.id)}
                                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isActive
                                            ? 'border-slate-200 bg-white shadow-[0_6px_14px_-10px_rgba(15,23,42,0.6)] dark:border-slate-600 dark:bg-slate-700'
                                            : 'border-transparent hover:border-slate-200/80 hover:bg-slate-50/80 dark:hover:border-slate-600 dark:hover:bg-slate-700/70'
                                            }`}
                                        title={label}
                                        aria-label={label}
                                    >
                                        <span className={`rounded-full transition-all duration-300 ${category.dotColor} ${isActive ? 'h-3 w-3' : 'h-2.5 w-2.5 opacity-75'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onViewModeChange?.(isTrashView ? 'active' : 'trash')}
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isTrashView
                    ? 'border-amber-200/90 bg-amber-100/75 text-amber-700 shadow-[0_8px_18px_-14px_rgba(245,158,11,0.6)] dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-slate-200/65 bg-white/55 text-slate-500 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-white/82 hover:text-sky-600 hover:shadow-[0_8px_18px_-14px_rgba(15,23,42,0.5)] dark:border-slate-700/60 dark:bg-slate-800/45 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/75 dark:hover:text-sky-400'
                    }`}
                title={isTrashView ? t('writing.system.all', '全部') : `${t('writing.system.trash', '废纸篓')} (${trashCount})`}
            >
                <ArchiveRestore size={14} />
            </button>

            <button
                onClick={() => setCategoryManagerOpen(true)}
                disabled={isTrashView}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/65 bg-white/55 text-slate-500 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-white/82 hover:text-sky-600 hover:shadow-[0_8px_18px_-14px_rgba(15,23,42,0.5)] disabled:opacity-45 dark:border-slate-700/60 dark:bg-slate-800/45 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/75 dark:hover:text-sky-400"
                title={t('writing.manageCategories', '管理分类')}
            >
                <Settings2 size={14} />
            </button>
        </div>
    );

    const renderCompactHeader = () => (
        <>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2"
            >
                <button
                    onClick={() => onToggleSelectionMode?.()}
                    disabled={isTrashView}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${isSelectionMode
                        ? 'border-sky-300/80 bg-sky-500/20 text-sky-600 shadow-[0_8px_20px_-14px_rgba(14,165,233,0.55)] dark:border-sky-700/70 dark:bg-sky-900/35 dark:text-sky-300'
                        : 'border-slate-200/60 bg-white/45 text-slate-500 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-white/75 hover:text-sky-600 hover:shadow-[0_10px_22px_-14px_rgba(15,23,42,0.5)] dark:border-slate-700/60 dark:bg-slate-800/45 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/72 dark:hover:text-sky-400'
                        } disabled:opacity-45`}
                    title={isSelectionMode ? t('writing.exitMultiSelect', '退出多选') : t('writing.multiSelect', '多选')}
                >
                    {isSelectionMode ? <X size={16} /> : <ListChecks size={16} />}
                </button>

                <button
                    onClick={() => onCreate(selectedCategory)}
                    disabled={!selectedCategory || isTrashView}
                    className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/35 px-3.5 text-[12px] font-bold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(15,23,42,0.5)] active:scale-[0.97] disabled:opacity-50 ${buttonStyle.className}`}
                    title={t('inspiration.newDoc')}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    {!isMobile && <span className="truncate tracking-tight">{t('inspiration.newDoc')}</span>}
                </button>

                <button
                    onClick={() => setIsCompactPanelOpen((open) => !open)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${(isCompactPanelOpen || Boolean(searchQuery))
                        ? 'border-sky-300/80 bg-sky-500/20 text-sky-600 shadow-[0_8px_20px_-14px_rgba(14,165,233,0.55)] dark:border-sky-700/70 dark:bg-sky-900/35 dark:text-sky-300'
                        : 'border-slate-200/60 bg-white/45 text-slate-500 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-white/75 hover:text-sky-600 hover:shadow-[0_10px_22px_-14px_rgba(15,23,42,0.5)] dark:border-slate-700/60 dark:bg-slate-800/45 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/72 dark:hover:text-sky-400'
                        }`}
                    title={t('inspiration.search')}
                >
                    <Search size={16} />
                </button>
            </motion.div>

            {renderCompactCategoryBar()}

            <AnimatePresence>
                {isCompactPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-[22px] border border-slate-200/60 bg-white/60 p-2 backdrop-blur-md shadow-[0_14px_30px_-20px_rgba(15,23,42,0.65)] dark:border-slate-700/60 dark:bg-slate-900/62"
                    >
                        <div className="relative min-w-0">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => onSearchQueryChange(event.target.value)}
                                placeholder={t('inspiration.search')}
                                className="h-8 w-full rounded-full border border-slate-200/70 bg-white/70 px-8 text-xs text-slate-700 outline-none backdrop-blur-sm transition-all duration-300 focus:border-sky-400 focus:bg-white/92 focus:shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)] dark:border-slate-700/60 dark:bg-slate-800/52 dark:text-slate-200 dark:focus:border-sky-600 dark:focus:bg-slate-800/82"
                            />
                            {!!searchQuery && (
                                <button
                                    onClick={() => onSearchQueryChange('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
