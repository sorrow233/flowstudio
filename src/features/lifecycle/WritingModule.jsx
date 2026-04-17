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
        updateProject: updateProjectBase,
        undo,
        redo,
        canUndo,
        canRedo,
        lastChangeMeta: projectChangeMeta,
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
        <div className="relative h-full min-h-0 overflow-hidden rounded-[22px] border border-slate-200/70 bg-[#f5f7fb] shadow-[0_24px_55px_-38px_rgba(15,23,42,0.35)] dark:border-white/6 dark:bg-[#0d1525] md:rounded-[28px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16),transparent_38%),linear-gradient(180deg,#f7f9fc_0%,#eef3fb_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#0d1525_0%,#101a2d_100%)]" />
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
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    projectChangeMeta={projectChangeMeta}
                    syncStatus={status}
                />
            </div>
        </div>
    );
};

export default WritingModule;
