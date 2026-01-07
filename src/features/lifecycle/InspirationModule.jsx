import React, { useState, useEffect } from 'react';
import { Send, Trash2, Sparkles, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'flowstudio_inspiration_ideas';

const InspirationModule = () => {
    const [ideas, setIdeas] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setIdeas(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse ideas", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    }, [ideas]);

    const handleAdd = () => {
        if (!input.trim()) return;
        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            timestamp: Date.now(),
        };
        setIdeas([newIdea, ...ideas]);
        setInput('');
    };

    const handleDelete = (id) => {
        setIdeas(ideas.filter(i => i.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
                    灵感迸发
                </h2>
                <p className="text-gray-500">
                    捕捉瞬时的巧思，为未来的项目积蓄能量。
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="写下你的想法... (⌘ + Enter 发送)"
                    className="w-full min-h-[100px] p-2 text-lg outline-none resize-none placeholder:text-gray-300"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleAdd();
                        }
                    }}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">支持 Markdown 格式</span>
                    <button
                        onClick={handleAdd}
                        disabled={!input.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200"
                    >
                        <Send size={16} />
                        记录
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {ideas.map((idea) => (
                        <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-100 to-orange-100 flex items-center justify-center text-rose-500">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Idea</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(idea.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{idea.content}</p>
                            <div className="mt-4 text-xs text-gray-300">
                                {new Date(idea.timestamp).toLocaleString()}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {ideas.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Sparkles size={32} />
                        </div>
                        <p className="text-gray-400">暂无灵感，快去记录第一个想法吧！</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InspirationModule;
