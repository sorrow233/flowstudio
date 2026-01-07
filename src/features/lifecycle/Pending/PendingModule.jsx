import React from 'react';

const PendingModule = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4 text-slate-900">待开发</h1>
                <p className="text-xl text-slate-700">规划即将进行的功能，让创意落地。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                    <p className="text-lg">暂无待开发任务</p>
                    <button className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
                        添加任务
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingModule;
