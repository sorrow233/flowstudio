import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(showAdvancedFeatures));
    }, [showAdvancedFeatures]);

    const toggleAdvancedFeatures = () => {
        setShowAdvancedFeatures(prev => !prev);
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
