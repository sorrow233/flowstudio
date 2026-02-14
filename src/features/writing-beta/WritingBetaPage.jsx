import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Feather,
    Save,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * WritingBetaPage - 全新的写作测试页面
 * 重点：极简、专注、美观
 */
const WritingBetaPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    // 计算字数
    useEffect(() => {
        const text = content.trim();
        setWordCount(text ? text.length : 0);
    }, [content]);

    // 模拟保存
    const handleSave = async () => {
        if (!title && !content) {
            toast.error('内容为空，无法保存');
            return;
        }

        setIsSaving(true);
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        const now = new Date();
        setLastSaved(now);
        setIsSaving(false);
        toast.success('已存至本地草稿');
    };

    const handleClear = () => {
        if (window.confirm('确定要清空当前内容吗？此操作不可撤销。')) {
            setTitle('');
            setContent('');
            setLastSaved(null);
            toast.info('已重置');
        }
    };

    return (
        <div className={`flex flex-col h-full transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-white dark:bg-gray-950 p-8' : 'py-6'}`}>
            {/* 头部装饰 & 状态 */}
            {!isFullscreen && (
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-3xl border border-slate-200/60 bg-white/50 dark:border-slate-800/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
                                <Feather size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                    写作 Beta
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    沉浸式写作实验室 · 迭代版本 1.0.0
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    {isSaving ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="text-indigo-500"
                                            >
                                                <Clock size={14} />
                                            </motion.div>
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">保存中...</span>
                                        </>
                                    ) : lastSaved ? (
                                        <>
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                最后保存: {lastSaved.toLocaleTimeString()}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} className="text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">未保存草稿</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* 编辑区域 */}
            <motion.div
                layout
                className={`flex-1 flex flex-col relative group ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}
            >
                {/* 悬浮工具栏 */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 transition-colors shadow-sm"
                        title={isFullscreen ? '退出全屏' : '全屏专注'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                        title="清空内容"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-2 px-4 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Save size={18} />
                        <span className="text-sm">保存</span>
                    </button>
                </div>

                {/* 标题输入 */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入标题..."
                    className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder-slate-300 dark:placeholder-slate-700 mb-6 px-2"
                />

                {/* 正文输入 */}
                <div className="flex-1 relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="开启你的创作之旅..."
                        className="w-full h-full text-lg leading-relaxed bg-transparent border-none focus:ring-0 placeholder-slate-200 dark:placeholder-slate-800 resize-none px-2 no-scrollbar"
                    />

                    {/* 底部信息提示 */}
                    <div className="absolute bottom-4 left-2 flex items-center gap-4 text-xs font-medium text-slate-400 lowercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <BookOpen size={14} />
                            <span>{wordCount} 字</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>约 {Math.ceil(wordCount / 500)} 分钟阅读</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 全屏退出提示 */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur text-white/60 text-[10px] uppercase tracking-widest pointer-events-none"
                    >
                        按右上角按钮或手动点击退出专注模式
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingBetaPage;
