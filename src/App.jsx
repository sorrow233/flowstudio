import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { KeymapProvider, ShortcutHelpModal, useBrowserIntercept } from './features/shortcuts';
import { LanguageProvider } from './features/i18n';
import { useIOSStandalone } from './hooks/useIOSStandalone';
import RouteLoadingScreen from './components/shared/RouteLoadingScreen';
import EmailLinkCompletionModal from './features/auth/EmailLinkCompletionModal';
import { lazyWithRetry } from './utils/chunkLoadRecovery';
import { version } from '../package.json';

const createRouteModule = (importer, contextName) => lazyWithRetry(importer, {
    buildId: version,
    contextName,
});

const InspirationModule = createRouteModule(
    () => import('./features/lifecycle/InspirationModule'),
    'route-inspiration'
);
const WritingModule = createRouteModule(
    () => import('./features/lifecycle/WritingModule'),
    'route-writing'
);
const InspirationArchiveModule = createRouteModule(
    () => import('./features/lifecycle/InspirationArchiveModule'),
    'route-inspiration-archive'
);
const PendingModule = createRouteModule(
    () => import('./features/lifecycle/PendingModule'),
    'route-pending'
);
const PrimaryDevModule = createRouteModule(
    () => import('./features/lifecycle/PrimaryDevModule'),
    'route-primary-dev'
);
const AdvancedDevModule = createRouteModule(
    () => import('./features/lifecycle/AdvancedDevModule'),
    'route-advanced-dev'
);
const CommandCenterModule = createRouteModule(
    () => import('./features/blueprint/CommandCenterModule'),
    'route-command-center'
);
const DataCenterModule = createRouteModule(
    () => import('./features/lifecycle/DataCenterModule'),
    'route-data-center'
);
const ShareViewPage = createRouteModule(
    () => import('./features/share/components/ShareViewPage'),
    'route-share-view'
);
const ShareReceiver = createRouteModule(
    () => import('./features/share/ShareReceiver'),
    'route-share-receiver'
);
const UserIdentityPage = createRouteModule(
    () => import('./features/auth/UserIdentityPage'),
    'route-user-identity'
);

function App() {
    const location = useLocation();
    const { isIOSStandalone } = useIOSStandalone();
    const routeSectionKey = location.pathname.split('/')[1] || 'root';
    const isIdentityRoute = location.pathname === '/__flowstudio/whoami';

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
                    <ShortcutHelpModal />
                    <EmailLinkCompletionModal />
                </div>
            </KeymapProvider>
        </LanguageProvider>
    );
}

export default App;
