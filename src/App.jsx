import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  const { t } = useTranslation();
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
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
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
