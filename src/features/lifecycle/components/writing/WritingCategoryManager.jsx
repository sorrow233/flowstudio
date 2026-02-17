import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Check, Edit2 } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const COLOR_PRESETS = [
    { id: 'stone', color: 'bg-stone-400', dotColor: 'bg-stone-400', textColor: 'text-stone-400' },
    { id: 'blue', color: 'bg-blue-400', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
    { id: 'amber', color: 'bg-amber-400', dotColor: 'bg-amber-400', textColor: 'text-amber-400' },
    { id: 'emerald', color: 'bg-emerald-400', dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { id: 'rose', color: 'bg-rose-400', dotColor: 'bg-rose-400', textColor: 'text-rose-400' },
    { id: 'violet', color: 'bg-violet-400', dotColor: 'bg-violet-400', textColor: 'text-violet-400' },
    { id: 'cyan', color: 'bg-cyan-400', dotColor: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { id: 'orange', color: 'bg-orange-400', dotColor: 'bg-orange-400', textColor: 'text-orange-400' },
    { id: 'teal', color: 'bg-teal-400', dotColor: 'bg-teal-400', textColor: 'text-teal-400' },
    { id: 'indigo', color: 'bg-indigo-400', dotColor: 'bg-indigo-400', textColor: 'text-indigo-400' },
];

const MAX_CATEGORIES = 10;

const WritingCategoryManager = ({ isOpen, onClose, categories, onAdd, onUpdate, onRemove }) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const usedColorSet = useMemo(() => new Set(categories.map((cat) => cat.color)), [categories]);

    const normalizedCategories = categories.map((cat) => {
        const preset = COLOR_PRESETS.find((p) => p.color === cat.color || p.dotColor === cat.dotColor);
        return preset ? { ...cat, ...preset } : cat;
    });

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditLabel(resolveWritingCategoryLabel(category, t, t('common.noData')));
        setDeleteConfirmId(null);
    };

    const saveEdit = () => {
        const label = editLabel.trim();
        if (!editingId || !label) return;
        onUpdate(editingId, { label });
        setEditingId(null);
    };

    const handleAdd = () => {
        const label = newLabel.trim();
        if (!label || categories.length >= MAX_CATEGORIES) return;
        const unusedPreset = COLOR_PRESETS.find((preset) => !usedColorSet.has(preset.color));
        const fallbackPreset = COLOR_PRESETS[categories.length % COLOR_PRESETS.length];
        onAdd({ label, ...(unusedPreset || fallbackPreset) });
        setIsAdding(false);
        setNewLabel('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-sky-100 px-4 py-3 dark:border-slate-800">
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{t('writing.manageCategories', '管理写作分类')}</h3>
                            <button
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-sky-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-4">
                            <div className="space-y-2.5">
                                {normalizedCategories.map((category) => (
                                    <div key={category.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
                                        {editingId === category.id ? (
                                            <>
                                                <span className={`h-2.5 w-2.5 rounded-full ${category.dotColor}`} />
                                                <input
                                                    autoFocus
                                                    value={editLabel}
                                                    onChange={(event) => setEditLabel(event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') saveEdit();
                                                        if (event.key === 'Escape') setEditingId(null);
                                                    }}
                                                    className="min-w-0 flex-1 rounded-md border border-sky-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                />
                                                <button onClick={saveEdit} className="rounded p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                                    <Check size={15} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <X size={15} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className={`h-2.5 w-2.5 rounded-full ${category.dotColor}`} />
                                                <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{resolveWritingCategoryLabel(category, t, t('common.noData'))}</span>
                                                <button
                                                    onClick={() => startEdit(category)}
                                                    className="rounded p-1.5 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {categories.length > 1 && (
                                                    <>
                                                        {deleteConfirmId === category.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        onRemove(category.id);
                                                                        setDeleteConfirmId(null);
                                                                    }}
                                                                    className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                                    title={t('common.confirm')}
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirmId(null)}
                                                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    title={t('common.cancel')}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirmId(category.id)}
                                                                className="rounded p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
                                                                title={t('common.delete')}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t border-sky-100 pt-4 dark:border-slate-800">
                                {isAdding ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                                        <input
                                            autoFocus
                                            placeholder={t('writing.categoryNamePlaceholder', '输入分类名称')}
                                            value={newLabel}
                                            onChange={(event) => setNewLabel(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') handleAdd();
                                                if (event.key === 'Escape') setIsAdding(false);
                                            }}
                                            className="min-w-0 flex-1 rounded-md border border-sky-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        />
                                        <button onClick={handleAdd} className="rounded p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                            <Check size={15} />
                                        </button>
                                        <button onClick={() => setIsAdding(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : categories.length < MAX_CATEGORIES ? (
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 py-2.5 text-sm text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700 dark:hover:text-sky-400"
                                    >
                                        <Plus size={15} />
                                        {t('writing.addCategoryLimit10', '添加分类（最多10个）')}
                                    </button>
                                ) : (
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">{t('writing.categoryLimitReached', '已达到分类上限（10）')}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WritingCategoryManager;
