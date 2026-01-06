import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import BacklogPage from '@/modules/backlog/BacklogPage';
import WorkshopPage from '@/modules/workshop/WorkshopPage';
import CommandTowerPage from '@/modules/command-tower/CommandTowerPage';

function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="workshop" element={<WorkshopPage />} />
          <Route path="command-tower" element={<CommandTowerPage />} />
          <Route path="settings" element={<div className="text-h2">{t('settings.title')}</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
