import React from 'react';
import InspirationModule from './features/lifecycle/Inspiration/InspirationModule';
import PendingModule from './features/lifecycle/Pending/PendingModule';
import PrimaryDevModule from './features/lifecycle/PrimaryDev/PrimaryDevModule';
import FinalDevModule from './features/lifecycle/FinalDev/FinalDevModule';
import AdvancedDevModule from './features/lifecycle/AdvancedDev/AdvancedDevModule';
import CommercialModule from './features/lifecycle/Commercial/CommercialModule';
import CommandCenterModule from './features/commands/CommandCenterModule';

function App() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Flow Studio Lifecycle Manager
                </h1>
                <p className="text-slate-400 text-sm">7 个独立模块的端到端管理</p>
            </header>

            {/* Main Grid */}
            <main className="flex-1 overflow-x-auto p-6 bg-[#0f172a]">
                <div className="flex gap-6 h-full min-w-max">
                    {/* Module 1: Inspiration */}
                    <section className="w-80 h-full">
                        <InspirationModule />
                    </section>

                    {/* Module 2: Pending */}
                    <section className="w-80 h-full">
                        <PendingModule />
                    </section>

                    {/* Module 3: Primary Dev */}
                    <section className="w-80 h-full">
                        <PrimaryDevModule />
                    </section>

                    {/* Module 4: Final Dev */}
                    <section className="w-80 h-full">
                        <FinalDevModule />
                    </section>

                    {/* Module 5: Advanced Dev */}
                    <section className="w-80 h-full">
                        <AdvancedDevModule />
                    </section>

                    {/* Module 6: Commercial */}
                    <section className="w-80 h-full">
                        <CommercialModule />
                    </section>

                    {/* Module 7: Command Management */}
                    <section className="w-80 h-full">
                        <CommandCenterModule />
                    </section>
                </div>
            </main>
        </div>
    );
}

export default App;
