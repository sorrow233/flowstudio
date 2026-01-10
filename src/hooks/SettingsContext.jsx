import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSync } from '../features/sync/SyncContext';
import { useSyncedMap } from '../features/sync/useSyncStore';

const STORAGE_KEY = 'flow_settings_advanced';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    // Sync
    const { doc } = useSync();
    const { data: preferences, set } = useSyncedMap(doc, 'user_preferences');

    // Local state as fallback/optimistic
    const [localShow, setLocalShow] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    // Determine effective value: Sync takes precedence if available
    const showAdvancedFeatures = preferences?.showAdvancedFeatures ?? localShow;

    // Sync from cloud to local
    useEffect(() => {
        if (preferences?.showAdvancedFeatures !== undefined) {
            setLocalShow(preferences.showAdvancedFeatures);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.showAdvancedFeatures));
        }
    }, [preferences?.showAdvancedFeatures]);

    const toggleAdvancedFeatures = () => {
        const newValue = !showAdvancedFeatures;
        setLocalShow(newValue);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        if (doc) {
            set('showAdvancedFeatures', newValue);
        }
    };

    const value = {
        showAdvancedFeatures,
        toggleAdvancedFeatures,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
