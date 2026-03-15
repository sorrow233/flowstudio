import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { KeymapProvider, ShortcutHelpModal, useBrowserIntercept } from './features/shortcuts';
import { LanguageProvider } from './features/i18n';
import { useIOSStandalone } from './hooks/useIOSStandalone';
import RouteLoadingScreen from './components/shared/RouteLoadingScreen';
import EmailLinkCompletionModal from './features/auth/EmailLinkCompletionModal';
import { IOSHomeScreenPrompt } from './features/pwa';
import {
    AdvancedDevRoute,
    CommandCenterRoute,
    DataCenterRoute,
    idleRoutePreloaders,
    InspirationArchiveRoute,
    InspirationRoute,
    PendingRoute,
    PrimaryDevRoute,
    ShareReceiverRoute,
    ShareViewRoute,
    UserIdentityRoute,
    WritingRoute,
} from './routes/routeModules';

const IDLE_PRELOAD_DELAY_MS = 120;

function scheduleWhenIdle(callback) {
    if (typeof window === 'undefined') return () => {};

    if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
        return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(callback, 250);
    return () => window.clearTimeout(timeoutId);
}

function App() {
    const location = useLocation();
    const { isIOSStandalone } = useIOSStandalone();
    const routeSectionKey = location.pathname.split('/')[1] || 'root';
    const isIdentityRoute = location.pathname === '/__flowstudio/whoami';
    const isShareRoute = location.pathname.startsWith('/share');

    useBrowserIntercept();

    useEffect(() => {
        if (typeof window === 'undefined' || idleRoutePreloaders.length === 0) {
            return undefined;
        }

        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) {
            return undefined;
        }

        let cancelled = false;
        let timeoutId = null;

        const queueWarmup = async () => {
            for (const preload of idleRoutePreloaders) {
                if (cancelled) return;

                try {
                    await preload?.();
                } catch {
                    // 懒加载预热失败时保留正常点击兜底，不中断用户流程。
                }

                await new Promise((resolve) => {
                    timeoutId = window.setTimeout(resolve, IDLE_PRELOAD_DELAY_MS);
                });
            }
        };

        const cancelIdleSchedule = scheduleWhenIdle(() => {
            void queueWarmup();
        });

        return () => {
            cancelled = true;
            cancelIdleSchedule();

            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);

    return (
        <LanguageProvider>
            <KeymapProvider>
                <div className={`flex flex-col h-screen min-h-dvh h-dvh overflow-hidden bg-gray-50/50 dark:bg-gray-950 ${isIOSStandalone ? 'ios-standalone' : ''}`}>
                    <Toaster position="top-right" richColors />
                    {!isIdentityRoute && <Navbar />}

                    <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                        <div className={`${isIdentityRoute ? 'max-w-5xl mx-auto h-full px-4 py-8 md:px-6 md:py-12' : `max-w-7xl mx-auto h-full px-4 md:px-6 ${location.pathname.startsWith('/writing') ? 'pb-0' : 'pb-20'}`}`}>
                            {!isIdentityRoute && !isShareRoute && <IOSHomeScreenPrompt />}
                            <ErrorBoundary>
                                <Suspense fallback={<RouteLoadingScreen />}>
                                    <Routes location={location} key={routeSectionKey}>
                                        <Route path="/" element={<Navigate to="/inspiration" replace />} />
                                        <Route path="/inspiration" element={<InspirationRoute />} />
                                        <Route path="/inspiration/c/:categoryId" element={<InspirationRoute />} />
                                        <Route path="/writing" element={<WritingRoute />} />
                                        <Route path="/writing/c/:categoryId" element={<WritingRoute />} />
                                        <Route path="/writing/c/:categoryId/:docId" element={<WritingRoute />} />
                                        <Route path="/writing/trash" element={<WritingRoute />} />
                                        <Route path="/writing/trash/:docId" element={<WritingRoute />} />
                                        <Route path="/inspiration/archive" element={<InspirationArchiveRoute />} />
                                        <Route path="/sprout" element={<PendingRoute />} />
                                        <Route path="/flow" element={<PrimaryDevRoute />} />
                                        <Route path="/advanced" element={<AdvancedDevRoute />} />
                                        <Route path="/blueprint" element={<CommandCenterRoute />} />
                                        <Route path="/data" element={<DataCenterRoute />} />
                                        <Route path="/share/:id" element={<ShareViewRoute />} />
                                        <Route path="/share-receiver" element={<ShareReceiverRoute />} />
                                        <Route path="/__flowstudio/whoami" element={<UserIdentityRoute />} />
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
