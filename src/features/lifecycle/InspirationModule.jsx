import React, { useState, useEffect } from 'react';
import { Send, Trash2, ArrowRight, Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'flowstudio_inspiration_ideas';


const CREATIVE_SPARKS = [
    "What if this problem was a game?",
    "Simplify it until it breaks, then add one thing back.",
    "How would a child explain this feature?",
    "What is the 'Magic Moment' for the user?",
    "Invert the core assumption.",
    "Make it tactile.",
    "What would Apple do?",
    "Remove the friction.",
    "Design for the expert, bridge for the novice.",
    "Add a delight layer."
];

const InspirationModule = () => {
    const [ideas, setIdeas] = useState([]);
    const [input, setInput] = useState('');
    const [spark, setSpark] = useState('');

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

    const generateSpark = () => {
        const random = CREATIVE_SPARKS[Math.floor(Math.random() * CREATIVE_SPARKS.length)];
        setSpark(random);
    };

    return (
        <div className="max-w-4xl mx-auto pt-10 px-6 min-h-screen relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-50/50 to-transparent -z-10 opacity-60" />
            <div className="fixed top-20 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="mb-12 text-center md:text-left">
                <h2 className="text-3xl font-thin text-gray-900 mb-2 tracking-tight flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <Lightbulb size={20} className="fill-purple-600/20" />
                    </div>
                    Inspiration
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide md:pl-14">
                    捕捉瞬时灵感，为未来积蓄能量
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                {/* Left Column: Input & Spark */}
                <div className="md:col-span-2 space-y-8">
                    {/* Input Area */}
                    <div className="relative group bg-white border border-purple-100 shadow-xl shadow-purple-500/5 rounded-3xl p-6 transition-all focus-within:ring-2 focus-within:ring-purple-100">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="此刻在想什么？..."
                            className="w-full bg-transparent text-lg text-gray-800 placeholder:text-gray-300 border-none focus:ring-0 outline-none resize-none h-32 font-light leading-relaxed scrollbar-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleAdd();
                                }
                            }}
                        />
                        <div className="flex justify-between items-center mt-4 border-t border-gray-50 pt-4">
                            <span className="text-[10px] text-gray-300 font-mono">CMD + ENTER TO SAVE</span>
                            <button
                                onClick={handleAdd}
                                disabled={!input.trim()}
                                className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-black hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-lg shadow-gray-200"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Stream of Ideas */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Stream</h3>
                        <AnimatePresence mode="popLayout">
                            {ideas.map((idea) => (
                                <motion.div
                                    key={idea.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                    className="group relative bg-white/50 hover:bg-white border border-transparent hover:border-purple-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
                                >
                                    <p className="text-gray-700 text-base font-light leading-7 whitespace-pre-wrap">{idea.content}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">
                                            {new Date(idea.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(idea.id)}
                                            className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {ideas.length === 0 && (
                            <div className="py-20 text-center opacity-40">
                                <Sparkles size={32} className="mx-auto mb-3 text-purple-300" />
                                <span className="text-sm font-light text-gray-400">暂无灵感记录</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Creative Spark */}
                <div className="md:col-span-1">
                    <div className="sticky top-10">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full min-h-[200px] justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 opacity-80">
                                        <Sparkles size={16} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Creative Spark</span>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={spark || 'intro'}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-2xl font-serif leading-tight"
                                        >
                                            {spark || "Need a nudge?"}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={generateSpark}
                                    className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group transition-all"
                                >
                                    <span className="text-sm font-medium">Ignite</span>
                                    <RefreshCw size={16} className={`${spark ? 'group-hover:rotate-180' : ''} transition-transform duration-500`} />
                                </button>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 opacity-60 hover:opacity-100 transition-opacity">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Did you know?</h4>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">
                                Great ideas often come from combining two unrelated concepts. Try listing your problem alongside a random object.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspirationModule;
