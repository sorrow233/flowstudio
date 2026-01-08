import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import InspirationModule from './features/lifecycle/InspirationModule';
import PendingModule from './features/lifecycle/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDevModule';
import CommercialModule from './features/lifecycle/CommercialModule';
import CommandCenterModule from './features/commands/CommandCenterModule';
import ShareViewPage from './features/share/components/ShareViewPage';

import { Toaster } from 'sonner';
import { KeymapProvider, ShortcutHelpModal, useBrowserIntercept } from './features/shortcuts';
import { ThemeProvider } from './hooks/ThemeContext';
import { LanguageProvider } from './features/i18n';

function App() {
    const location = useLocation();

    // 拦截浏览器默认快捷键 (Cmd+S, Cmd+P 等)
    useBrowserIntercept();

    return (
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 pb-20">
            <ErrorBoundary>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Navigate to="/inspiration" replace />} />
                    <Route path="/inspiration" element={<InspirationModule />} />
                    <Route path="/pending" element={<PendingModule />} />
                    <Route path="/primary" element={<PrimaryDevModule />} />
                    <Route path="/final" element={<FinalDevModule />} />
                    <Route path="/advanced" element={<AdvancedDevModule />} />
                    <Route path="/commercial" element={<CommercialModule />} />
                    <Route path="/commands" element={<CommandCenterModule />} />
                    <Route path="/share/:id" element={<ShareViewPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ErrorBoundary>
        </div>
                    </main >

        {/* 全局快捷键帮助面板 - Shift + ? 触发 */ }
        < ShortcutHelpModal />
                </div >
            </KeymapProvider >
        </ThemeProvider >
    );
}

export default App;


