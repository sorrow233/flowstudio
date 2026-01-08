import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { SyncProvider } from './features/sync/SyncContext'
import App from './App'
import './index.css'

// Flow Studio v4.3.32 - Force Hash Refresh
console.log('Flow Studio v4.3.32 loaded');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <SyncProvider>
                    <App />
                </SyncProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
