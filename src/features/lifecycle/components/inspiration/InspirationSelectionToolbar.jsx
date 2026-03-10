import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Trash2, X } from 'lucide-react';
import { hexToRgba, resolveCategoryAccentHex } from './categoryThemeUtils';

const buildCategoryButtonStyle = (category, isIOS) => {
    const accent = resolveCategoryAccentHex(category);

    return {
        color: accent,
        borderColor: hexToRgba(accent, isIOS ? 0.4 : 0.22),
        backgroundImage: `linear-gradient(135deg, ${hexToRgba(accent, isIOS ? 0.22 : 0.14)}, ${hexToRgba(accent, isIOS ? 0.08 : 0.05)})`,
        boxShadow: `0 16px 32px -28px ${hexToRgba(accent, 0.9)}`,
    };
};

const renderCategoryButtons = ({
    categories,
    isIOS,
    onMove,
}) => categories.map((category) => {
    const accent = resolveCategoryAccentHex(category);

    return (
        <button
            key={category.id}
            type="button"
            onClick={() => onMove(category.id)}
            style={buildCategoryButtonStyle(category, isIOS)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border text-xs font-semibold transition-all duration-300 active:scale-[0.98] ${isIOS
                ? 'min-h-[44px] min-w-[96px] px-4 py-2.5'
                : 'px-3 py-2 whitespace-nowrap'
                }`}
        >
            <span
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.35)] dark:shadow-[0_0_0_2px_rgba(15,23,42,0.55)]"
                style={{ backgroundColor: accent }}
            />
            <span className="truncate">{category.label}</span>
        </button>
    );
});

const InspirationSelectionToolbar = ({
    isVisible = false,
    selectedCount = 0,
    isBatchCopied = false,
    categories = [],
    isIOS = false,
    onCopy,
    onDelete,
    onMove,
    onCancel,
}) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className={`fixed bottom-0 left-0 right-0 z-[110] pointer-events-none ${isIOS
                    ? 'md:bottom-10 md:left-1/2 md:right-auto md:w-[calc(100vw-2rem)] md:max-w-[760px] md:-translate-x-1/2'
                    : 'md:bottom-10 md:left-1/2 md:right-auto md:w-[calc(100vw-2rem)] md:max-w-[960px] md:-translate-x-1/2'
                    }`}
            >
                {isIOS ? (
                    <div className="pointer-events-auto mx-3 mb-[max(12px,env(safe-area-inset-bottom))] rounded-[28px] border border-slate-200/80 bg-white/96 p-3 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/94 dark:shadow-[0_26px_70px_-32px_rgba(2,6,23,0.9)] md:mx-0 md:mb-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/12 px-3.5 py-2 text-xs font-semibold text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-400/14 dark:text-sky-200 dark:ring-sky-400/28">
                                <span className="h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-300" />
                                {selectedCount} 项已选择
                            </div>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/90 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200/90 active:scale-[0.98] dark:border-slate-700/80 dark:bg-slate-800/88 dark:text-slate-200 dark:hover:bg-slate-700/88"
                            >
                                <X size={14} />
                                取消
                            </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={onCopy}
                                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-pink-500/14 px-4 py-2.5 text-sm font-semibold text-pink-700 ring-1 ring-pink-500/18 transition-colors hover:bg-pink-500/18 active:scale-[0.98] dark:bg-pink-400/16 dark:text-pink-200 dark:ring-pink-400/24 dark:hover:bg-pink-400/22"
                            >
                                <Copy size={15} />
                                {isBatchCopied ? '已复制选中' : '复制选中'}
                            </button>

                            <button
                                type="button"
                                onClick={onDelete}
                                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-rose-500/14 px-4 py-2.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-500/18 transition-colors hover:bg-rose-500/18 active:scale-[0.98] dark:bg-rose-400/16 dark:text-rose-200 dark:ring-rose-400/24 dark:hover:bg-rose-400/22"
                            >
                                <Trash2 size={15} />
                                删除选中
                            </button>
                        </div>

                        <div className="mt-3 rounded-[22px] border border-slate-200/70 bg-slate-50/82 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/82">
                            <div className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                转移到分类
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {renderCategoryButtons({ categories, isIOS: true, onMove })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="pointer-events-auto w-full border-t border-gray-100 bg-white/92 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl dark:border-gray-800 dark:bg-gray-950/92 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] md:rounded-[28px] md:border md:px-4 md:py-3 md:shadow-2xl">
                        <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap md:justify-start">
                            <div className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {selectedCount} 项
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onCopy}
                                    className="inline-flex items-center justify-center rounded-xl bg-pink-50 px-3 py-2 text-xs font-medium text-pink-600 transition-colors hover:bg-pink-100 active:scale-95 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50"
                                >
                                    {isBatchCopied ? '已复制选中' : '复制选中'}
                                </button>

                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    删除选中
                                </button>
                            </div>

                            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
                                {renderCategoryButtons({ categories, isIOS: false, onMove })}
                            </div>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        )}
    </AnimatePresence>
);

export default InspirationSelectionToolbar;
