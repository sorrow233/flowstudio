import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { KeymapProvider, ShortcutHelpModal, useBrowserIntercept } from './features/shortcuts';
import { LanguageProvider } from './features/i18n';
import { useIOSStandalone } from './hooks/useIOSStandalone';
import RouteLoadingScreen from './components/shared/RouteLoadingScreen';

const InspirationModule = lazy(() => import('./features/lifecycle/InspirationModule'));
const WritingModule = lazy(() => import('./features/lifecycle/WritingModule'));
const InspirationArchiveModule = lazy(() => import('./features/lifecycle/InspirationArchiveModule'));
const PendingModule = lazy(() => import('./features/lifecycle/PendingModule'));
const PrimaryDevModule = lazy(() => import('./features/lifecycle/PrimaryDevModule'));
const AdvancedDevModule = lazy(() => import('./features/lifecycle/AdvancedDevModule'));
const CommandCenterModule = lazy(() => import('./features/blueprint/CommandCenterModule'));
const DataCenterModule = lazy(() => import('./features/lifecycle/DataCenterModule'));
const ShareViewPage = lazy(() => import('./features/share/components/ShareViewPage'));
const ShareReceiver = lazy(() => import('./features/share/ShareReceiver'));
const UserIdentityPage = lazy(() => import('./features/auth/UserIdentityPage'));

function App() {
    const location = useLocation();
    const { isIOSStandalone } = useIOSStandalone();
    const routeSectionKey = location.pathname.split('/')[1] || 'root';
    const isIdentityRoute = location.pathname === '/__flowstudio/whoami';

    // 拦截浏览器默认快捷键 (Cmd+S, Cmd+P 等)
    useBrowserIntercept();

    return (
        <LanguageProvider>
            <KeymapProvider>
                <div className={`flex flex-col h-screen min-h-dvh h-dvh overflow-hidden bg-gray-50/50 dark:bg-gray-950 ${isIOSStandalone ? 'ios-standalone' : ''}`}>
                    <Toaster position="top-right" richColors />
                    {!isIdentityRoute && <Navbar />}

                    <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                        <div className={`${isIdentityRoute ? 'max-w-5xl mx-auto h-full px-4 py-8 md:px-6 md:py-12' : `max-w-7xl mx-auto h-full px-4 md:px-6 ${location.pathname.startsWith('/writing') ? 'pb-0' : 'pb-20'}`}`}>
                            <ErrorBoundary>
                                <Suspense fallback={<RouteLoadingScreen />}>
                                    <Routes location={location} key={routeSectionKey}>
                                        <Route path="/" element={<Navigate to="/inspiration" replace />} />
                                        <Route path="/inspiration" element={<InspirationModule />} />
                                        <Route path="/inspiration/c/:categoryId" element={<InspirationModule />} />
                                        <Route path="/writing" element={<WritingModule />} />
                                        <Route path="/writing/c/:categoryId" element={<WritingModule />} />
                                        <Route path="/writing/c/:categoryId/:docId" element={<WritingModule />} />
                                        <Route path="/writing/trash" element={<WritingModule />} />
                                        <Route path="/writing/trash/:docId" element={<WritingModule />} />
                                        <Route path="/inspiration/archive" element={<InspirationArchiveModule />} />
                                        <Route path="/sprout" element={<PendingModule />} />
                                        <Route path="/flow" element={<PrimaryDevModule />} />
                                        <Route path="/advanced" element={<AdvancedDevModule />} />
                                        <Route path="/blueprint" element={<CommandCenterModule />} />
                                        <Route path="/data" element={<DataCenterModule />} />
                                        <Route path="/share/:id" element={<ShareViewPage />} />
                                        <Route path="/share-receiver" element={<ShareReceiver />} />
                                        <Route path="/__flowstudio/whoami" element={<UserIdentityPage />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </main>

                    {/* 全局快捷键帮助面板 - Shift + ? 触发 */}
                    <ShortcutHelpModal />
                </div>
            </KeymapProvider>
        </LanguageProvider>
    );
}

export default App;
