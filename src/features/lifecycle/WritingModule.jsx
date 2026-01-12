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
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
            {/* Immersive Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/20 dark:bg-sky-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 dark:bg-blue-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Main Content Area - Full screen for immersive writing */}
            <div className="w-full h-full flex flex-col relative z-10">
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
