import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import InspirationModule from './features/lifecycle/InspirationModule';

import InspirationArchiveModule from './features/lifecycle/InspirationArchiveModule';
import PendingModule from './features/lifecycle/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDevModule';
import CommandCenterModule from './features/blueprint/CommandCenterModule';
import DataCenterModule from './features/lifecycle/DataCenterModule';
import ShareViewPage from './features/share/components/ShareViewPage';
import ShareReceiver from './features/share/ShareReceiver';
import WritingBetaPage from './features/writing-beta/WritingBetaPage';

import { Toaster } from 'sonner';
import { KeymapProvider, ShortcutHelpModal, useBrowserIntercept } from './features/shortcuts';
import { LanguageProvider } from './features/i18n';
import { ThemeProvider } from './hooks/ThemeContext';
import { useIOSStandalone } from './hooks/useIOSStandalone';

function App() {
    const location = useLocation();
    const { isIOSStandalone } = useIOSStandalone();

    // 拦截浏览器默认快捷键 (Cmd+S, Cmd+P 等)
    useBrowserIntercept();

    return (
        <ThemeProvider>
            <LanguageProvider>
                <KeymapProvider>
                    <div className={`flex flex-col h-screen overflow-hidden bg-gray-50/50 dark:bg-gray-950 ${isIOSStandalone ? 'ios-standalone' : ''}`}>
                        <Toaster position="top-right" richColors />
                        <Navbar />

                        <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                            <div className="max-w-7xl mx-auto h-full px-4 md:px-6 pb-20">
                                <ErrorBoundary>
                                    <Routes location={location} key={location.pathname}>
                                        <Route path="/" element={<Navigate to="/inspiration" replace />} />
                                        <Route path="/inspiration" element={<InspirationModule />} />

                                        <Route path="/inspiration/archive" element={<InspirationArchiveModule />} />
                                        <Route path="/sprout" element={<PendingModule />} />
                                        <Route path="/flow" element={<PrimaryDevModule />} />
                                        <Route path="/advanced" element={<AdvancedDevModule />} />
                                        <Route path="/blueprint" element={<CommandCenterModule />} />
                                        <Route path="/data" element={<DataCenterModule />} />
                                        <Route path="/beta写作" element={<WritingBetaPage />} />
                                        <Route path="/share/:id" element={<ShareViewPage />} />
                                        <Route path="/share-receiver" element={<ShareReceiver />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </ErrorBoundary>
                            </div>
                        </main>

                        {/* 全局快捷键帮助面板 - Shift + ? 触发 */}
                        <ShortcutHelpModal />
                    </div>
                </KeymapProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
