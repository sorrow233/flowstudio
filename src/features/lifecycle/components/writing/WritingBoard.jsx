import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useTranslation } from '../../../i18n';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';
import WritingDashboard from './WritingDashboard';

const WritingBoard = ({ documents: externalDocuments, onCreate, onUpdate, onDelete, syncStatus }) => {
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
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (documents.length === 0) {
            if (selectedDocId !== null) {
                setSelectedDocId(null);
            }
            return;
        }

        const hasSelected = selectedDocId && documents.some((docItem) => docItem.id === selectedDocId);
        if (!hasSelected) {
            setSelectedDocId(documents[0].id);
        }
    }, [documents, selectedDocId]);

    const activeDoc = useMemo(() =>
        documents.find((docItem) => docItem.id === selectedDocId),
        [documents, selectedDocId]
    );

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
            category: input || 'draft',
            timestamp: Date.now(),
            lastModified: Date.now()
        };

        createHandler(newDoc);
        setSelectedDocId(newDoc.id);

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

    return (
        <div className="relative flex h-full w-full overflow-hidden rounded-[26px]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
                <div className="absolute -top-24 left-12 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/20" />
                <div className="absolute -bottom-24 right-12 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-900/20" />
            </div>

            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {isMobile && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 z-40 bg-slate-900/35 lg:hidden"
                            />
                        )}

                        <motion.aside
                            initial={isMobile ? { x: '-100%' } : { x: -24, opacity: 0 }}
                            animate={isMobile ? { x: 0 } : { x: 0, opacity: 1 }}
                            exit={isMobile ? { x: '-100%' } : { x: -24, opacity: 0 }}
                            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
                            className={[
                                'relative z-50 h-full flex-shrink-0 border-r border-sky-100 bg-white dark:border-slate-800 dark:bg-slate-900',
                                isMobile
                                    ? 'fixed inset-y-0 left-0 w-[84vw] max-w-[360px]'
                                    : 'w-[320px]'
                            ].join(' ')}
                        >
                            <WritingSidebar
                                documents={documents}
                                activeDocId={selectedDocId}
                                onSelectDoc={(id) => {
                                    setSelectedDocId(id);
                                    if (isMobile) setIsSidebarOpen(false);
                                }}
                                onCreate={handleCreate}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                onRestore={(docToRestore) => handleCreate(docToRestore)}
                                onClose={() => setIsSidebarOpen(false)}
                                isMobile={isMobile}
                            />
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
                ) : (
                    <WritingDashboard
                        onCreate={handleCreate}
                        documents={documents}
                        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
                        isSidebarOpen={isSidebarOpen}
                        isMobile={isMobile}
                        t={t}
                    />
                )}
            </section>
        </div>
    );
};

export default WritingBoard;
