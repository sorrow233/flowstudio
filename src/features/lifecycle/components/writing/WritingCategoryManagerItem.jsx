import React from 'react';
import { Check, Edit2, Lock, Palette, Trash2, X } from 'lucide-react';
import { isDefaultWritingCategoryId, resolveWritingCategoryLabel } from './writingCategoryUtils';

const WritingCategoryManagerItem = ({
    category,
    docsCount,
    isEditing,
    isDeleteConfirming,
    editLabel,
    maxInputLength,
    canDelete,
    onEditLabelChange,
    onEditKeyDown,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    onCycleColor,
    onRequestDelete,
    onConfirmDelete,
    onCancelDelete,
    t,
}) => {
    const isDefault = isDefaultWritingCategoryId(category.id);

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-800/45">
            <div className="flex items-center gap-2.5">
                <button
                    onClick={() => onCycleColor(category)}
                    disabled={isDefault}
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent transition ${isDefault
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                    title={isDefault
                        ? t('writing.categoryColorFixed', '默认分类颜色固定')
                        : t('writing.categoryColorChange', '切换分类颜色')}
                >
                    <span className={`h-3.5 w-3.5 rounded-full ${category.dotColor}`} />
                </button>

                {isEditing ? (
                    <input
                        autoFocus
                        value={editLabel}
                        maxLength={maxInputLength}
                        onChange={(event) => onEditLabelChange(event.target.value)}
                        onKeyDown={onEditKeyDown}
                        className="min-w-0 flex-1 rounded-lg border border-sky-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        placeholder={t('writing.categoryNamePlaceholder', '输入分类名称')}
                    />
                ) : (
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {resolveWritingCategoryLabel(category, t, t('common.noData'))}
                    </span>
                )}

                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {docsCount}
                </span>

                {isEditing ? (
                    <>
                        <button
                            onClick={onSaveEdit}
                            className="rounded-md p-1.5 text-emerald-500 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            title={t('common.confirm', '确认')}
                        >
                            <Check size={15} />
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            title={t('common.cancel', '取消')}
                        >
                            <X size={15} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onStartEdit(category)}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                            title={t('common.edit', '编辑')}
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => onCycleColor(category)}
                            disabled={isDefault}
                            className={`rounded-md p-1.5 transition ${isDefault
                                ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                                : 'text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-400'
                                }`}
                            title={isDefault
                                ? t('writing.categoryColorFixed', '默认分类颜色固定')
                                : t('writing.categoryColorChange', '切换分类颜色')}
                        >
                            {isDefault ? <Lock size={14} /> : <Palette size={14} />}
                        </button>

                        {canDelete && (
                            <>
                                {isDeleteConfirming ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={onConfirmDelete}
                                            className="rounded-md p-1 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            title={t('common.confirm', '确认')}
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={onCancelDelete}
                                            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                            title={t('common.cancel', '取消')}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onRequestDelete(category.id)}
                                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
                                        title={t('common.delete', '删除')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {isDeleteConfirming && (
                <p className="mt-2 text-xs text-rose-500 dark:text-rose-300">
                    {t('writing.categoryDeleteMoveHint', '删除后，该分类文稿会自动迁移到其他分类。')}
                </p>
            )}
        </div>
    );
};

export default WritingCategoryManagerItem;
