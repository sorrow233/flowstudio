import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArchiveRestore, Settings2 } from 'lucide-react';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingCategorySelector = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
    onOpenManager,
    viewMode = 'active',
    onViewModeChange,
    trashCount = 0,
    categoryDocCountMap = {},
    disabled = false,
    isMobile = false,
    t,
}) => {
    const isTrashView = viewMode === 'trash';
    const shouldDimSelector = disabled && !isTrashView;
    const selectedCategoryInfo = categories.find((category) => category.id === selectedCategory) || categories[0];
    const selectedCategoryCount = selectedCategoryInfo ? Number(categoryDocCountMap[selectedCategoryInfo.id] || 0) : 0;
    const managerTitle = t('writing.manageCategories', '管理分类');

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className={`relative z-20 flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
            <div className={`flex min-w-0 flex-1 items-center border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-md transition-all dark:border-slate-800/50 dark:bg-slate-900/60 ${shouldDimSelector
                ? 'cursor-not-allowed opacity-55'
                : 'hover:bg-white/80 dark:hover:bg-slate-900/80'
                } ${isMobile ? 'rounded-2xl px-1.5 py-1.5' : 'rounded-full p-1'}`}>
                {/* 类别名称显示 - 移动端也保留 */}
                <div className={`relative flex shrink-0 items-center justify-center overflow-hidden border-r border-slate-200/50 dark:border-slate-700/50 ${isMobile ? 'h-8 min-w-[70px] max-w-[110px] px-3.5' : 'h-7 min-w-[60px] max-w-[100px] px-3'}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={selectedCategory || 'none'}
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`line-clamp-1 text-[11px] font-bold tracking-tight ${selectedCategoryInfo?.textColor || 'text-slate-600 dark:text-slate-300'}`}
                        >
                            {`${resolveWritingCategoryLabel(selectedCategoryInfo, t, t('common.noData'))} · ${selectedCategoryCount}`}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* 滑动圆点容器 */}
                <div className={`no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto ${isMobile ? 'flex-1 px-1.5' : 'flex-1 pl-1 pr-1'}`}>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            disabled={disabled}
                            className={`group/dot relative flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isMobile ? 'h-8 w-8' : 'h-7 w-7'}`}
                            title={`${resolveWritingCategoryLabel(category, t, t('common.noData'))} (${Number(categoryDocCountMap[category.id] || 0)})`}
                            aria-label={`${resolveWritingCategoryLabel(category, t, t('common.noData'))} ${Number(categoryDocCountMap[category.id] || 0)}`}
                        >
                            {selectedCategory === category.id && (
                                <motion.div
                                    layoutId="writingActiveCategory"
                                    className="absolute inset-0 rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div
                                className={`relative z-10 h-3 w-3 rounded-full transition-all duration-300 ${category.dotColor} ${selectedCategory === category.id
                                    ? 'scale-110'
                                    : 'opacity-40 group-hover/dot:scale-110 group-hover/dot:opacity-100'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* 设置/管理按钮 */}
                <div className={`ml-1 inline-flex shrink-0 items-center ${isMobile ? 'gap-0.5' : 'gap-0.5'}`}>
                    <button
                        onClick={() => onViewModeChange?.(isTrashView ? 'active' : 'trash')}
                        className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${isMobile ? 'h-8 w-8' : 'h-7 w-7'} ${isTrashView
                            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300'
                            : 'border-transparent bg-transparent text-slate-400 hover:border-slate-200/70 hover:bg-white/70 hover:text-slate-600 dark:text-slate-500 dark:hover:border-slate-700/60 dark:hover:bg-slate-800/70 dark:hover:text-slate-300'
                            }`}
                        title={isTrashView ? t('writing.system.all', '全部') : `${t('writing.system.trash', '废纸篓')} (${trashCount})`}
                    >
                        <ArchiveRestore size={12} />
                    </button>

                    <button
                        onClick={onOpenManager}
                        disabled={disabled}
                        className={`inline-flex shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-600 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 disabled:opacity-50 ${isMobile ? 'h-8 w-8' : 'h-7 w-7'}`}
                        title={managerTitle}
                    >
                        <Settings2 size={13} />
                    </button>
                </div>
            </div>

            {!isTrashView && trashCount > 0 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{trashCount}</span>
            )}
        </div>
    );
};

export default WritingCategorySelector;
