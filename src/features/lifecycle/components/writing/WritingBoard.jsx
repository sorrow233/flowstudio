import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useSyncedCategories } from '../../../sync/hooks/useSyncedCategories';
import { useTranslation } from '../../../i18n';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';
import WritingDashboard from './WritingDashboard';
import WritingWorkspaceHeader from './WritingWorkspaceHeader';
import { stripMarkup } from './editorUtils';

const detectCompactLayout = () => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    const isCoarsePointer = typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;

    // iOS Safari 在“桌面网站”模式下可能给出较大宽度，这里优先按触控设备走紧凑布局。
    return width < 1024 || (isCoarsePointer && width < 1366);
};

const WritingBoard = ({ documents: externalDocuments, onCreate, onUpdate, onDelete, syncStatus, isMobile: externalIsMobile }) => {
    const isMobile = externalIsMobile !== undefined ? externalIsMobile : detectCompactLayout();
    const { doc, immediateSync, status } = useSync();
    const { t } = useTranslation();
    const {
        projects: allProjects,
        addProject,
        updateProject,
        removeProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'all_projects');
    const {
        categories: syncedCategories,
        addCategory: addCategoryBase,
        updateCategory: updateCategoryBase,
        removeCategory: removeCategoryBase,
    } = useSyncedCategories(doc, 'writing_categories', WRITING_CATEGORIES);

    const categories = useMemo(() => {
        const base = syncedCategories.length > 0 ? syncedCategories : WRITING_CATEGORIES;
        const map = new Map();
        base.forEach((category) => {
            if (!category?.id || map.has(category.id)) return;
            map.set(category.id, category);
        });
        return Array.from(map.values());
    }, [syncedCategories]);

    const internalDocuments = useMemo(() =>
        allProjects
            .filter((project) => project.stage === 'writing')
            .sort((a, b) => {
                const left = b.lastModified || b.timestamp || 0;
                const right = a.lastModified || a.timestamp || 0;
                return left - right;
            }),
        [allProjects]
    );

    const rawDocuments = externalDocuments ?? internalDocuments;
    const documents = useMemo(() =>
        [...rawDocuments].sort((a, b) => {
            const left = b.lastModified || b.timestamp || 0;
            const right = a.lastModified || a.timestamp || 0;
            return left - right;
        }),
        [rawDocuments]
    );

    const resolvedSyncStatus = syncStatus ?? status;

    const createHandler = onCreate ?? ((docToCreate) => {
        addProject(docToCreate);
        immediateSync?.();
    });

    const updateHandler = onUpdate ?? ((id, updates) => {
        updateProject(id, { ...updates, lastModified: Date.now() });
        immediateSync?.();
    });

    const deleteHandler = onDelete ?? ((id) => {
        removeProject(id);
        immediateSync?.();
    });

    const [selectedDocId, setSelectedDocId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobile);
    const [selectedCategory, setSelectedCategory] = useState(() => categories[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategory(null);
            return;
        }

        if (!categories.some((category) => category.id === selectedCategory)) {
            setSelectedCategory(categories[0].id);
        }
    }, [categories, selectedCategory]);

    const defaultCategoryId = categories[0]?.id || 'draft';

    const visibleDocuments = useMemo(() => {
        if (!selectedCategory) return [];

        let list = documents.filter((docItem) => (docItem.category || defaultCategoryId) === selectedCategory);

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter((docItem) =>
                (docItem.title || '').toLowerCase().includes(query)
                || stripMarkup(docItem.content || '').toLowerCase().includes(query)
            );
        }

        return list;
    }, [documents, selectedCategory, searchQuery, defaultCategoryId]);

    useEffect(() => {
        if (visibleDocuments.length === 0) {
            if (selectedDocId !== null) {
                setSelectedDocId(null);
            }
            return;
        }

        const hasSelected = selectedDocId && visibleDocuments.some((docItem) => docItem.id === selectedDocId);
        if (!hasSelected) {
            setSelectedDocId(visibleDocuments[0].id);
        }
    }, [visibleDocuments, selectedDocId]);

    const activeDoc = useMemo(() =>
        documents.find((docItem) => docItem.id === selectedDocId),
        [documents, selectedDocId]
    );
    const hasNoFilteredResults = documents.length > 0 && visibleDocuments.length === 0;

    const handleCreate = (input = null) => {
        if (input && typeof input === 'object') {
            if (input.id && documents.some((docItem) => docItem.id === input.id)) {
                setSelectedDocId(input.id);
                if (isMobile) setIsSidebarOpen(false);
                return;
            }

            const restoredDoc = {
                ...input,
                stage: input.stage || 'writing',
                lastModified: Date.now()
            };
            createHandler(restoredDoc);
            setSelectedDocId(restoredDoc.id);

            if (isMobile) setIsSidebarOpen(false);
            return;
        }

        const newDoc = {
            id: uuidv4(),
            title: t('inspiration.untitled'),
            content: '',
            stage: 'writing',
            category: input || selectedCategory || defaultCategoryId,
            timestamp: Date.now(),
            lastModified: Date.now()
        };

        createHandler(newDoc);
        setSelectedDocId(newDoc.id);
        setSearchQuery('');

        if (isMobile) setIsSidebarOpen(false);
    };

    const handleUpdate = (id, updates) => {
        updateHandler(id, { ...updates, lastModified: Date.now() });
    };

    const handleDelete = (id) => {
        const index = documents.findIndex((docItem) => docItem.id === id);
        deleteHandler(id);

        if (selectedDocId === id) {
            if (documents.length > 1) {
                const nextDoc = documents[index + 1] || documents[index - 1];
                setSelectedDocId(nextDoc?.id || null);
            } else {
                setSelectedDocId(null);
            }
        }
    };

    const handleAddCategory = (categoryInput) => {
        addCategoryBase(categoryInput);
        immediateSync?.();
    };

    const handleUpdateCategory = (id, updates) => {
        updateCategoryBase(id, updates);
        immediateSync?.();
    };

    const handleRemoveCategory = (id) => {
        if (categories.length <= 1) return;
        const fallback = categories.find((category) => category.id !== id);
        if (!fallback) return;

        documents
            .filter((docItem) => (docItem.category || defaultCategoryId) === id)
            .forEach((docItem) => {
                handleUpdate(docItem.id, { category: fallback.id });
            });

        removeCategoryBase(id);
        immediateSync?.();
    };

    return (
        <div className={`relative flex h-full w-full overflow-hidden ${isMobile ? 'rounded-none' : 'rounded-[26px]'}`}>
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-white dark:bg-slate-900" />
                <div className={`absolute left-12 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/20 ${isMobile ? '-top-32' : '-top-24'}`} />
                <div className={`absolute right-12 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-900/20 ${isMobile ? '-bottom-32' : '-bottom-24'}`} />
            </div>

            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
                <WritingWorkspaceHeader
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onCreate={handleCreate}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onRemoveCategory={handleRemoveCategory}
                    isMobile={isMobile}
                />

                <div className="relative flex min-h-0 flex-1">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <>
                                {isMobile && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="absolute inset-0 z-40 bg-slate-900/35 lg:hidden"
                                    />
                                )}

                                <motion.aside
                                    initial={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
                                    animate={isMobile ? { x: 0 } : { width: 320, opacity: 1 }}
                                    exit={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 40,
                                        mass: 1
                                    }}
                                    className={[
                                        'relative z-50 h-full flex-shrink-0 border-r border-sky-100 bg-white dark:border-slate-800 dark:bg-slate-900',
                                        isMobile
                                            ? 'absolute inset-y-0 left-0 w-[84vw] max-w-[360px]'
                                            : 'overflow-hidden'
                                    ].join(' ')}
                                >
                                    <div className="h-full w-full lg:w-[320px]">
                                        <WritingSidebar
                                            documents={visibleDocuments}
                                            allDocumentsCount={documents.length}
                                            categories={categories}
                                            isMobile={isMobile}
                                            activeDocId={selectedDocId}
                                            onSelectDoc={(id) => {
                                                setSelectedDocId(id);
                                                if (isMobile) setIsSidebarOpen(false);
                                            }}
                                            onCreate={handleCreate}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                            onRestore={(docToRestore) => handleCreate(docToRestore)}
                                        />
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    <section className="relative z-10 flex min-w-0 flex-1 flex-col">
                        {activeDoc ? (
                            <WritingEditor
                                key={activeDoc.id}
                                doc={activeDoc}
                                onUpdate={handleUpdate}
                                isSidebarOpen={isSidebarOpen}
                                onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
                                onCloseSidebar={() => setIsSidebarOpen(false)}
                                isMobile={isMobile}
                                onUndo={undo}
                                onRedo={redo}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                syncStatus={resolvedSyncStatus}
                            />
                        ) : hasNoFilteredResults ? (
                            <div className="flex h-full items-center justify-center bg-white/70 text-slate-400 dark:bg-slate-900/70 dark:text-slate-500">
                                <p className="text-sm">{t('common.noData')}</p>
                            </div>
                        ) : (
                            <WritingDashboard
                                onCreate={handleCreate}
                                documents={documents}
                                categories={categories}
                                onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
                                isSidebarOpen={isSidebarOpen}
                                isMobile={isMobile}
                                t={t}
                            />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WritingBoard;
