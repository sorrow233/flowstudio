import React, { createContext, useContext } from 'react';
import { useSyncStore, useDataMigration, useProjectMigration } from './useSyncStore';

const SyncContext = createContext(null);

export const SyncProvider = ({ children, docId = 'flowstudio_v1' }) => {
    // Single source of truth for the connection
    const { doc, status, update } = useSyncStore(docId);

    // Run migration only once at the root level
    useDataMigration(doc);

    // Migrate projects to unified storage
    useProjectMigration(doc, 'all_projects', [
        'inspiration',
        'pending_projects',
        'primary_projects',
        'final_projects'
    ]);

    return (
        <SyncContext.Provider value={{ doc, status, update }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};
