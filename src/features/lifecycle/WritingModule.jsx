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
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative bg-transparent">
            {/* Background - Calm, minimal, premium */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950" />
                <div className="absolute -top-24 -left-24 w-[40%] h-[40%] rounded-full bg-rose-200/20 dark:bg-rose-600/10 blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-[35%] h-[35%] rounded-full bg-rose-200/20 dark:bg-rose-600/10 blur-[120px]" />
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.06),transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] [background-size:18px_18px] dark:opacity-[0.08]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,transparent_30%,transparent_70%,rgba(255,255,255,0.35)_100%)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.6)_0%,transparent_35%,transparent_70%,rgba(15,23,42,0.5)_100%)]" />
            </div>

            {/* Main Content Area - Full screen for immersive writing */}
            <div className="w-full h-full flex flex-col relative z-10">
                <WritingBoard
                    documents={writingDocs}
                    onCreate={(doc) => {
                        if (doc?.id) {
                            addDoc({ ...doc, stage: 'writing' });
                            return;
                        }
                        addDoc({ ...doc, stage: 'writing', timestamp: Date.now() });
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
