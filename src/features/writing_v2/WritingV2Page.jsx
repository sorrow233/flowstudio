import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Sparkles, Send, History, Settings, ChevronRight } from 'lucide-react';

const WritingV2Page = () => {
    return (
        <div className="min-h-full py-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-200 dark:border-indigo-800/50">
                            Beta 2.0.0
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs">Writing Lab</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white">
                        写作实验室 V2
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl">
                        全新一代智能写作引擎，探索思想与文字的最佳汇合点。此版本专注于沉浸式体验与 AI 深度辅助。
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                        <History size={18} />
                        <span className="text-sm font-medium">历史记录</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                        <Send size={18} />
                        <span className="text-sm font-medium">发布内容</span>
                    </button>
                </div>
            </div>

            {/* Main Editor Area Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-h-[500px] rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none p-8 relative overflow-hidden group"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                            <Edit3 size={240} className="rotate-12" />
                        </div>

                        <div className="relative h-full flex flex-col">
                            <input
                                type="text"
                                placeholder="输入一个引人入胜的标题..."
                                className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 mb-6"
                            />

                            <textarea
                                placeholder="开始你的创作之旅，让灵感自由流动..."
                                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            ></textarea>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-gray-400 dark:text-gray-500 text-sm">
                                <div className="flex gap-4">
                                    <span>字数: 0</span>
                                    <span>阅读耗时: 0m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-500/10"></div>
                                    <span>云端已同步</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/20"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={20} className="text-indigo-200" />
                            <h3 className="font-bold">AI 创作助手</h3>
                        </div>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            需要灵感吗？让我帮你构思大纲、润色文字或寻找素材。
                        </p>
                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2 text-sm font-medium backdrop-blur-md">
                            唤醒助手 <ChevronRight size={16} />
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">配置选项</h3>
                            <Settings size={18} className="text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-sm text-gray-600 dark:text-gray-300">自动保存</span>
                                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 opacity-50">
                                <span className="text-sm text-gray-600 dark:text-gray-300">禅模式 (制作中)</span>
                                <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WritingV2Page;
