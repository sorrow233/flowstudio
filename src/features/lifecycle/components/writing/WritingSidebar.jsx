import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Trash2, FileText } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import { stripMarkup } from './editorUtils';
import { resolveWritingCategoryLabel } from './writingCategoryUtils';

const formatDocTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const WritingSidebarItem = ({ doc, isActive, onSelect, onUpdate, categories, defaultCategoryId, t }) => {
    const category = categories.find((item) => item.id === (doc.category || defaultCategoryId)) || categories[0];
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(doc.title || '');
    const inputRef = useRef(null);

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
        if (editTitle.trim() !== (doc.title || '')) {
            onUpdate?.(doc.id, { title: editTitle.trim() || t('inspiration.untitled') });
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

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <div
                role="button"
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelect();
                    }
                }}
                className={[
                    'cursor-pointer rounded-2xl border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70',
                    isActive
                        ? 'border-sky-200 bg-sky-50 shadow-[0_14px_34px_-24px_rgba(59,130,246,0.6)] dark:border-sky-800 dark:bg-slate-900 dark:shadow-none'
                        : 'border-sky-100/80 bg-white/86 hover:border-sky-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                ].join(' ')}
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {isRenaming ? (
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
                                    event.stopPropagation();
                                    setIsRenaming(true);
                                }}
                                className="line-clamp-1 select-none text-sm font-medium text-slate-800 dark:text-slate-200"
                                title={t('common.doubleClickToRename', 'Double click to rename')}
                            >
                                {doc.title || t('inspiration.untitled')}
                            </span>
                        )}
                    </div>
                    <span className="ml-2 shrink-0 text-[10px] font-medium tracking-wide text-sky-500/80 dark:text-sky-400/80">
                        {formatDocTime(doc.lastModified || doc.timestamp)}
                    </span>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {stripMarkup(doc.content || '') || t('inspiration.placeholder')}
                </p>

                <div className="mt-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-600 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${category?.dotColor || 'bg-sky-400'}`} />
                        {resolveWritingCategoryLabel(category, t, t('common.noData'))}
                    </span>
                </div>
            </div>
        </div>
    );
};

const WritingSidebar = ({
    documents = [],
    categories = [],
    activeDocId,
    onSelectDoc,
    onCreate,
    onUpdate,
    onDelete,
    onRestore,
    allDocumentsCount = 0,
    isMobile = false
}) => {
    const { t } = useTranslation();
    const defaultCategoryId = categories[0]?.id || null;

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

    const handleDelete = (doc) => {
        onDelete(doc.id);
        toast.info(t('inspiration.ideaDeleted'), {
            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
            action: {
                label: t('common.undo'),
                onClick: () => {
                    if (onRestore) {
                        onRestore(doc);
                        return;
                    }
                    onCreate(doc);
                }
            },
            duration: 4000
        });
    };

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
                            categories={categories}
                            defaultCategoryId={defaultCategoryId}
                            isActive={activeDocId === doc.id}
                            onSelect={onSelectDoc}
                            onUpdate={onUpdate}
                            t={t}
                        />
                    ))}
                </div>
            </section>
        );
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
                            {allDocumentsCount === 0 ? t('inspiration.noDocs') : t('common.noData')}
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
