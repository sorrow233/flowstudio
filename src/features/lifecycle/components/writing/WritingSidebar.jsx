import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { FileText, RotateCcw, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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

const WritingSidebarItem = ({ doc, isActive, onSelect, onUpdate, onDelete, onRestore, onEnterImmersive, isTrashView, isMobile, t }) => {
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
        if (!isRenaming) onSelect(doc.id);
    };

    const handleEnterImmersive = () => {
        if (isRenaming || isTrashView) return;
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
        if (isTrashView) return;
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
            <div
                role="button"
                tabIndex={0}
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
                    isActive
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
                                    if (isTrashView) return;
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
                        {isActive && (
                            <span className="text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80">
                                {formatDocTime(doc.lastModified || doc.timestamp)}
                            </span>
                        )}
                        {isTrashView && (
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
    isMobile = false
}) => {
    const { t } = useTranslation();
    const isTrashView = viewMode === 'trash';

    const groupedDocs = useMemo(() => {
        const groups = { today: [], yesterday: [], week: [], older: [] };
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        documents.forEach((doc) => {
            const timestamp = doc.lastModified || doc.timestamp || Date.now();
            if (timestamp >= todayStart) groups.today.push(doc);
            else if (timestamp >= yesterdayStart) groups.yesterday.push(doc);
            else if (timestamp >= weekStart) groups.week.push(doc);
            else groups.older.push(doc);
        });

        return groups;
    }, [documents]);

    const renderGroup = (titleKey, docsInGroup) => {
        if (docsInGroup.length === 0) return null;

        return (
            <section className="mb-6">
                <h3 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-sky-500/60">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h3>

                <div className="space-y-2.5">
                    {docsInGroup.map((doc) => (
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
                            t={t}
                        />
                    ))}
                </div>
            </section>
        );
    };

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
                    <AnimatePresence mode="popLayout" initial={false}>
                        {renderGroup('today', groupedDocs.today)}
                        {renderGroup('yesterday', groupedDocs.yesterday)}
                        {renderGroup('week', groupedDocs.week)}
                        {renderGroup('older', groupedDocs.older)}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default WritingSidebar;
