import React, { useMemo } from 'react';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import WritingBoard from './components/writing/WritingBoard';

const WritingModule = () => {
    const { doc, immediateSync, status } = useSync();
    const {
        projects: allProjects,
        addProject: addProjectBase,
        removeProject: removeProjectBase,
        updateProject: updateProjectBase
    } = useSyncedProjects(doc, 'all_projects');

    const writingDocs = useMemo(() =>
        allProjects.filter((project) => project.stage === 'writing'),
        [allProjects]
    );

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
        <div className="relative h-[calc(100vh-80px)] overflow-hidden rounded-[28px] border border-gray-200/70 bg-white/70 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm dark:border-gray-800/80 dark:bg-gray-900/70">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-white/90 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
                <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-500/10" />
                <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl dark:bg-rose-600/10" />
            </div>

            <div className="relative z-10 h-full">
                <WritingBoard
                    documents={writingDocs}
                    onCreate={(docToCreate) => {
                        if (docToCreate?.id) {
                            addDoc({ ...docToCreate, stage: 'writing' });
                            return;
                        }

                        addDoc({ ...docToCreate, stage: 'writing', timestamp: Date.now() });
                    }}
                    onUpdate={updateDoc}
                    onDelete={removeDoc}
                    syncStatus={status}
                />
            </div>
        </div>
    );
};

export default WritingModule;
