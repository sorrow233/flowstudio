import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import InspirationModule from './features/lifecycle/InspirationModule';
import PendingModule from './features/lifecycle/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDevModule';
import CommercialModule from './features/lifecycle/CommercialModule';
import CommandCenterModule from './features/commands/CommandCenterModule';

import { useSyncStore, useDataMigration } from './features/sync/useSyncStore';

function App() {
    const location = useLocation();

    // --- Global Sync & Migration ---
    const { doc } = useSyncStore('flowstudio_v1');
    useDataMigration(doc);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/50">
            <Navbar />

            <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                <div className="max-w-7xl mx-auto h-full px-4 md:px-6 pb-20">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<Navigate to="/inspiration" replace />} />
                            <Route path="/inspiration" element={<PageWrapper><InspirationModule /></PageWrapper>} />
                            <Route path="/pending" element={<PageWrapper><PendingModule /></PageWrapper>} />
                            <Route path="/primary" element={<PageWrapper><PrimaryDevModule /></PageWrapper>} />
                            <Route path="/final" element={<PageWrapper><FinalDevModule /></PageWrapper>} />
                            <Route path="/advanced" element={<PageWrapper><AdvancedDevModule /></PageWrapper>} />
                            <Route path="/commercial" element={<PageWrapper><CommercialModule /></PageWrapper>} />
                            <Route path="/commands" element={<PageWrapper><CommandCenterModule /></PageWrapper>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Wrapper to handle page transitions consistently
const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="h-full"
    >
        {children}
    </motion.div>
);

export default App;
