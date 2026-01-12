import React, { useMemo } from 'react';
import { PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';
import WritingBoard from './components/writing/WritingBoard';

const WritingModule = () => {
    const { doc, immediateSync } = useSync();
    const { t } = useTranslation();

    const {
        projects: allProjects,
        addProject: addProjectBase,
        removeProject: removeProjectBase,
        updateProject: updateProjectBase
    } = useSyncedProjects(doc, 'all_projects');

    // Filter for writing projects
    const writingDocs = useMemo(() =>
        allProjects.filter(p => p.stage === 'writing'),
        [allProjects]);

    // Wrap CRUD
    const addDoc = (docData) => {
        addProjectBase(docData);
        immediateSync?.();
    };
    const updateDoc = (id, updates) => {
        updateProjectBase(id, updates);
        immediateSync?.();
    };
    const removeDoc = (id) => {
        removeProjectBase(id);
        immediateSync?.();
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Main Content Area - Full screen for immersive writing */}
            <div className="w-full h-full flex flex-col">
                <WritingBoard
                    documents={writingDocs}
                    onCreate={(doc) => addDoc({ ...doc, stage: 'writing', timestamp: Date.now() })}
                    onUpdate={updateDoc}
                    onDelete={removeDoc}
                />
            </div>
        </div>
    );
};

export default WritingModule;
