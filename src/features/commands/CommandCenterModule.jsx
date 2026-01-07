import React from 'react';

const CommandCenterModule = () => {
    return (
        <div className="glass-card h-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <h2 className="text-xl font-bold">指令管理</h2>
            </div>
            <p className="text-sm text-slate-400">管理系统捷径、脚本和 AI 指令集。</p>
            <div className="flex-1 border-t border-white/10 pt-4">
                {/* Module Content */}
            </div>
        </div>
    );
};

export default CommandCenterModule;
