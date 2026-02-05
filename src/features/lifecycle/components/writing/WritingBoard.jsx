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

    // Filter for writing documents
    const internalDocuments = useMemo(() =>
        allProjects
            .filter(p => p.stage === 'writing')
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
        [allProjects]
    );

    const documents = externalDocuments ?? internalDocuments;
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeDoc = useMemo(() =>
        documents.find(d => d.id === selectedDocId),
        [documents, selectedDocId]
    );

    const handleCreate = (input = null) => {
        if (input && typeof input === 'object') {
            if (input.id && documents.some(d => d.id === input.id)) {
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
        const index = documents.findIndex(d => d.id === id);
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
        <div
            className="flex w-full bg-transparent overflow-hidden relative"
            style={{ height: '100dvh' }}
        >
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <>
                        {/* Mobile Overlay - Pure aesthetic backdrop blur without dark tint */}
                        {isMobile && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[3px] z-40 lg:hidden"
                            />
                        )}

                        <motion.div
                            initial={isMobile ? { x: '-100%' } : { width: 0, opacity: 0, x: -20 }}
                            animate={isMobile ? { x: 0 } : { width: 'auto', opacity: 1, x: 0 }}
                            exit={isMobile ? { x: '-100%' } : { width: 0, opacity: 0, x: -20 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 40,
                                opacity: { duration: 0.2 }
                            }}
                            className={`
                                h-full flex-shrink-0 relative z-50
                                ${isMobile ? 'fixed inset-y-0 left-0 w-[55%] max-w-[280px] pt-16' : 'relative'}
                            `}
                        >
                            <WritingSidebar
                                documents={documents}
                                activeDocId={selectedDocId}
                                onSelectDoc={(id) => {
                                    setSelectedDocId(id);
                                    if (isMobile) setIsSidebarOpen(false);
                                }}
                                onCreate={handleCreate}
                                onDelete={handleDelete}
                                onRestore={(doc) => handleCreate(doc)}
                                onClose={() => setIsSidebarOpen(false)}
                                isMobile={isMobile}
                            />

                            {/* Specialized Sidebar Drag Handle for closing on mobile */}
                            {isMobile && (
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={{ left: 0.1, right: 0 }}
                                    onDragEnd={(e, info) => {
                                        if (info.offset.x < -40 || info.velocity.x < -300) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className="absolute top-0 bottom-0 -right-8 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-50 group"
                                >
                                    <div className="w-1 h-32 bg-gray-400/20 group-active:bg-sky-500/40 rounded-full blur-[0.5px]" />
                                </motion.div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-1 h-full min-w-0 relative z-10 flex flex-col">
                {activeDoc ? (
                    <WritingEditor
                        key={activeDoc.id}
                        doc={activeDoc}
                        onUpdate={handleUpdate}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

export default WritingBoard;
