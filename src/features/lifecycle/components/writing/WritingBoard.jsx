import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import { useTranslation } from '../../../i18n';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';

const WritingBoard = () => {
    const { doc, immediateSync } = useSync();
    const { t } = useTranslation();
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

    // Initial load: select first doc if none selected
    React.useEffect(() => {
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
            category: category || 'draft', // Default to draft if none selected
            timestamp: Date.now(),
            lastModified: Date.now()
        };
        addProject(newDoc);
        immediateSync?.();
        setSelectedDocId(newDoc.id);
        if (!isSidebarOpen) setIsSidebarOpen(true); // Open sidebar on create
    };

    const handleUpdate = (id, updates) => {
        updateProject(id, { ...updates, lastModified: Date.now() });
        immediateSync?.();
    };

    const handleDelete = (id) => {
        const index = documents.findIndex(d => d.id === id);
        removeProject(id);
        immediateSync?.();

        // Handle selection after delete
        if (selectedDocId === id) {
            if (documents.length > 1) {
                // Select next or previous
                const nextDoc = documents[index + 1] || documents[index - 1];
                setSelectedDocId(nextDoc?.id || null);
            } else {
                setSelectedDocId(null);
            }
        }
    };

    return (
        <div className="flex w-full h-full bg-transparent overflow-hidden relative">
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0, x: -20 }}
                        animate={{ width: 'auto', opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="h-full z-20 flex-shrink-0 relative"
                    >
                        <WritingSidebar
                            documents={documents}
                            activeDocId={selectedDocId}
                            onSelectDoc={setSelectedDocId}
                            onCreate={handleCreate}
                            onDelete={handleDelete}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 h-full min-w-0 relative z-10">
                {activeDoc ? (
                    <WritingEditor
                        key={activeDoc.id} // Force re-mount on doc change
                        doc={activeDoc}
                        onUpdate={handleUpdate}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default WritingBoard;
