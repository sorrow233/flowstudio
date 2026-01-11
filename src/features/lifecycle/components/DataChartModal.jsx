import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp } from 'lucide-react';

const DataChartModal = ({ isOpen, onClose, data }) => {
    const [view, setView] = useState('daily'); // daily, weekly, monthly

    const currentData = useMemo(() => {
        if (!data) return [];
        if (view === 'daily') return data.daily;
        if (view === 'weekly') return data.weekly;
        if (view === 'monthly') return data.monthly;
        return [];
    }, [data, view]);

    const maxVal = useMemo(() => {
        const values = currentData.map(d => d.value);
        return Math.max(...values, 10); // Minimum max of 10 for better scaling
    }, [currentData]);

    // Chart Dimensions
    const width = 600;
    const height = 300;
    const padding = 40;

    const points = useMemo(() => {
        if (currentData.length === 0) return '';
        return currentData.map((d, i) => {
            const x = padding + (i / (currentData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxVal) * (height - padding * 2);
            return { x, y, value: d.value, label: d.label };
        });
    }, [currentData, maxVal, width, height, padding]);

    const pathData = useMemo(() => {
        if (points.length < 2) return '';
        return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }, [points]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-light text-gray-900 dark:text-white">数据处理详情</h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-light">文字处理动态趋势回顾</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Toggles */}
                                <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl mr-4">
                                    {['daily', 'weekly', 'monthly'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            className={`
                                                px-3 py-1.5 text-[10px] rounded-lg transition-all duration-300 uppercase tracking-tighter
                                                ${view === v
                                                    ? 'bg-white dark:bg-gray-700 text-indigo-500 shadow-sm font-bold'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                                            `}
                                        >
                                            {v === 'daily' ? '日' : v === 'weekly' ? '周' : '月'}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="bg-gray-50/50 dark:bg-gray-950/20 rounded-[2rem] p-6 border border-gray-50 dark:border-gray-800/30">
                            <div className="relative h-[300px] w-full">
                                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                                    {/* Grid Lines (Simple) */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                                        <line
                                            key={r}
                                            x1={padding}
                                            y1={padding + r * (height - padding * 2)}
                                            x2={width - padding}
                                            y2={padding + r * (height - padding * 2)}
                                            stroke="currentColor"
                                            className="text-gray-100 dark:text-gray-800/50"
                                            strokeDasharray="4 4"
                                        />
                                    ))}

                                    {/* Main Line Path */}
                                    <motion.path
                                        d={pathData}
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />

                                    {/* Gradient Definition */}
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>

                                    {/* Dots */}
                                    {points.map((p, i) => (
                                        <g key={i} className="group cursor-help">
                                            <motion.circle
                                                cx={p.x}
                                                cy={p.y}
                                                r="4"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5 + i * 0.05 }}
                                                className="fill-white dark:fill-gray-900 stroke-indigo-500 stroke-[2px]"
                                            />
                                            {/* Tooltip on hover */}
                                            <foreignObject x={p.x - 25} y={p.y - 45} width="80" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-indigo-600 text-white text-[9px] px-2 py-1 rounded shadow-lg text-center font-bold">
                                                    {p.value}
                                                </div>
                                            </foreignObject>
                                        </g>
                                    ))}

                                    {/* Axis Labels (X) */}
                                    {points.filter((_, i) => i % (view === 'daily' ? 2 : 1) === 0).map((p, i) => (
                                        <text
                                            key={i}
                                            x={p.x}
                                            y={height - 10}
                                            textAnchor="middle"
                                            className="text-[9px] fill-gray-400 dark:fill-gray-600 font-light"
                                        >
                                            {p.label}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* Footer Hint */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-light italic">
                            <TrendingUp size={12} className="text-indigo-400" />
                            <span>这是你与灵感共鸣的数字写照</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DataChartModal;
