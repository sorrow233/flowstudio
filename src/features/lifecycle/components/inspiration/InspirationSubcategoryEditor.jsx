import React, { useMemo, useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import {
    createInspirationSubcategory,
    INSPIRATION_SUBCATEGORY_LABEL_MAX_LENGTH,
    isInspirationSubcategoryDuplicate,
    MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY,
    normalizeInspirationSubcategories,
    normalizeInspirationSubcategoryLabel,
} from './inspirationSubcategoryUtils';

const INPUT_MAX_LENGTH = INSPIRATION_SUBCATEGORY_LABEL_MAX_LENGTH + 10;

const InspirationSubcategoryEditor = ({ category, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const subcategories = useMemo(
        () => normalizeInspirationSubcategories(category?.subcategories),
        [category?.subcategories]
    );

    const updateSubcategories = (nextSubcategories) => {
        onUpdate?.(category.id, {
            subcategories: normalizeInspirationSubcategories(nextSubcategories),
        });
    };

    const validateLabel = (rawLabel, currentId = null) => {
        const label = normalizeInspirationSubcategoryLabel(rawLabel);
        if (!label) return { label, error: '请输入子分类名称' };
        if (label.length > INSPIRATION_SUBCATEGORY_LABEL_MAX_LENGTH) {
            return {
                label,
                error: `子分类名称最多 ${INSPIRATION_SUBCATEGORY_LABEL_MAX_LENGTH} 个字符`,
            };
        }
        if (isInspirationSubcategoryDuplicate(subcategories, label, currentId)) {
            return { label, error: '子分类名称已存在' };
        }
        return { label, error: '' };
    };

    const handleAdd = () => {
        if (subcategories.length >= MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY) return;

        const { label, error } = validateLabel(newLabel);
        if (error) {
            setErrorMessage(error);
            return;
        }

        updateSubcategories([...subcategories, createInspirationSubcategory(label)]);
        setNewLabel('');
        setIsAdding(false);
        setErrorMessage('');
    };

    const startEdit = (subcategory) => {
        setEditingId(subcategory.id);
        setEditLabel(subcategory.label);
        setDeleteConfirmId(null);
        setIsAdding(false);
        setErrorMessage('');
    };

    const saveEdit = () => {
        const { label, error } = validateLabel(editLabel, editingId);
        if (error) {
            setErrorMessage(error);
            return;
        }

        updateSubcategories(
            subcategories.map((subcategory) => (
                subcategory.id === editingId ? { ...subcategory, label } : subcategory
            ))
        );
        setEditingId(null);
        setEditLabel('');
        setErrorMessage('');
    };

    const removeSubcategory = (subcategoryId) => {
        updateSubcategories(subcategories.filter((subcategory) => subcategory.id !== subcategoryId));
        setDeleteConfirmId(null);
        if (editingId === subcategoryId) {
            setEditingId(null);
            setEditLabel('');
        }
    };

    return (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 dark:border-gray-800">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
                    子分类 {subcategories.length}/{MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY}
                </span>
                {!isAdding && subcategories.length < MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(true);
                            setDeleteConfirmId(null);
                            setEditingId(null);
                            setErrorMessage('');
                        }}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-gray-500 transition hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                    >
                        <Plus size={12} />
                        添加子分类
                    </button>
                )}
            </div>

            {subcategories.length === 0 && !isAdding && (
                <p className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
                    还没有子分类，添加后当前大分类下会出现独立筛选。
                </p>
            )}

            <div className="space-y-2">
                {subcategories.map((subcategory) => (
                    <div
                        key={subcategory.id}
                        className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
                    >
                        {editingId === subcategory.id ? (
                            <>
                                <input
                                    autoFocus
                                    value={editLabel}
                                    maxLength={INPUT_MAX_LENGTH}
                                    onChange={(event) => setEditLabel(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') saveEdit();
                                        if (event.key === 'Escape') setEditingId(null);
                                    }}
                                    className="min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="rounded-md p-1 text-emerald-500 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    title="保存"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="取消"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${category?.dotColor || 'bg-gray-300'}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {subcategory.label}
                                </span>
                                {deleteConfirmId === subcategory.id ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[11px] font-medium text-red-500">删除?</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSubcategory(subcategory.id)}
                                            className="rounded-md p-1 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="确认删除"
                                        >
                                            <Check size={13} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                            title="取消"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(subcategory)}
                                            className="rounded-md p-1 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                                            title="编辑子分类"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(subcategory.id)}
                                            className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                            title="删除子分类"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {isAdding && (
                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-2.5 py-2 dark:border-blue-900/40 dark:bg-blue-900/15">
                        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${category?.dotColor || 'bg-blue-400'}`} />
                        <input
                            autoFocus
                            value={newLabel}
                            maxLength={INPUT_MAX_LENGTH}
                            onChange={(event) => setNewLabel(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleAdd();
                                if (event.key === 'Escape') setIsAdding(false);
                            }}
                            placeholder="子分类名称..."
                            className="min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="rounded-md p-1 text-blue-500 transition hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            title="添加"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                setNewLabel('');
                                setErrorMessage('');
                            }}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="取消"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {errorMessage && (
                <p className="mt-2 text-xs text-red-500 dark:text-red-400">{errorMessage}</p>
            )}
        </div>
    );
};

export default InspirationSubcategoryEditor;
