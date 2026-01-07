import React from 'react';

const PrimaryDevModule = () => {
    return (
        <div className="glass-card h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <h2 className="text-xl font-bold">初级开发阶段</h2>
            </div>
            <p className="text-sm text-slate-400">构建核心逻辑，实现 MVP 基础功能。</p>
            <div className="flex-1 border-t border-white/10 pt-4">
                {/* Module Content */}
            </div>
        </div>
    );
};

export default PrimaryDevModule;
