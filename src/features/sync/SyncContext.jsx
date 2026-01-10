import React, { createContext, useContext } from 'react';
import { useSyncStore, useDataMigration, useProjectMigration } from './useSyncStore';
import { useAuth } from '../auth/AuthContext';
import { useLocalBackup } from './LocalBackupService';

const SyncContext = createContext(null);

export const SyncProvider = ({ children, docId = 'flowstudio_v1' }) => {
    // Single source of truth for the connection
    const { doc, status, update, immediateSync } = useSyncStore(docId);
    const { user } = useAuth();

    // Determine if user is logged in
    const isLoggedIn = !!user;

    // Run migration only once at the root level
    // Pass isLoggedIn so seeding is skipped for logged-in users (their data will sync from server)
    useDataMigration(doc, isLoggedIn);

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
