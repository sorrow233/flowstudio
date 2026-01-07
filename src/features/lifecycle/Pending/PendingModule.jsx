import React from 'react';

const PendingModule = () => {
    return (
        <div className="glass-card h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <h2 className="text-xl font-bold">待开发阶段</h2>
            </div>
            <p className="text-sm text-slate-400">规划即将进行的功能和任务，排定优先级。</p>
            <div className="flex-1 border-t border-white/10 pt-4">
                {/* Module Content */}
            </div>
        </div>
    );
};

export default PendingModule;
