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
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative bg-transparent">
            {/* Background - Atmospheric & Breathing */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-300/30 dark:bg-rose-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-300/30 dark:bg-pink-900/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 bg-grid-pink-200/20 dark:bg-grid-pink-900/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
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
