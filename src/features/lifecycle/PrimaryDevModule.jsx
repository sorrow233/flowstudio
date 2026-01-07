import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, GitBranch, Layers, PlayCircle } from 'lucide-react';

const PrimaryDevModule = () => {
    return (
        <div className="max-w-6xl mx-auto pt-10 px-6">
            <div className="mb-12">
                <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                    Primary Dev
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide">
                    Where saplings become trees. MVP Construction.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Items for Graduated Projects */}
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-100 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Code2 size={24} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Alpha {i}</h3>
                        <div className="flex items-center gap-4 text-gray-400 text-xs font-medium">
                            <span className="flex items-center gap-1">
                                <GitBranch size={12} />
                                master
                            </span>
                            <span className="flex items-center gap-1">
                                <Layers size={12} />
                                v0.1.0
                            </span>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
                            </div>
                            <span className="text-xs text-blue-500 font-medium">33%</span>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New */}
                <div className="border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-300 hover:border-gray-200 hover:text-gray-400 transition-colors cursor-default min-h-[200px]">
                    <PlayCircle size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-light">Complete 'Pending' to unlock</span>
                </div>
            </div>
        </div>
    );
};

export default PrimaryDevModule;
