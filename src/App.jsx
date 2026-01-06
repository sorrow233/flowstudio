import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/Pricing';
import AboutPage from '@/pages/About';
import ChangelogPage from '@/pages/Changelog';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LoadingFallback from '@/components/LoadingFallback';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import OfflineAlert from '@/components/OfflineAlert';

// Implement Lazy Loading for modules and pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const BacklogPage = React.lazy(() => import('@/modules/backlog/BacklogPage'));
const WorkshopPage = React.lazy(() => import('@/modules/workshop/WorkshopPage'));
const CommandTowerPage = React.lazy(() => import('@/modules/command-tower/CommandTowerPage'));


function App() {
  const { t } = useTranslation();
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
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
        </ProjectProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
