import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import {
    MAX_WRITING_CATEGORIES,
    WRITING_CATEGORY_COLORS,
    findWritingCategoryPreset,
    getDefaultWritingCategoryLabel,
    isDefaultWritingCategoryId,
    pickWritingCategoryStyle,
    resolveWritingCategoryLabel,
} from './writingCategoryUtils';
import {
    CATEGORY_LABEL_MAX_LENGTH,
    getCategoryDocsCount,
    getNextWritingColorPreset,
    getSuggestedWritingColorPreset,
    getTotalCategoryDocs,
    isWritingCategoryLabelDuplicate,
    normalizeWritingCategoryLabel,
} from './writingCategoryManagerUtils';
import WritingCategoryManagerItem from './WritingCategoryManagerItem';
import WritingCategoryAddPanel from './WritingCategoryAddPanel';

const INPUT_MAX_LENGTH = CATEGORY_LABEL_MAX_LENGTH + 10;

const WritingCategoryManager = ({
    isOpen,
    onClose,
    categories,
    onAdd,
    onUpdate,
    onRemove,
    categoryDocCountMap = {},
}) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newPresetId, setNewPresetId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const normalizedCategories = useMemo(() => (
        categories.map((category) => {
            const preset = findWritingCategoryPreset(category);
            return preset ? { ...category, ...pickWritingCategoryStyle(preset) } : category;
        })
    ), [categories]);

    const visibleCategoryLabels = useMemo(() => (
        normalizedCategories.map((category) => ({
            id: category.id,
            label: resolveWritingCategoryLabel(category, t, getDefaultWritingCategoryLabel(category.id)),
        }))
    ), [normalizedCategories, t]);

    const usedPresetIds = useMemo(() => {
        const ids = new Set();
        normalizedCategories.forEach((category) => {
            const preset = findWritingCategoryPreset(category);
            if (preset?.id) ids.add(preset.id);
        });
        return ids;
    }, [normalizedCategories]);

    const totalDocs = useMemo(() => getTotalCategoryDocs(categoryDocCountMap), [categoryDocCountMap]);

    useEffect(() => {
        if (!isOpen) return;

        const suggestedPreset = getSuggestedWritingColorPreset(categories);
        setEditingId(null);
        setEditLabel('');
        setIsAdding(false);
        setNewLabel('');
        setNewPresetId(suggestedPreset?.id || WRITING_CATEGORY_COLORS[0]?.id || null);
        setDeleteConfirmId(null);
        setErrorMessage('');
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;

            if (deleteConfirmId) {
                setDeleteConfirmId(null);
                return;
            }

            if (editingId) {
                setEditingId(null);
                setErrorMessage('');
                return;
            }

            if (isAdding) {
                setIsAdding(false);
                setNewLabel('');
                setErrorMessage('');
                return;
            }

            onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteConfirmId, editingId, isAdding, isOpen, onClose]);

    const validateLabel = (rawLabel, currentCategoryId = null) => {
        const label = normalizeWritingCategoryLabel(rawLabel);

        if (!label) {
            return {
                label,
                error: t('writing.categoryNameRequired', '请输入分类名称'),
            };
        }

        if (label.length > CATEGORY_LABEL_MAX_LENGTH) {
            return {
                label,
                error: t('writing.categoryNameTooLong', `分类名称最多 ${CATEGORY_LABEL_MAX_LENGTH} 个字符`),
            };
        }

        if (isWritingCategoryLabelDuplicate(visibleCategoryLabels, label, currentCategoryId)) {
            return {
                label,
                error: t('writing.categoryNameDuplicate', '分类名称已存在，请换一个名称'),
            };
        }

        return {
            label,
            error: '',
        };
    };

    const clearFeedback = () => {
        if (errorMessage) setErrorMessage('');
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditLabel(resolveWritingCategoryLabel(category, t, t('common.noData')));
        setDeleteConfirmId(null);
        setIsAdding(false);
        clearFeedback();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditLabel('');
        clearFeedback();
    };

    const saveEdit = () => {
        const { label, error } = validateLabel(editLabel, editingId);
        if (error) {
            setErrorMessage(error);
            return;
        }

        if (!editingId) return;

        onUpdate(editingId, { label });
        setEditingId(null);
        setEditLabel('');
        clearFeedback();
    };

    const openAddPanel = () => {
        const suggestedPreset = getSuggestedWritingColorPreset(normalizedCategories);
        setIsAdding(true);
        setEditingId(null);
        setDeleteConfirmId(null);
        setNewLabel('');
        setNewPresetId(suggestedPreset?.id || WRITING_CATEGORY_COLORS[0]?.id || null);
        clearFeedback();
    };

    const cancelAddPanel = () => {
        setIsAdding(false);
        setNewLabel('');
        clearFeedback();
    };

    const handleAdd = () => {
        const { label, error } = validateLabel(newLabel);
        if (error) {
            setErrorMessage(error);
            return;
        }

        const preset = WRITING_CATEGORY_COLORS.find((item) => item.id === newPresetId)
            || getSuggestedWritingColorPreset(normalizedCategories)
            || WRITING_CATEGORY_COLORS[0];

        onAdd({ label, ...pickWritingCategoryStyle(preset) });
        setIsAdding(false);
        setNewLabel('');
        clearFeedback();
    };

    const handleCycleColor = (category) => {
        if (!category || isDefaultWritingCategoryId(category.id)) return;

        const nextPreset = getNextWritingColorPreset(category);
        if (!nextPreset) return;

        onUpdate(category.id, pickWritingCategoryStyle(nextPreset));
        clearFeedback();
    };

    const requestDelete = (categoryId) => {
        setDeleteConfirmId(categoryId);
        setEditingId(null);
        setIsAdding(false);
        clearFeedback();
    };

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-sky-100/80 bg-white shadow-[0_40px_90px_-35px_rgba(15,23,42,0.85)] dark:border-slate-800 dark:bg-slate-900"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-sky-100 px-5 pb-4 pt-5 dark:border-slate-800">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                        {t('writing.manageCategories', '管理写作分类')}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {`${t('writing.categoryCountLabel', '分类')} ${categories.length}/${MAX_WRITING_CATEGORIES} · ${t('writing.documents', '文档')} ${totalDocs}`}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                    title={t('common.close', '关闭')}
                                    aria-label={t('common.close', '关闭')}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[72vh] overflow-y-auto px-5 pb-5 pt-4">
                            <div className="space-y-2.5">
                                {normalizedCategories.map((category) => (
                                    <WritingCategoryManagerItem
                                        key={category.id}
                                        category={category}
                                        docsCount={getCategoryDocsCount(category.id, categoryDocCountMap)}
                                        isEditing={editingId === category.id}
                                        isDeleteConfirming={deleteConfirmId === category.id}
                                        editLabel={editLabel}
                                        maxInputLength={INPUT_MAX_LENGTH}
                                        canDelete={categories.length > 1}
                                        onEditLabelChange={(value) => {
                                            setEditLabel(value);
                                            clearFeedback();
                                        }}
                                        onEditKeyDown={(event) => {
                                            if (event.key === 'Enter') saveEdit();
                                            if (event.key === 'Escape') cancelEdit();
                                        }}
                                        onSaveEdit={saveEdit}
                                        onCancelEdit={cancelEdit}
                                        onStartEdit={startEdit}
                                        onCycleColor={handleCycleColor}
                                        onRequestDelete={requestDelete}
                                        onConfirmDelete={() => {
                                            onRemove(category.id);
                                            setDeleteConfirmId(null);
                                            clearFeedback();
                                        }}
                                        onCancelDelete={() => setDeleteConfirmId(null)}
                                        t={t}
                                    />
                                ))}
                            </div>

                            {errorMessage && (
                                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="mt-4 border-t border-sky-100 pt-4 dark:border-slate-800">
                                <WritingCategoryAddPanel
                                    isAdding={isAdding}
                                    categoriesCount={categories.length}
                                    newLabel={newLabel}
                                    newPresetId={newPresetId}
                                    usedPresetIds={usedPresetIds}
                                    maxInputLength={INPUT_MAX_LENGTH}
                                    onOpenAdd={openAddPanel}
                                    onConfirmAdd={handleAdd}
                                    onCancelAdd={cancelAddPanel}
                                    onNewLabelChange={(value) => {
                                        setNewLabel(value);
                                        clearFeedback();
                                    }}
                                    onNewLabelKeyDown={(event) => {
                                        if (event.key === 'Enter') handleAdd();
                                        if (event.key === 'Escape') cancelAddPanel();
                                    }}
                                    onPresetSelect={setNewPresetId}
                                    t={t}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default WritingCategoryManager;
