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
const ProjectDetailsPage = lazy(() => import('@/pages/ProjectDetailsPage'));

import LoadingFallback from '@/components/LoadingFallback';

function App() {
  const { t } = useTranslation();
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <OfflineAlert />
            <Routes>
              {/* Explicit language routes to avoid matching /app, /login, etc. */}
              <Route path="/en/*" element={<LocalizedRoutes lang="en" />} />
              <Route path="/zh-CN/*" element={<LocalizedRoutes lang="zh-CN" />} />
              <Route path="/zh-TW/*" element={<LocalizedRoutes lang="zh-TW" />} />
              <Route path="/ja/*" element={<LocalizedRoutes lang="ja" />} />
              <Route path="/ko/*" element={<LocalizedRoutes lang="ko" />} />
              <Route path="*" element={<AppRoutes />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}


function LocalizedRoutes({ lang }) {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Prevent rendering with wrong language
  if (lang && i18n.language !== lang) {
    return <LoadingFallback />;
  }

  return <AppRoutes />;
}

function AppRoutes() {
  const { t } = useTranslation();
  return (
    <Routes>
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
        <Route index element={<Dashboard />} />
        <Route path="backlog" element={<BacklogPage />} />
        <Route path="workshop" element={<WorkshopPage />} />
        <Route path="command-tower" element={<CommandTowerPage />} />
        <Route path="project/:id" element={<ProjectDetailsPage />} />
        <Route path="settings" element={<div className="text-h2">{t('settings.title')}</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
