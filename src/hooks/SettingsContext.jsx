import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSync } from '../features/sync/SyncContext';
import { useSyncedMap } from '../features/sync/useSyncStore';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    // Default to false (hidden)
    const { doc } = useSync();
    const { data, set } = useSyncedMap(doc, 'user_preferences');

    // Default to false (hidden), but use synced value if present
    const showAdvancedFeatures = data.showAdvancedFeatures ?? false;

    // Backward compatibility / Init from local if sync is empty?
    // For simplicity, we just trust sync. If sync is empty, it's false.
    // Ideally we could migrate one-time, but let's keep it clean.

    const toggleAdvancedFeatures = () => {
        set('showAdvancedFeatures', !showAdvancedFeatures);
    };

    const setShowAdvancedFeatures = (value) => {
        set('showAdvancedFeatures', value);
    };

    const value = {
        showAdvancedFeatures,
        toggleAdvancedFeatures,
        setShowAdvancedFeatures
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
