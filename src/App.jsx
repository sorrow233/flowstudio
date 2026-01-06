import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '@/contexts/AuthContext';
// import { ProjectProvider } from '@/contexts/ProjectContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import OfflineAlert from '@/components/OfflineAlert';
import LandingPage from '@/pages/LandingPage/LandingPage';
import Login from '@/pages/Login';
import PricingPage from '@/pages/Pricing';
import AboutPage from '@/pages/About';
import ChangelogPage from '@/pages/Changelog';

// Lazy load protected pages for performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const BacklogPage = lazy(() => import('@/modules/backlog/BacklogPage'));
const WorkshopPage = lazy(() => import('@/modules/workshop/WorkshopPage'));
const CommandTowerPage = lazy(() => import('@/modules/command-tower/CommandTowerPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  const { t } = useTranslation();
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <OfflineAlert />
            <Routes>
              {/* Public Routes - Keep eager loaded for speed or lazy load if large */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />

              {/* Protected Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <React.Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </React.Suspense>
                } />
                <Route path="backlog" element={
                  <React.Suspense fallback={<LoadingFallback />}>
                    <BacklogPage />
                  </React.Suspense>
                } />
                <Route path="workshop" element={
                  <React.Suspense fallback={<LoadingFallback />}>
                    <WorkshopPage />
                  </React.Suspense>
                } />
                <Route path="command-tower" element={
                  <React.Suspense fallback={<LoadingFallback />}>
                    <CommandTowerPage />
                  </React.Suspense>
                } />
                <Route path="settings" element={<div className="text-h2">{t('settings.title')}</div>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
