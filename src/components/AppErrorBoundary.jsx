import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <AlertTriangle size={48} color="#ff4d4f" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{t('common.error_title') || 'Something went wrong'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '500px' }}>
                {error.message}
            </p>
            <button
                onClick={resetErrorBoundary}
                style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem'
                }}
            >
                <RefreshCcw size={18} />
                {t('common.try_again') || 'Try Again'}
            </button>
        </div>
    );
};

const AppErrorBoundary = ({ children }) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
};

export default AppErrorBoundary;
