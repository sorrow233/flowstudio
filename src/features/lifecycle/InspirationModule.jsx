import React, { useState, useEffect } from 'react';
import { Send, Trash2, ArrowRight } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto pt-10 px-6">
            <div className="mb-12">
                <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                    Inspiration
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide">
                    捕捉瞬时灵感，为未来积蓄能量
                </p>
            </div>

            <div className="relative mb-16 group">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="在此记录想法..."
                    className="w-full bg-transparent text-lg text-gray-800 placeholder:text-gray-300 border-b border-gray-200 focus:border-gray-800 outline-none py-4 transition-colors resize-none h-24 font-light leading-relaxed"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleAdd();
                        }
                    }}
                />
                <div className="absolute bottom-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handleAdd}
                        disabled={!input.trim()}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30"
                    >
                        <ArrowRight size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="space-y-8 pb-20">
                <AnimatePresence mode="popLayout">
                    {ideas.map((idea) => (
                        <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            layout
                            className="group relative border-l-2 border-transparent hover:border-gray-900 pl-6 py-1 transition-all duration-500"
                        >
                            <p className="text-gray-700 text-base font-light leading-7 whitespace-pre-wrap">{idea.content}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">
                                    {new Date(idea.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    onClick={() => handleDelete(idea.id)}
                                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} strokeWidth={1.5} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {ideas.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <span className="text-sm font-light text-gray-400">暂无内容</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InspirationModule;
