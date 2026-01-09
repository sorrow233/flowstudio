import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { SyncProvider } from './features/sync/SyncContext'
import App from './App'
import './index.css'

import { version } from '../package.json';

// Flow Studio - Force Hash Refresh
console.log(`Flow Studio v${version} loaded`);

import { SettingsProvider } from './hooks/SettingsContext';
import { ThemeProvider } from './hooks/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <SettingsProvider>
                        <SyncProvider>
                            <App />
                        </SyncProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
    ```
