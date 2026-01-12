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
        <div className="flex w-full h-full bg-white dark:bg-gray-900 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-full z-20 flex-shrink-0"
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

            <div className="flex-1 h-full min-w-0 relative bg-white dark:bg-gray-900 z-10">
                {activeDoc ? (
                    <WritingEditor
                        key={activeDoc.id} // Force re-mount on doc change
                        doc={activeDoc}
                        onUpdate={handleUpdate}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 font-light">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <p className="text-lg">{t('inspiration.emptyState')}</p>
                        <p className="text-sm opacity-60 mt-2">{t('inspiration.writingSubtitle')}</p>
                        <button
                            onClick={() => handleCreate()}
                            className="mt-6 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-medium transition-colors shadow-lg shadow-pink-500/20"
                        >
                            {t('inspiration.newDoc')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WritingBoard;
