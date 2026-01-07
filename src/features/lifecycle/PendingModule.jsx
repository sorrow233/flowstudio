import React from 'react';

const PendingModule = () => {
    return (
        <div className="max-w-3xl mx-auto pt-10 px-6">
            <div className="mb-12">
                <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                    Pending
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide">
                    待开发任务队列
                </p>
            </div>
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-300 font-light text-sm">暂无待办项</p>
            </div>
        </div>
    );
};

export default PendingModule;
