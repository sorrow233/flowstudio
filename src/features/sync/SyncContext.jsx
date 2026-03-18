import React, { createContext, useContext } from 'react';
import { useSyncStore, useDataMigration, useProjectMigration } from './useSyncStore';
import { useWritingDataMigration } from './hooks/useWritingDataMigration';
import { useAuth } from '../auth/AuthContext';
import { useLocalBackup } from './LocalBackupService';

const SyncContext = createContext(null);

export const SyncProvider = ({ children, docId = 'flowstudio_v1' }) => {
    // Single source of truth for the connection
    const { doc, status, update, immediateSync } = useSyncStore(docId);
    const { user } = useAuth();

    // Determine if user is logged in
    const isLoggedIn = !!user;

    // Run migration only once at the root level.
    // Pass auth + sync status so guest seeds wait for local data to load and
    // logged-in users never keep the onboarding cards in their synced state.
    useDataMigration(doc, isLoggedIn, status);
    useWritingDataMigration(doc, status);

    // 启用本地定时备份：每小时同步一次完整数据，保留3天
    useLocalBackup(doc);

    // Migrate projects to unified storage
    useProjectMigration(doc, 'all_projects', [
        'inspiration',
        'pending_projects',
        'primary_projects',
        'final_projects'
    ]);

    return (
        <SyncContext.Provider value={{ doc, status, update, immediateSync }}>
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
