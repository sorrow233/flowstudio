import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSync } from '../../../sync/SyncContext';
import { useSyncedProjects } from '../../../sync/useSyncStore';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';

const WritingBoard = () => {
    const { doc, immediateSync } = useSync();
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

    const handleCreate = () => {
        const newDoc = {
            id: uuidv4(),
            title: '未命名文档',
            content: '',
            stage: 'writing',
            timestamp: Date.now(),
            lastModified: Date.now()
        };
        addProject(newDoc);
        immediateSync?.();
        setSelectedDocId(newDoc.id);
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
        <div className="flex h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mx-auto max-w-6xl mt-8">
            <WritingSidebar
                documents={documents}
                activeDocId={selectedDocId}
                onSelectDoc={setSelectedDocId}
                onCreate={handleCreate}
                onDelete={handleDelete}
            />
            {activeDoc ? (
                <WritingEditor
                    key={activeDoc.id} // Force re-mount on doc change to reset internal state if needed
                    document={activeDoc}
                    onUpdate={handleUpdate}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 font-light">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <p className="text-lg">选择或创建一个文档</p>
                    <p className="text-sm opacity-60 mt-2">开始你的沉浸式写作之旅</p>
                </div>
            )}
        </div>
    );
};

export default WritingBoard;
