import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { FileText, RotateCcw, Trash2, X } from 'lucide-react';
import { AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import { stripMarkup } from './editorUtils';
import { getTrashRemainingDays, TRASH_RETENTION_DAYS } from './writingTrashUtils';

const formatDocTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const LONG_PRESS_DELETE_MS = 650;

const WritingSidebarItem = ({
    doc,
    isActive,
    onSelect,
    onUpdate,
    onDelete,
    onRestore,
    onEnterImmersive,
    isTrashView,
    isMobile,
    allowLongPressDelete = true,
    isSelectionMode = false,
    isSelected = false,
    onToggleSelect,
    t
}) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(doc.title || '');
    const inputRef = useRef(null);
    const longPressTimerRef = useRef(null);
    const untitledLabel = t('inspiration.untitled');
    const trimmedTitle = (doc.title || '').trim();
    const isUntitledDoc = !trimmedTitle || trimmedTitle === untitledLabel;
    const displayTitle = isUntitledDoc ? untitledLabel : trimmedTitle;

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        if (!isRenaming) {
            setEditTitle(doc.title || '');
        }
    }, [doc.title, isRenaming]);

    const handleRename = () => {
        if (isTrashView) {
            setIsRenaming(false);
            return;
        }
        const nextTitle = editTitle.trim();
        const currentTitle = (doc.title || '').trim();
        if (nextTitle !== currentTitle) {
            onUpdate?.(doc.id, { title: nextTitle });
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleRename();
        } else if (event.key === 'Escape') {
            setEditTitle(doc.title || '');
            setIsRenaming(false);
        }
    };

    const handleSelect = () => {
        if (isSelectionMode) {
            onToggleSelect?.(doc.id);
            return;
        }
        if (!isRenaming) onSelect(doc.id);
    };

    const handleEnterImmersive = () => {
        if (isRenaming || isTrashView || isSelectionMode) return;
        onSelect(doc.id);
        onEnterImmersive?.(doc.id);
    };

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearLongPressTimer, [clearLongPressTimer]);

    const handleDelete = useCallback((event) => {
        event?.stopPropagation();
        clearLongPressTimer();
        onDelete?.(doc);
    }, [clearLongPressTimer, doc, onDelete]);

    const handleRestore = useCallback((event) => {
        event?.stopPropagation();
        clearLongPressTimer();
        onRestore?.(doc.id);
    }, [clearLongPressTimer, doc.id, onRestore]);

    const handlePointerDown = (event) => {
        if (!allowLongPressDelete) return;
        if (isTrashView) return;
        if (isSelectionMode) return;
        if (!isMobile || isRenaming) return;
        if (event.pointerType && event.pointerType !== 'touch') return;
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            onDelete?.(doc);
            longPressTimerRef.current = null;
        }, LONG_PRESS_DELETE_MS);
    };

    const remainingDays = useMemo(() => getTrashRemainingDays(doc), [doc]);

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {isSelectionMode && isSelected && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-3 left-1 z-10 w-1 rounded-full bg-sky-400/85 dark:bg-sky-500/85"
                />
            )}
            <div
                role="button"
                tabIndex={0}
                aria-pressed={isSelectionMode ? isSelected : isActive}
                onClick={handleSelect}
                onDoubleClick={handleEnterImmersive}
                onPointerDown={handlePointerDown}
                onPointerUp={clearLongPressTimer}
                onPointerLeave={clearLongPressTimer}
                onPointerCancel={clearLongPressTimer}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelect();
                    }
                }}
                className={[
                    `cursor-pointer rounded-2xl border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${isUntitledDoc ? 'min-h-[126px]' : 'min-h-[106px]'}`,
                    isSelectionMode && isSelected
                        ? 'border-sky-200/75 bg-sky-50/65 dark:border-sky-700/70 dark:bg-slate-800/82'
                        : isActive
                        ? 'border-sky-200 bg-sky-50 shadow-[0_14px_34px_-24px_rgba(59,130,246,0.6)] dark:border-sky-800 dark:bg-slate-900 dark:shadow-none'
                        : 'border-sky-100/80 bg-white/86 hover:border-sky-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                ].join(' ')}
            >
                <div className={`${isUntitledDoc ? 'mb-1.5' : 'mb-2'} flex items-center justify-between gap-2`}>
                    <div className="min-w-0 flex-1">
                        {isRenaming && !isTrashView ? (
                            <input
                                ref={inputRef}
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                onBlur={handleRename}
                                onKeyDown={handleKeyDown}
                                onClick={(event) => event.stopPropagation()}
                                className="w-full border-b border-sky-300 bg-transparent pb-0.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:border-sky-600 dark:text-slate-200"
                                placeholder={t('inspiration.untitled')}
                            />
                        ) : (
                            <span
                                onDoubleClick={(event) => {
                                    if (isTrashView || isSelectionMode) return;
                                    event.stopPropagation();
                                    setIsRenaming(true);
                                }}
                                className={[
                                    'line-clamp-1 select-none transition-colors',
                                    isUntitledDoc
                                        ? 'text-[11px] font-normal italic text-slate-400 dark:text-slate-500'
                                        : 'text-sm font-medium text-slate-800 dark:text-slate-200'
                                ].join(' ')}
                                title={t('common.doubleClickToRename', 'Double click to rename')}
                            >
                                {displayTitle}
                            </span>
                        )}
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1.5">
                        {isActive && !isSelectionMode && (
                            <span className="text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80">
                                {formatDocTime(doc.lastModified || doc.timestamp)}
                            </span>
                        )}
                        {!isSelectionMode && isTrashView && (
                            <button
                                type="button"
                                onPointerDown={(event) => event.stopPropagation()}
                                onDoubleClick={(event) => event.stopPropagation()}
                                onClick={handleRestore}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-500 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                                title={t('writing.actions.restore', '恢复')}
                                aria-label={t('writing.actions.restore', '恢复')}
                            >
                                <RotateCcw size={13} />
                            </button>
                        )}
                        {!isSelectionMode && (
                            <button
                                type="button"
                                onPointerDown={(event) => event.stopPropagation()}
                                onDoubleClick={(event) => event.stopPropagation()}
                                onClick={handleDelete}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                                title={isTrashView ? t('writing.deletePermanent', '永久删除') : t('common.delete', '删除')}
                                aria-label={isTrashView ? t('writing.deletePermanent', '永久删除') : t('common.delete', '删除')}
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <p className={`${isUntitledDoc ? 'line-clamp-3' : 'line-clamp-2'} text-xs leading-relaxed text-slate-500 dark:text-slate-400`}>
                    {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                </p>
                {isTrashView && (
                    <p className="mt-2 text-[11px] font-medium text-amber-500/90 dark:text-amber-400/90">
                        {t('writing.trashExpireHint', `回收站保留 ${TRASH_RETENTION_DAYS} 天`)} · {remainingDays} {t('writing.daysRemaining', '天后过期')}
                    </p>
                )}
            </div>
        </div>
    );
};

const WritingSidebar = ({
    documents = [],
    activeDocId,
    onSelectDoc,
    onEnterImmersive,
    onCreate,
    onUpdate,
    onDelete,
    onRestore,
    allDocumentsCount = 0,
    viewMode = 'active',
    isMobile = false,
    categories = [],
    selectedCategory = null,
    onBulkMoveCategory,
    onReorderDocuments,
    canReorder = false,
    isSelectionMode = false,
    onSelectionModeChange,
}) => {
    const { t } = useTranslation();
    const isTrashView = viewMode === 'trash';
    const [selectedDocIds, setSelectedDocIds] = useState([]);
    const [moveTargetCategory, setMoveTargetCategory] = useState('');
    const [orderedDocIds, setOrderedDocIds] = useState(() => documents.map((docItem) => docItem.id));
    const [hasPendingReorder, setHasPendingReorder] = useState(false);
    const pendingOrderedDocIdsRef = useRef([]);

    const documentsById = useMemo(
        () => new Map(documents.map((docItem) => [docItem.id, docItem])),
        [documents]
    );
    const selectableCategories = useMemo(
        () => categories.filter((category) => category?.id && category.id !== selectedCategory),
        [categories, selectedCategory]
    );
    const hasMoveTarget = selectableCategories.length > 0;
    const selectedCount = selectedDocIds.length;
    const allSelected = documents.length > 0 && selectedCount === documents.length;
    const canBulkMove = isSelectionMode && selectedCount > 0 && hasMoveTarget && Boolean(moveTargetCategory) && !isTrashView;
    const isReorderEnabled = canReorder && !isTrashView && !isSelectionMode && documents.length > 1;
    const orderedDocuments = useMemo(() => {
        if (orderedDocIds.length === 0) return documents;

        const reordered = orderedDocIds
            .map((id) => documentsById.get(id))
            .filter(Boolean);
        if (reordered.length === documents.length) return reordered;

        const missingItems = documents.filter((docItem) => !orderedDocIds.includes(docItem.id));
        return [...reordered, ...missingItems];
    }, [documents, documentsById, orderedDocIds]);

    useEffect(() => {
        setOrderedDocIds(documents.map((docItem) => docItem.id));
        pendingOrderedDocIdsRef.current = [];
        setHasPendingReorder(false);
    }, [documents]);

    useEffect(() => {
        if (isTrashView && isSelectionMode) {
            onSelectionModeChange?.(false);
        }
    }, [isSelectionMode, isTrashView, onSelectionModeChange]);

    useEffect(() => {
        if (!isSelectionMode) {
            setSelectedDocIds([]);
            return;
        }

        const visibleSet = new Set(documents.map((docItem) => docItem.id));
        setSelectedDocIds((prev) => prev.filter((id) => visibleSet.has(id)));
    }, [documents, isSelectionMode]);

    useEffect(() => {
        if (!isSelectionMode || isTrashView) {
            setMoveTargetCategory('');
            return;
        }

        if (!hasMoveTarget) {
            setMoveTargetCategory('');
            return;
        }

        if (!selectableCategories.some((item) => item.id === moveTargetCategory)) {
            setMoveTargetCategory(selectableCategories[0]?.id || '');
        }
    }, [hasMoveTarget, isSelectionMode, isTrashView, moveTargetCategory, selectableCategories]);

    useEffect(() => {
        if (isReorderEnabled) return;
        setHasPendingReorder(false);
    }, [isReorderEnabled]);

    const toggleDocSelection = useCallback((docId) => {
        setSelectedDocIds((prev) => (
            prev.includes(docId)
                ? prev.filter((item) => item !== docId)
                : [...prev, docId]
        ));
    }, []);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedDocIds([]);
            return;
        }
        setSelectedDocIds(documents.map((docItem) => docItem.id));
    };

    const handleBulkMove = () => {
        if (!canBulkMove) return;

        onBulkMoveCategory?.(selectedDocIds, moveTargetCategory);
        const targetLabel = categories.find((category) => category.id === moveTargetCategory)?.label
            || t('writing.category', '分类');
        toast.success(`${t('writing.bulkMoveComplete', '已转移')} ${selectedCount} ${t('writing.documents', '文档')} · ${targetLabel}`);
        setSelectedDocIds([]);
    };

    const handleReorder = (nextOrder) => {
        setOrderedDocIds(nextOrder);
        pendingOrderedDocIdsRef.current = nextOrder;
        setHasPendingReorder(true);
    };

    const persistReorder = useCallback(() => {
        if (!hasPendingReorder || !isReorderEnabled || !onReorderDocuments) return;

        const sourceIds = pendingOrderedDocIdsRef.current.length > 0
            ? pendingOrderedDocIdsRef.current
            : orderedDocIds;
        const reorderedDocs = sourceIds
            .map((id) => documentsById.get(id))
            .filter(Boolean);
        if (reorderedDocs.length === 0) return;

        onReorderDocuments(reorderedDocs);
        pendingOrderedDocIdsRef.current = [];
        setHasPendingReorder(false);
    }, [documentsById, hasPendingReorder, isReorderEnabled, onReorderDocuments, orderedDocIds]);

    const renderSidebarItem = (doc) => (
        <WritingSidebarItem
            key={doc.id}
            doc={doc}
            isActive={activeDocId === doc.id}
            onSelect={onSelectDoc}
            onEnterImmersive={onEnterImmersive}
            onUpdate={onUpdate}
            onDelete={handleDelete}
            onRestore={onRestore}
            isTrashView={isTrashView}
            isMobile={isMobile}
            allowLongPressDelete={!isReorderEnabled}
            isSelectionMode={isSelectionMode}
            isSelected={selectedDocIds.includes(doc.id)}
            onToggleSelect={toggleDocSelection}
            t={t}
        />
    );

    const handleDelete = (doc) => {
        onDelete?.(doc.id);
        if (isTrashView) {
            toast.info(t('writing.docDeletedPermanent', '已永久删除'), {
                icon: <Trash2 className="h-4 w-4 text-rose-500" />,
                duration: 3000
            });
            return;
        }

        toast.info(t('writing.docMovedToTrash', '已移入回收站'), {
            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
            action: {
                label: t('writing.actions.restore', '恢复'),
                onClick: () => {
                    if (onRestore) {
                        onRestore(doc.id);
                        return;
                    }
                    onCreate?.(doc);
                }
            },
            duration: 4000
        });
    };

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-900">
            {!isTrashView && isSelectionMode && documents.length > 0 && (
                <div className="border-b border-sky-100/70 px-3 py-2.5 dark:border-slate-800/80">
                    <div className="mb-2 rounded-2xl border border-slate-200/65 bg-white/62 px-2.5 py-2 backdrop-blur-md shadow-[0_12px_24px_-20px_rgba(15,23,42,0.55)] dark:border-slate-700/60 dark:bg-slate-800/45">
                        <p className="text-[11px] font-semibold tracking-wide text-sky-600/85 dark:text-sky-400/85">
                            {t('writing.batchActions', '批量操作')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="inline-flex h-8 items-center rounded-full border border-slate-200/70 bg-white/72 px-2.5 text-xs font-medium text-slate-600 backdrop-blur-sm transition hover:border-sky-300/70 hover:text-sky-600 dark:border-slate-700/60 dark:bg-slate-800/52 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-sky-400"
                        >
                            {allSelected ? t('common.unselectAll', '取消全选') : t('common.selectAll', '全选')}
                        </button>
                        <select
                            value={moveTargetCategory}
                            onChange={(event) => setMoveTargetCategory(event.target.value)}
                            disabled={!hasMoveTarget}
                            className="h-8 min-w-[120px] rounded-full border border-slate-200/70 bg-white/72 px-2.5 text-xs text-slate-700 outline-none backdrop-blur-sm transition focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700/60 dark:bg-slate-800/52 dark:text-slate-200 dark:focus:border-sky-600"
                        >
                            {hasMoveTarget ? selectableCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.label}
                                </option>
                            )) : (
                                <option value="">{t('writing.noTargetCategory', '无可转移分区')}</option>
                            )}
                        </select>
                        <button
                            type="button"
                            onClick={handleBulkMove}
                            disabled={!canBulkMove}
                            className="inline-flex h-8 items-center rounded-full bg-sky-500 px-2.5 text-xs font-medium text-white transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-[0_10px_20px_-16px_rgba(14,165,233,0.7)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
                        >
                            {t('writing.moveToCategory', '转移分区')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelectionModeChange?.(false)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/72 text-slate-500 backdrop-blur-sm transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/52 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
                            aria-label={t('common.cancel', '取消')}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {isSelectionMode && (
                        <p className="mt-1.5 text-[11px] font-medium text-sky-600/90 dark:text-sky-400/90">
                            {`${t('common.selected', '已选择')} ${selectedCount} ${t('writing.documents', '文档')}`}
                        </p>
                    )}
                </div>
            )}
            <div
                className="custom-scrollbar touch-scroll flex-1 overflow-y-auto px-3 py-4"
                style={isMobile ? { paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' } : undefined}
            >
                {documents.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-sky-300">
                        <FileText size={34} strokeWidth={1.4} />
                        <p className="mt-3 text-xs text-slate-400">
                            {allDocumentsCount === 0
                                ? (isTrashView ? t('writing.emptyTrash', '回收站为空') : t('inspiration.noDocs'))
                                : t('common.noData')}
                        </p>
                    </div>
                ) : (
                    isReorderEnabled ? (
                        <Reorder.Group
                            axis="y"
                            values={orderedDocIds}
                            onReorder={handleReorder}
                            className="space-y-2.5"
                        >
                            {orderedDocuments.map((doc) => (
                                <Reorder.Item
                                    key={doc.id}
                                    value={doc.id}
                                    className="list-none"
                                    onDragEnd={persistReorder}
                                    whileDrag={{ scale: 1.01 }}
                                >
                                    {renderSidebarItem(doc)}
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    ) : (
                        <AnimatePresence mode="popLayout" initial={false}>
                            <div className="space-y-2.5">
                                {orderedDocuments.map((doc) => renderSidebarItem(doc))}
                            </div>
                        </AnimatePresence>
                    )
                )}
            </div>
        </div>
    );
};

export default WritingSidebar;
