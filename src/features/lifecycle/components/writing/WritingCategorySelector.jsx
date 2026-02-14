import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Settings2 } from 'lucide-react';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingCategorySelector = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
    onOpenManager,
    t,
}) => {
    const selectedCategoryInfo = categories.find((category) => category.id === selectedCategory) || categories[0];
    const shouldCompactCategoryBar = categories.length > 6;
    const managerTitle = t('writing.manageCategories', '管理分类');

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="relative z-20 mt-5 flex items-center gap-2 px-1">
            <button
                onClick={onOpenManager}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600"
                title={managerTitle}
            >
                <ListChecks size={16} />
            </button>

            <div className="flex min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_24px_-18px_rgba(30,64,175,0.4)]">
                {!shouldCompactCategoryBar && (
                    <div className="relative mr-1 flex h-8 min-w-[72px] max-w-[120px] shrink-0 items-center justify-center overflow-hidden border-r border-slate-200 px-3">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={selectedCategory || 'none'}
                                initial={{ y: 18, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -18, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className={`line-clamp-1 text-xs font-medium ${selectedCategoryInfo?.textColor || 'text-slate-600'}`}
                            >
                                {resolveWritingCategoryLabel(selectedCategoryInfo, t, t('common.noData'))}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                )}

                <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pl-0.5 pr-1">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className="group/dot relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                            title={resolveWritingCategoryLabel(category, t, t('common.noData'))}
                        >
                            {selectedCategory === category.id && (
                                <motion.div
                                    layoutId="writingActiveCategory"
                                    className="absolute inset-0 rounded-full border border-slate-200 bg-white shadow-sm"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div
                                className={`relative z-10 h-2.5 w-2.5 rounded-full transition-all duration-300 ${category.dotColor} ${selectedCategory === category.id
                                    ? 'scale-110'
                                    : 'opacity-40 group-hover/dot:scale-110 group-hover/dot:opacity-100'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                <button
                    onClick={onOpenManager}
                    className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    title={managerTitle}
                >
                    <Settings2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default WritingCategorySelector;
