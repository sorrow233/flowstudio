import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Settings2 } from 'lucide-react';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingCategorySelector = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
    onOpenManager,
    isMobile = false,
    t,
}) => {
    const selectedCategoryInfo = categories.find((category) => category.id === selectedCategory) || categories[0];
    const managerTitle = t('writing.manageCategories', '管理分类');

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className={`relative z-20 flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
            <div className={`flex min-w-0 flex-1 items-center border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:border-slate-800/50 dark:bg-slate-900/60 dark:hover:bg-slate-900/80 ${isMobile ? 'rounded-2xl px-1.5 py-1.5' : 'rounded-full p-1'}`}>
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
                            {resolveWritingCategoryLabel(selectedCategoryInfo, t, t('common.noData'))}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* 滑动圆点容器 */}
                <div className={`no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto ${isMobile ? 'flex-1 px-1.5' : 'flex-1 pl-1 pr-1'}`}>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className={`group/dot relative flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isMobile ? 'h-8 w-8' : 'h-7 w-7'}`}
                            title={resolveWritingCategoryLabel(category, t, t('common.noData'))}
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
                <button
                    onClick={onOpenManager}
                    className={`ml-1 inline-flex shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-600 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 ${isMobile ? 'h-8 w-8' : 'h-7 w-7'}`}
                    title={managerTitle}
                >
                    <Settings2 size={13} />
                </button>
            </div>
        </div>
    );
};

export default WritingCategorySelector;
