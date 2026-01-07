import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import InspirationModule from './features/lifecycle/Inspiration/InspirationModule';
import PendingModule from './features/lifecycle/Pending/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDev/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDev/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDev/AdvancedDevModule';
import CommercialModule from './features/lifecycle/Commercial/CommercialModule';
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
        <div className="flex flex-col h-screen bg-[#f8f9fa] text-slate-900 overflow-hidden">
            {/* Dynamic Navigation */}
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
                <div className="max-w-5xl mx-auto h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
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
