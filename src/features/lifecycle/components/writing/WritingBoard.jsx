import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useTranslation } from '../../../i18n';
import { useIOSStandalone } from '../../../../hooks/useIOSStandalone';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';

const WritingBoard = () => {
    const { doc, immediateSync } = useSync();
    const { t } = useTranslation();
    const { isIOSStandalone } = useIOSStandalone();
    const {
        projects: allProjects,
        addProject,
        updateProject,
        removeProject
    } = useSyncedProjects(doc, 'all_projects');

    // Filter for writing documents
    const documents = useMemo(() =>
        allProjects
            .filter(p => p.stage === 'writing')
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
        [allProjects]
    );

    const [selectedDocId, setSelectedDocId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // On mobile, default sidebar to closed if it was open from desktop
            if (mobile && isSidebarOpen && window.innerWidth < 768) {
                // setIsSidebarOpen(false); // Auto-close on small mobile
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Initial load: select first doc if none selected
    useEffect(() => {
        if (!selectedDocId && documents.length > 0) {
            setSelectedDocId(documents[0].id);
        }
    }, [documents, selectedDocId]);

    const activeDoc = useMemo(() =>
        documents.find(d => d.id === selectedDocId),
        [documents, selectedDocId]
    );

    const handleCreate = (category = null) => {
        const newDoc = {
            id: uuidv4(),
            title: t('inspiration.untitled'),
            content: '',
            stage: 'writing',
            category: category || 'draft',
            timestamp: Date.now(),
            lastModified: Date.now()
        };
        addProject(newDoc);
        immediateSync?.();
        setSelectedDocId(newDoc.id);

        // On mobile, stay in sidebar or jump to editor? 
        // Usually, jump to editor and close sidebar.
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleUpdate = (id, updates) => {
        updateProject(id, { ...updates, lastModified: Date.now() });
        immediateSync?.();
    };

    const handleDelete = (id) => {
        const index = documents.findIndex(d => d.id === id);
        removeProject(id);
        immediateSync?.();

        if (selectedDocId === id) {
            if (documents.length > 1) {
                const nextDoc = documents[index + 1] || documents[index - 1];
                setSelectedDocId(nextDoc?.id || null);
            } else {
                setSelectedDocId(null);
            }
        }
    };

    <div
        className={`flex w-full bg-transparent overflow-hidden relative`}
        style={{ height: '100dvh' }} // Dynamic viewport height for mobile
    >
        <AnimatePresence mode="wait">
            {isSidebarOpen && (
                <>
                    {/* Mobile Overlay Backdrop - Clean blur, no dark tint if possible, or very light */}
                    {isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-[2px] z-40 lg:hidden"
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
                                ${isMobile ? 'fixed inset-y-0 left-0 w-[50%] max-w-[260px] pt-16 shadow-2xl' : 'relative'}
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
                            isMobile={isMobile}
                        />

                        {/* Specialized Sidebar Drag Handle for closing on mobile */}
                        {isMobile && (
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={{ left: 0.1, right: 0 }}
                                onDragEnd={(e, info) => {
                                    // If swiped left on the handle, close the sidebar
                                    if (info.offset.x < -40 || info.velocity.x < -300) {
                                        setIsSidebarOpen(false);
                                    }
                                }}
                                className="absolute top-0 bottom-0 -right-8 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-50 group"
                            >
                                <div className="w-1 h-32 bg-gray-400/20 group-active:bg-sky-500/40 rounded-full blur-[0.5px] transition-colors duration-300" />
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
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-32 h-32 mb-8 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 flex items-center justify-center shadow-2xl shadow-sky-200/20 dark:shadow-none"
                    >
                        <svg className="w-12 h-12 text-sky-400 dark:text-sky-300 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </motion.div>
                    <h3 className="text-2xl font-light text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                        {t('inspiration.emptyState')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                        {t('inspiration.writingSubtitle')}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCreate()}
                        className="mt-10 px-8 py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full text-sm font-medium transition-all shadow-xl shadow-sky-500/20"
                    >
                        {t('inspiration.newDoc')}
                    </motion.button>

                    {/* Mobile sidebar toggle if empty and closed */}
                    {isMobile && !isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="mt-4 text-xs text-sky-500 font-medium"
                        >
                            {t('inspiration.viewAll')}
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>
    );
};

export default WritingBoard;
