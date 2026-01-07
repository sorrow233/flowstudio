import React from 'react';

const CommercialModule = () => {
    return (
        <div className="glass-card h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <h2 className="text-xl font-bold">商业化阶段</h2>
            </div>
            <p className="text-sm text-slate-400">准备上线、变现方案以及市场化推广。</p>
            <div className="flex-1 border-t border-white/10 pt-4">
                {/* Module Content */}
            </div>
        </div>
    );
};

export default CommercialModule;
