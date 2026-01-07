import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import i18n from './i18n';
import App from './App.jsx'

import { queryClient } from './app/query-client';

// Initial language detection from URL
const pathname = window.location.pathname;
const validLangs = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'];
const pathLang = validLangs.find(lang => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`);

if (pathLang) {
  i18n.changeLanguage(pathLang);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
