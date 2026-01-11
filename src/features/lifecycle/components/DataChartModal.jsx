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

    const maxWords = useMemo(() => {
        const values = currentData.map(d => d.value);
        return Math.max(...values, 10);
    }, [currentData]);

    const maxInspirations = useMemo(() => {
        const values = currentData.map(d => d.inspirations);
        return Math.max(...values, 5);
    }, [currentData]);

    // Chart Dimensions
    const width = 600;
    const height = 300;
    const padding = 40;

    const wordPoints = useMemo(() => {
        if (currentData.length === 0) return [];
        return currentData.map((d, i) => {
            const x = padding + (i / (currentData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxWords) * (height - padding * 2);
            return { x, y, value: d.value, label: d.label };
        });
    }, [currentData, maxWords, width, height, padding]);

    const inspirationPoints = useMemo(() => {
        if (currentData.length === 0) return [];
        return currentData.map((d, i) => {
            const x = padding + (i / (currentData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.inspirations / maxInspirations) * (height - padding * 2);
            return { x, y, value: d.inspirations, label: d.label };
        });
    }, [currentData, maxInspirations, width, height, padding]);

    const wordPathData = useMemo(() => {
        if (wordPoints.length < 2) return '';
        return `M ${wordPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }, [wordPoints]);

    const inspirationPathData = useMemo(() => {
        if (inspirationPoints.length < 2) return '';
        return `M ${inspirationPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }, [inspirationPoints]);

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
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-light text-gray-900 dark:text-white">数据处理详情</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-light">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2h-0.5 border-b-2 border-indigo-500 w-3" />
                                                <span className="text-gray-400">文字</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-0.5 border-b-2 border-pink-500 w-3" />
                                                <span className="text-gray-400">灵感</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1">处理总量与灵感采集的历史趋势</p>
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
                                    {/* Grid Lines */}
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

                                    {/* Inspiration Line (Behind) */}
                                    <motion.path
                                        d={inspirationPathData}
                                        fill="none"
                                        stroke="#f472b6"
                                        strokeWidth="2"
                                        strokeOpacity="0.6"
                                        strokeLinecap="round"
                                        strokeDasharray="5 5"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.6 }}
                                        transition={{ duration: 1 }}
                                    />

                                    {/* Word Line (Front) */}
                                    <motion.path
                                        d={wordPathData}
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />

                                    {/* Word Dots */}
                                    {wordPoints.map((p, i) => (
                                        <g key={`w-${i}`} className="group cursor-help">
                                            <motion.circle
                                                cx={p.x}
                                                cy={p.y}
                                                r="4"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5 + i * 0.05 }}
                                                className="fill-white dark:fill-gray-900 stroke-indigo-500 stroke-[2.5px]"
                                            />
                                            <foreignObject x={p.x - 25} y={p.y - 45} width="80" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-indigo-600 text-white text-[9px] px-2 py-1 rounded shadow-lg text-center font-bold">
                                                    {p.value} 字
                                                </div>
                                            </foreignObject>
                                        </g>
                                    ))}

                                    {/* Inspiration Dots */}
                                    {inspirationPoints.map((p, i) => (
                                        <g key={`i-${i}`} className="group cursor-help">
                                            <motion.circle
                                                cx={p.x}
                                                cy={p.y}
                                                r="3"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.8 + i * 0.05 }}
                                                className="fill-white dark:fill-gray-900 stroke-pink-400 stroke-[2px]"
                                            />
                                            <foreignObject x={p.x - 25} y={p.y + 15} width="80" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-pink-500 text-white text-[9px] px-2 py-1 rounded shadow-lg text-center font-bold">
                                                    {p.value} 灵感
                                                </div>
                                            </foreignObject>
                                        </g>
                                    ))}

                                    {/* Axis Labels (X) */}
                                    {wordPoints.filter((_, i) => i % (view === 'daily' ? 2 : 1) === 0).map((p, i) => (
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
                        <div className="mt-8 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-light italic px-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={12} className="text-indigo-400" />
                                <span>这是你与灵感共鸣的数字写照</span>
                            </div>
                            <div className="text-[10px] opacity-50 not-italic">
                                数据基于本地创作时间戳实时聚合
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DataChartModal;
