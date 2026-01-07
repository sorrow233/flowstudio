import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import InspirationModule from './features/lifecycle/InspirationModule';
import PendingModule from './features/lifecycle/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDevModule';
import CommercialModule from './features/lifecycle/CommercialModule';
import CommandCenterModule from './features/commands/CommandCenterModule';

function App() {
    const [activeTab, setActiveTab] = useState('inspiration');

    const renderContent = () => {
        switch (activeTab) {
            case 'inspiration': return <InspirationModule />;
            case 'pending': return <PendingModule />;
            case 'primary': return <PrimaryDevModule />;
            case 'final': return <FinalDevModule />;
            case 'advanced': return <AdvancedDevModule />;
            case 'commercial': return <CommercialModule />;
            case 'command': return <CommandCenterModule />;
            default: return <InspirationModule />;
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/50">
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 overflow-y-auto w-full no-scrollbar">
                <div className="max-w-7xl mx-auto h-full px-4 md:px-6 pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
