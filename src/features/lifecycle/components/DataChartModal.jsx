import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp } from 'lucide-react';

const DataChartModal = ({ isOpen, onClose, data }) => {
    const [view, setView] = useState('daily'); // daily, weekly, monthly
    const [showInspiration, setShowInspiration] = useState(false);

    const currentData = useMemo(() => {
        if (!data) return [];
        if (view === 'daily') return data.daily;
        if (view === 'weekly') return data.weekly;
        if (view === 'monthly') return data.monthly;
        return [];
    }, [data, view]);

    // Number formatting helper
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    };

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
                        className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-white/95 dark:bg-gray-950/95 border border-white/20 dark:border-gray-800 shadow-2xl rounded-[2.5rem] overflow-hidden p-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-light text-gray-900 dark:text-white">数据处理详情</h3>
                                        {/* Legend with Toggles */}
                                        <div className="flex items-center gap-3 text-[10px] font-medium tracking-tight">
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <div className="w-2.5 h-0.5 bg-indigo-400 rounded-full" />
                                                <span className="text-gray-500">文字</span>
                                            </div>
                                            <button
                                                onClick={() => setShowInspiration(!showInspiration)}
                                                className={`flex items-center gap-1.5 transition-all duration-300 px-2 py-0.5 rounded-full ${showInspiration ? 'opacity-100 bg-pink-50 dark:bg-pink-900/20' : 'opacity-30 hover:opacity-100'}`}
                                            >
                                                <div className="w-2.5 h-0.5 bg-pink-400 rounded-full" />
                                                <span className={`${showInspiration ? 'text-pink-500' : 'text-gray-500'}`}>灵感</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-light mt-1">处理总量与灵感采集的历史趋势</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Toggles */}
                                <div className="flex bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 mr-2">
                                    {['daily', 'weekly', 'monthly'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            className={`
                                                px-3.5 py-1.5 text-[10px] rounded-xl transition-all duration-500 uppercase tracking-tight
                                                ${view === v
                                                    ? 'bg-white dark:bg-gray-700 text-indigo-500 shadow-md shadow-indigo-100/50 dark:shadow-none font-bold scale-[1.02]'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                                            `}
                                        >
                                            {v === 'daily' ? '日' : v === 'weekly' ? '周' : '月'}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all hover:scale-110 active:scale-95 group"
                                >
                                    <X size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-950/20 rounded-[2.5rem] p-8 border border-gray-100/50 dark:border-gray-800/30">
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
                                            className="text-gray-100 dark:text-gray-800/30"
                                            strokeDasharray="6 6"
                                        />
                                    ))}

                                    {/* Inspiration Line (Conditional) */}
                                    <AnimatePresence>
                                        {showInspiration && (
                                            <motion.path
                                                key="inspiration-line"
                                                d={inspirationPathData}
                                                fill="none"
                                                stroke="#f472b6"
                                                strokeWidth="2"
                                                strokeOpacity="0.4"
                                                strokeLinecap="round"
                                                strokeDasharray="4 6"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.4 }}
                                                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Word Line (Front) */}
                                    <motion.path
                                        d={wordPathData}
                                        fill="none"
                                        stroke="#818cf8"
                                        strokeWidth="2.5"
                                        strokeOpacity="0.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.8 }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />

                                    {/* Word Dots & Persistent Labels */}
                                    {wordPoints.map((p, i) => (
                                        <g key={`w-${i}`} className="group cursor-help">
                                            {/* Persistent Label */}
                                            <text
                                                x={p.x}
                                                y={p.y - 12}
                                                textAnchor="middle"
                                                className="text-[9px] fill-indigo-400/80 dark:fill-indigo-300/60 font-medium tracking-tighter"
                                            >
                                                {formatNumber(p.value)}
                                            </text>

                                            <motion.circle
                                                cx={p.x}
                                                cy={p.y}
                                                r="3"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.4 + i * 0.04 }}
                                                className="fill-white dark:fill-gray-900 stroke-indigo-300 dark:stroke-indigo-700 stroke-[1.5px] group-hover:stroke-indigo-500 transition-colors"
                                            />
                                        </g>
                                    ))}

                                    {/* Inspiration Dots & Labels (Conditional) */}
                                    <AnimatePresence>
                                        {showInspiration && inspirationPoints.map((p, i) => (
                                            <motion.g
                                                key={`i-${i}`}
                                                className="group cursor-help"
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0 }}
                                                transition={{ delay: 0.2 + i * 0.03 }}
                                            >
                                                {/* Persistent Label for Inspiration */}
                                                <text
                                                    x={p.x}
                                                    y={p.y + 16}
                                                    textAnchor="middle"
                                                    className="text-[8px] fill-pink-400/70 dark:fill-pink-300/50 font-medium tracking-tighter"
                                                >
                                                    {p.value}
                                                </text>

                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r="2"
                                                    className="fill-white dark:fill-gray-900 stroke-pink-200 dark:stroke-pink-900 stroke-[1px] group-hover:stroke-pink-400 transition-colors"
                                                />
                                            </motion.g>
                                        ))}
                                    </AnimatePresence>

                                    {/* Axis Labels (X) */}
                                    {wordPoints.filter((_, i) => i % (view === 'daily' ? 2 : 1) === 0).map((p, i) => (
                                        <text
                                            key={i}
                                            x={p.x}
                                            y={height - 10}
                                            textAnchor="middle"
                                            className="text-[9px] fill-gray-300 dark:fill-gray-600 font-light tracking-tighter"
                                        >
                                            {p.label}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* Footer Hint */}
                        <div className="mt-8 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-light italic px-6 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={12} className="text-indigo-300" />
                                <span>Rhythms of Thought</span>
                            </div>
                            <div className="text-[9px] opacity-40 not-italic">
                                Real-time dynamic aggregation
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DataChartModal;
