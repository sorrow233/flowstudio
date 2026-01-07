import React from 'react';

const CommandCenterModule = () => {
    return (
        <div className="max-w-3xl mx-auto pt-10 px-6">
            <div className="mb-12">
                <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                    Command Center
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide">
                    指令与配置管理
                </p>
            </div>
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-300 font-light text-sm">配置中</p>
            </div>
        </div>
    );
};

export default CommandCenterModule;
