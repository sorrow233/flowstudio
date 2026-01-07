import React, { useState, useEffect } from 'react';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'flowstudio_inspirations';

const InspirationModule = () => {
    const [ideas, setIdeas] = useState([]);
    const [input, setInput] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setIdeas(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load inspirations:', e);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    }, [ideas]);

    const handleAddIdea = () => {
        if (!input.trim()) return;

        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            createdAt: new Date().toISOString(),
        };

        setIdeas([newIdea, ...ideas]);
        setInput('');
    };

    const handleDeleteIdea = (id) => {
        setIdeas(ideas.filter((idea) => idea.id !== id));
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 flex items-center gap-3">
                    <Sparkles className="text-yellow-500" size={28} />
                    灵感迸发
                </h1>
                <p className="text-lg text-slate-500">捕捉你脑海中一闪而过的想法，别让它们溜走。</p>
            </div>

            {/* Input Area */}
            <div className="relative mb-10">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <textarea
                        className="w-full bg-transparent border-none focus:outline-none text-base text-slate-700 min-h-[100px] resize-none placeholder:text-slate-400"
                        placeholder="此刻有什么灵感？记录下来..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) {
                                handleAddIdea();
                            }
                        }}
                    />
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">⌘ + Enter 快速发送</span>
                        <button
                            onClick={handleAddIdea}
                            disabled={!input.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                            记录灵感
                        </button>
                    </div>
                </div>
            </div>

            {/* Ideas List */}
            {ideas.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">还没有任何灵感</p>
                    <p className="text-sm mt-1">在上方输入框中记录你的第一个想法吧！</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ideas.map((idea) => (
                        <div
                            key={idea.id}
                            className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm group hover:shadow-md transition-shadow"
                        >
                            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{idea.content}</p>
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                                <span className="text-xs text-slate-400">{formatDate(idea.createdAt)}</span>
                                <button
                                    onClick={() => handleDeleteIdea(idea.id)}
                                    className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InspirationModule;
