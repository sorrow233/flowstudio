import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useSyncedCategories } from '../../../sync/hooks/useSyncedCategories';
import { useTranslation } from '../../../i18n';
import { WRITING_CATEGORIES } from '../../../../utils/constants';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';
import WritingDashboard from './WritingDashboard';
import WritingWorkspaceHeader from './WritingWorkspaceHeader';
import { stripAllMarkdown as stripMarkup } from './markdownParser';
import { normalizeManualOrder, sortWritingDocuments } from './writingSortUtils';
import {
    TRASH_RETENTION_DAYS,
    isInWritingTrash,
    isTrashExpired,
} from './writingTrashUtils';

const detectCompactLayout = () => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    const hasTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false;
    const isIOS = typeof navigator !== 'undefined'
        ? /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        : false;
    const isCoarsePointer = typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;

    // iOS Safari 在“桌面网站”模式下可能给出较大宽度，触控设备统一优先走紧凑布局。
    return width < 1024 || ((isCoarsePointer || hasTouchPoints || isIOS) && width < 1366);
};

const encodeRoutePart = (value) => encodeURIComponent(String(value || '').trim());
const decodeRoutePart = (value) => {
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const normalizeCategoryLabel = (value) => String(value || '').trim().toLowerCase();

const WritingBoard = ({ documents: externalDocuments, onCreate, onUpdate, onDelete, syncStatus, isMobile: externalIsMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { categoryId: routeCategoryParam, docId: routeDocParam } = useParams();
    const isMobile = externalIsMobile !== undefined ? externalIsMobile : detectCompactLayout();
    const { doc, immediateSync, status } = useSync();
    const { t } = useTranslation();
    const isRouteTrash = location.pathname.startsWith('/writing/trash');
    const routeCategoryId = decodeRoutePart(routeCategoryParam);
    const routeDocId = decodeRoutePart(routeDocParam);
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
    } = useSyncedCategories(doc, 'writing_categories', WRITING_CATEGORIES, {
        initializeDefaults: true,
        ensureDefaultsPresent: true,
        cleanupDuplicates: true,
    });

    const categories = useMemo(() => {
        const base = [...WRITING_CATEGORIES, ...syncedCategories];
        const map = new Map();

        const defaultCategoryMap = new Map(WRITING_CATEGORIES.map(c => [c.id, c]));

        const mergeWithDefaultStyle = (category) => {
            const defaultCategory = defaultCategoryMap.get(category.id);
            if (!defaultCategory) return category;

            return {
                ...category,
                color: defaultCategory.color,
                dotColor: defaultCategory.dotColor,
                textColor: defaultCategory.textColor,
            };
        };

        const shouldUseCandidate = (currentCategory, candidateCategory) => {
            const defaultLabel = normalizeCategoryLabel(defaultCategoryMap.get(candidateCategory.id)?.label);
            const currentLabel = normalizeCategoryLabel(currentCategory?.label);
            const candidateLabel = normalizeCategoryLabel(candidateCategory?.label);

            const currentIsCustom = currentLabel && currentLabel !== defaultLabel;
            const candidateIsCustom = candidateLabel && candidateLabel !== defaultLabel;
            if (currentIsCustom !== candidateIsCustom) {
                return candidateIsCustom;
            }

            // 同优先级时优先用后到达的数据，降低旧缓存覆盖新名称的概率。
            return true;
        };

        base.forEach((category) => {
            if (!category?.id) return;
            const mergedCategory = mergeWithDefaultStyle(category);
            const existing = map.get(category.id);
            if (!existing) {
                map.set(category.id, mergedCategory);
                return;
            }

            if (shouldUseCandidate(existing, mergedCategory)) {
                map.set(category.id, mergedCategory);
            }
        });
        return Array.from(map.values());
    }, [syncedCategories]);

    const internalDocuments = useMemo(
        () => allProjects.filter((project) => project.stage === 'writing'),
        [allProjects]
    );

    const rawDocuments = externalDocuments ?? internalDocuments;
    const allDocuments = useMemo(() =>
        sortWritingDocuments(rawDocuments),
        [rawDocuments]
    );

    const activeDocuments = useMemo(
        () => allDocuments.filter((docItem) => !isInWritingTrash(docItem)),
        [allDocuments]
    );

    const trashDocuments = useMemo(
        () => allDocuments.filter((docItem) => isInWritingTrash(docItem)),
        [allDocuments]
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

    const hardDeleteHandler = onDelete ?? ((id) => {
        removeProject(id);
        immediateSync?.();
    });


    const [selectedDocId, setSelectedDocId] = useState(() => routeDocId || null);
    const [viewMode, setViewMode] = useState(() => (isRouteTrash ? 'trash' : 'active'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobile && activeDocuments.length > 0);
    const [selectedCategory, setSelectedCategory] = useState(() => routeCategoryId || categories[0]?.id || null);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const hasAutoOpenedSidebarRef = useRef(activeDocuments.length > 0);

    const isTrashView = viewMode === 'trash';
    const docsForView = isTrashView ? trashDocuments : activeDocuments;
    const buildWritingPath = useCallback((nextViewMode, nextCategoryId, nextDocId) => {
        if (nextViewMode === 'trash') {
            return nextDocId
                ? `/writing/trash/${encodeRoutePart(nextDocId)}`
                : '/writing/trash';
        }

        const safeCategory = nextCategoryId ? encodeRoutePart(nextCategoryId) : '';
        if (!safeCategory) return '/writing';
        return nextDocId
            ? `/writing/c/${safeCategory}/${encodeRoutePart(nextDocId)}`
            : `/writing/c/${safeCategory}`;
    }, []);

    useEffect(() => {
        setViewMode(isRouteTrash ? 'trash' : 'active');
        setSelectedDocId(routeDocId || null);

        if (!isRouteTrash && routeCategoryId) {
            setSelectedCategory(routeCategoryId);
        }
    }, [isRouteTrash, routeCategoryId, routeDocId]);

    useEffect(() => {
        if (viewMode === 'trash' && isSelectionMode) {
            setIsSelectionMode(false);
        }
    }, [isSelectionMode, viewMode]);

    useEffect(() => {
        if (isMobile) return;

        if (docsForView.length === 0) {
            setIsSidebarOpen(false);
            hasAutoOpenedSidebarRef.current = false;
            return;
        }

        if (!hasAutoOpenedSidebarRef.current) {
            setIsSidebarOpen(true);
            hasAutoOpenedSidebarRef.current = true;
        }
    }, [docsForView.length, isMobile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategory(null);
            return;
        }

        if (!categories.some((category) => category.id === selectedCategory)) {
            setSelectedCategory(categories[0].id);
        }
    }, [categories, selectedCategory]);

    useEffect(() => {
        const targetPath = buildWritingPath(viewMode, selectedCategory, selectedDocId);
        if (targetPath !== location.pathname) {
            navigate(targetPath, { replace: true });
        }
    }, [buildWritingPath, location.pathname, navigate, selectedCategory, selectedDocId, viewMode]);

    const defaultCategoryId = categories[0]?.id || 'draft';
    const documentSearchIndex = useMemo(() =>
        docsForView.map((docItem) => ({
            doc: docItem,
            category: docItem.category || defaultCategoryId,
            title: (docItem.title || '').toLowerCase(),
            content: stripMarkup(docItem.content || '').toLowerCase(),
        })),
        [docsForView, defaultCategoryId]
    );

    const visibleDocuments = useMemo(() => {
        let list = documentSearchIndex;
        if (!isTrashView) {
            if (!selectedCategory) return [];
            list = list.filter((docItem) => docItem.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter((docItem) =>
                docItem.title.includes(query)
                || docItem.content.includes(query)
            );
        }

        const resolved = list.map((docItem) => docItem.doc);
        return sortWritingDocuments(resolved, {
            categoryId: isTrashView ? null : selectedCategory,
            useManualOrder: !isTrashView,
        });
    }, [documentSearchIndex, isTrashView, searchQuery, selectedCategory]);

    const categoryDocCountMap = useMemo(() => {
        const counter = {};
        activeDocuments.forEach((docItem) => {
            const categoryId = docItem.category || defaultCategoryId;
            counter[categoryId] = (counter[categoryId] || 0) + 1;
        });
        return counter;
    }, [activeDocuments, defaultCategoryId]);

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
        docsForView.find((docItem) => docItem.id === selectedDocId),
        [docsForView, selectedDocId]
    );
    const hasNoFilteredResults = docsForView.length > 0 && visibleDocuments.length === 0;

    const handleCreate = (input = null) => {
        if (input && typeof input === 'object') {
            const existingDoc = input.id ? allDocuments.find((docItem) => docItem.id === input.id) : null;
            if (existingDoc) {
                updateHandler(existingDoc.id, {
                    ...input,
                    isDeleted: false,
                    deletedAt: null,
                    stage: 'writing',
                    lastModified: Date.now(),
                });
                setViewMode('active');
                setSelectedCategory(existingDoc.category || selectedCategory || defaultCategoryId);
                setSelectedDocId(existingDoc.id);
                if (isMobile) setIsSidebarOpen(false);
                return;
            }

            const restoredDoc = {
                ...input,
                stage: input.stage || 'writing',
                isDeleted: false,
                deletedAt: null,
                lastModified: Date.now()
            };
            createHandler(restoredDoc);
            setViewMode('active');
            setSelectedCategory(restoredDoc.category || selectedCategory || defaultCategoryId);
            setSelectedDocId(restoredDoc.id);

            if (isMobile) setIsSidebarOpen(false);
            return;
        }

        const newDoc = {
            id: uuidv4(),
            title: '',
            content: '',
            stage: 'writing',
            category: input || selectedCategory || defaultCategoryId,
            timestamp: Date.now(),
            isDeleted: false,
            deletedAt: null,
            lastModified: Date.now()
        };

        createHandler(newDoc);
        setViewMode('active');
        setSelectedCategory(newDoc.category || selectedCategory || defaultCategoryId);
        setSelectedDocId(newDoc.id);
        setSearchInput('');
        setSearchQuery('');

        if (isMobile) setIsSidebarOpen(false);
    };

    const handleUpdate = (id, updates) => {
        updateHandler(id, { ...updates, lastModified: Date.now() });
    };

    const handleMoveToTrash = (id) => {
        updateHandler(id, {
            isDeleted: true,
            deletedAt: Date.now(),
            lastModified: Date.now(),
        });
    };

    const handleRestoreFromTrash = (id) => {
        updateHandler(id, {
            isDeleted: false,
            deletedAt: null,
            lastModified: Date.now(),
        });
        const restoredDoc = allDocuments.find((docItem) => docItem.id === id);
        setViewMode('active');
        setSelectedCategory(restoredDoc?.category || selectedCategory || defaultCategoryId);
        setSelectedDocId(id);
    };

    const handleDelete = (id) => {
        const index = visibleDocuments.findIndex((docItem) => docItem.id === id);
        if (isTrashView) hardDeleteHandler(id);
        else handleMoveToTrash(id);

        if (selectedDocId === id) {
            if (visibleDocuments.length > 1) {
                const nextDoc = visibleDocuments[index + 1] || visibleDocuments[index - 1];
                setSelectedDocId(nextDoc?.id || null);
            } else {
                setSelectedDocId(null);
            }
        }
    };

    const handleBulkMoveCategory = (docIds = [], targetCategoryId) => {
        if (isTrashView) return;
        if (!targetCategoryId || !Array.isArray(docIds) || docIds.length === 0) return;

        const now = Date.now();
        const uniqueDocIds = Array.from(new Set(docIds));
        let hasChanges = false;
        uniqueDocIds.forEach((docId) => {
            const docItem = allDocuments.find((item) => item.id === docId);
            if (!docItem || isInWritingTrash(docItem)) return;

            const currentCategory = docItem.category || defaultCategoryId;
            if (currentCategory === targetCategoryId) return;

            updateProject(docId, {
                category: targetCategoryId,
                manualOrder: null,
                manualOrderCategory: null,
                lastModified: now,
            });
            hasChanges = true;
        });

        if (hasChanges) {
            immediateSync?.();
        }
    };

    const handleReorderDocuments = useCallback((orderedDocs = []) => {
        if (isTrashView) return;
        if (!selectedCategory || !Array.isArray(orderedDocs) || orderedDocs.length === 0) return;

        let hasChanges = false;
        orderedDocs.forEach((docItem, index) => {
            if (!docItem?.id) return;
            if ((docItem.category || defaultCategoryId) !== selectedCategory) return;

            const nextOrder = index + 1;
            const currentOrder = normalizeManualOrder(docItem.manualOrder);
            const currentCategory = docItem.manualOrderCategory || null;
            if (currentOrder === nextOrder && currentCategory === selectedCategory) return;

            updateProject(docItem.id, {
                manualOrder: nextOrder,
                manualOrderCategory: selectedCategory,
            });
            hasChanges = true;
        });

        if (hasChanges) immediateSync?.();
    }, [defaultCategoryId, immediateSync, isTrashView, selectedCategory, updateProject]);

    useEffect(() => {
        if (trashDocuments.length === 0) return;
        const now = Date.now();
        trashDocuments
            .filter((docItem) => isTrashExpired(docItem, now))
            .forEach((docItem) => hardDeleteHandler(docItem.id));
    }, [hardDeleteHandler, trashDocuments]);

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

        const now = Date.now();
        allDocuments
            .filter((docItem) => (docItem.category || defaultCategoryId) === id)
            .forEach((docItem) => {
                updateProject(docItem.id, {
                    category: fallback.id,
                    manualOrder: null,
                    manualOrderCategory: null,
                    lastModified: now
                });
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

            <div className="relative z-10 flex min-h-0 min-w-0 flex-1">
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
                                        'relative z-[70] h-full flex-shrink-0 border-r border-sky-100 bg-white pointer-events-auto dark:border-slate-800 dark:bg-slate-900',
                                        isMobile
                                            ? 'absolute inset-y-0 left-0 w-[84vw] max-w-[360px]'
                                            : 'overflow-hidden'
                                    ].join(' ')}
                                >
                                    <div className="flex h-full w-full flex-col lg:w-[320px]">
                                        <WritingWorkspaceHeader
                                            compact
                                            categories={categories}
                                            selectedCategory={selectedCategory}
                                            onSelectCategory={(categoryId) => {
                                                setSelectedCategory(categoryId);
                                                setSelectedDocId(null);
                                            }}
                                            onCreate={handleCreate}
                                            viewMode={viewMode}
                                            onViewModeChange={(nextMode) => {
                                                setViewMode(nextMode);
                                                setSelectedDocId(null);
                                                if (nextMode === 'trash') {
                                                    setIsSelectionMode(false);
                                                }
                                            }}
                                            trashCount={trashDocuments.length}
                                            searchQuery={searchInput}
                                            onSearchQueryChange={setSearchInput}
                                            onAddCategory={handleAddCategory}
                                            onUpdateCategory={handleUpdateCategory}
                                            onRemoveCategory={handleRemoveCategory}
                                            categoryDocCountMap={categoryDocCountMap}
                                            isMobile={isMobile}
                                            isSelectionMode={isSelectionMode}
                                            onToggleSelectionMode={() => {
                                                if (viewMode === 'trash') return;
                                                setIsSelectionMode((prev) => !prev);
                                            }}
                                        />
                                        <div className="min-h-0 flex-1">
                                            <WritingSidebar
                                                documents={visibleDocuments}
                                                allDocumentsCount={docsForView.length}
                                                isMobile={isMobile}
                                                viewMode={viewMode}
                                                activeDocId={selectedDocId}
                                                onSelectDoc={(id) => {
                                                    setSelectedDocId(id);
                                                    if (isMobile) setIsSidebarOpen(false);
                                                }}
                                                onEnterImmersive={(id) => {
                                                    setSelectedDocId(id);
                                                    setIsSidebarOpen(false);
                                                }}
                                                onCreate={handleCreate}
                                                onUpdate={handleUpdate}
                                                onDelete={handleDelete}
                                                onRestore={(docToRestore) => {
                                                    const targetId = docToRestore?.id || docToRestore;
                                                    if (!targetId) return;
                                                    handleRestoreFromTrash(targetId);
                                                }}
                                                categories={categories}
                                                selectedCategory={selectedCategory}
                                                onBulkMoveCategory={handleBulkMoveCategory}
                                                onReorderDocuments={handleReorderDocuments}
                                                canReorder={!isTrashView && !searchQuery.trim()}
                                                isSelectionMode={isSelectionMode}
                                                onSelectionModeChange={setIsSelectionMode}
                                            />
                                        </div>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    <section className="relative z-0 flex min-w-0 flex-1 flex-col">
                        {activeDoc ? (
                            <WritingEditor
                                key={activeDoc.id}
                                doc={activeDoc}
                                onUpdate={handleUpdate}
                                isSidebarOpen={isSidebarOpen}
                                onToggleSidebar={() => {
                                    setIsSidebarOpen((open) => !open);
                                }}
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
                        ) : isTrashView ? (
                            <div className="flex h-full items-center justify-center bg-white/70 text-slate-400 dark:bg-slate-900/70 dark:text-slate-500">
                                <p className="text-sm">{t('writing.emptyTrash', '回收站为空')}</p>
                            </div>
                        ) : (
                            <WritingDashboard
                                onCreate={handleCreate}
                                documents={activeDocuments}
                                categories={categories}
                                onToggleSidebar={() => {
                                    setIsSidebarOpen((open) => !open);
                                }}
                                isSidebarOpen={isSidebarOpen}
                                isMobile={isMobile}
                                t={t}
                            />
                        )}
                    </section>
            </div>
        </div>
    );
};

export default WritingBoard;
