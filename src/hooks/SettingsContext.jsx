import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(() => {
        const saved = localStorage.getItem('flow_settings_advanced');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('flow_settings_advanced', JSON.stringify(showAdvancedFeatures));
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
