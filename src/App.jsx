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
import Dashboard from '@/pages/Dashboard';
import BacklogPage from '@/modules/backlog/BacklogPage';
import WorkshopPage from '@/modules/workshop/WorkshopPage';
import CommandTowerPage from '@/modules/command-tower/CommandTowerPage';

function App() {
  const { t } = useTranslation();
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
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
              <Route path="settings" element={<div className="text-h2">{t('settings.title')}</div>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
