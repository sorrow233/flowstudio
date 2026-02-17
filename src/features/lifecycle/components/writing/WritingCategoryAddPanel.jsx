import React from 'react';
import { Check, Plus, X } from 'lucide-react';
import { MAX_WRITING_CATEGORIES, WRITING_CATEGORY_COLORS } from './writingCategoryUtils';

const WritingCategoryAddPanel = ({
    isAdding,
    categoriesCount,
    newLabel,
    newPresetId,
    usedPresetIds,
    maxInputLength,
    onOpenAdd,
    onConfirmAdd,
    onCancelAdd,
    onNewLabelChange,
    onNewLabelKeyDown,
    onPresetSelect,
    t,
}) => {
    if (!isAdding) {
        if (categoriesCount >= MAX_WRITING_CATEGORIES) {
            return (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                    {t('writing.categoryLimitReached', '已达到分类上限（10）')}
                </p>
            );
        }

        return (
            <button
                onClick={onOpenAdd}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 py-2.5 text-sm text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700 dark:hover:text-sky-400"
            >
                <Plus size={15} />
                {t('writing.addCategoryLimit10', '添加分类（最多10个）')}
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/75 px-3.5 py-3 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
                <span
                    className={`h-3 w-3 rounded-full ${(WRITING_CATEGORY_COLORS.find((item) => item.id === newPresetId)?.dotColor) || 'bg-sky-400'}`}
                />
                <input
                    autoFocus
                    placeholder={t('writing.categoryNamePlaceholder', '输入分类名称')}
                    value={newLabel}
                    maxLength={maxInputLength}
                    onChange={(event) => onNewLabelChange(event.target.value)}
                    onKeyDown={onNewLabelKeyDown}
                    className="min-w-0 flex-1 rounded-lg border border-sky-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                    onClick={onConfirmAdd}
                    className="rounded-md p-1.5 text-emerald-500 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title={t('common.confirm', '确认')}
                >
                    <Check size={15} />
                </button>
                <button
                    onClick={onCancelAdd}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t('common.cancel', '取消')}
                >
                    <X size={15} />
                </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {WRITING_CATEGORY_COLORS.map((preset) => {
                    const isActive = newPresetId === preset.id;
                    const isUsed = usedPresetIds.has(preset.id);

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onPresetSelect(preset.id)}
                            className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${isActive
                                ? 'border-sky-400 bg-white shadow-sm dark:bg-slate-900'
                                : 'border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900'
                                }`}
                            title={isUsed
                                ? t('writing.categoryColorInUse', '该颜色已被使用')
                                : t('writing.categoryColorSelect', '选择颜色')}
                        >
                            <span className={`h-3 w-3 rounded-full ${preset.dotColor}`} />
                            {isUsed && !isActive && (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-slate-400 dark:border-slate-900 dark:bg-slate-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WritingCategoryAddPanel;
