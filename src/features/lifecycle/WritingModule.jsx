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

    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div className={`relative min-h-0 overflow-hidden bg-white dark:bg-gray-900 transition-all ${isMobile ? 'h-full w-[calc(100%+2rem)] -mx-4' : 'h-full rounded-[24px] border border-gray-200 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.55)] dark:border-gray-800 md:rounded-[28px]'}`}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-white dark:bg-slate-900" />
                <div className={`absolute left-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-500/10 ${isMobile ? '-top-32' : '-top-24'}`} />
                <div className={`absolute right-8 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl dark:bg-rose-600/10 ${isMobile ? '-bottom-32' : '-bottom-24'}`} />
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
                    isMobile={isMobile}
                />
            </div>
        </div>
    );
};

export default WritingModule;
