import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import IncubatorPage from '@/modules/incubator/IncubatorPage';
import VisionStudioPage from '@/modules/vision-studio/VisionStudioPage';
import CommandTowerPage from '@/modules/command-tower/CommandTowerPage';
import ArchivePage from '@/modules/archive/ArchivePage';

function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="incubator" element={<IncubatorPage />} />
          <Route path="vision-studio" element={<VisionStudioPage />} />
          <Route path="command-tower" element={<CommandTowerPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="settings" element={<div className="text-h2">{t('settings.title')}</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
