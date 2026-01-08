import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import InspirationModule from './features/lifecycle/InspirationModule';
import PendingModule from './features/lifecycle/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDevModule';
import CommercialModule from './features/lifecycle/CommercialModule';
import CommandCenterModule from './features/commands/CommandCenterModule';

import { Toaster } from 'sonner';

function App() {
    const location = useLocation();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/50">
            <Toaster position="top-right" richColors />
            <Navbar />

            <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                <div className="max-w-7xl mx-auto h-full px-4 md:px-6 pb-20">
                    <ErrorBoundary>
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<Navigate to="/inspiration" replace />} />
                            <Route path="/inspiration" element={<InspirationModule />} />
                            <Route path="/pending" element={<PendingModule />} />
                            <Route path="/primary" element={<PrimaryDevModule />} />
                            <Route path="/final" element={<FinalDevModule />} />
                            <Route path="/advanced" element={<AdvancedDevModule />} />
                            <Route path="/commercial" element={<CommercialModule />} />
                            <Route path="/commands" element={<CommandCenterModule />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
}

export default App;
