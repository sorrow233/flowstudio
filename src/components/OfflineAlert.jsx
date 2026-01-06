import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OfflineAlert = () => {
    const { t } = useTranslation();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#ff4d4f', // Error Red
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <WifiOff size={18} />
            <span>{t('common.offline_mode') || 'You are offline. Changes will be saved locally.'}</span>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateY(100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default OfflineAlert;
