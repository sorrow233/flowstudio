import React, { useState, useEffect } from 'react';
import { Send, Trash2, ArrowRight, Copy, Check, Sparkles, Hash, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';

const STORAGE_KEY = 'flowstudio_inspiration_ideas';

const InspirationModule = () => {
    // Sync
    const { doc } = useSyncStore('flowstudio_v1');
    const {
        projects: ideas,
        addProject: addIdea,
        removeProject: removeIdea
    } = useSyncedProjects(doc, 'inspiration');

    // Fetch existing projects for tags
    const { projects: primaryProjects } = useSyncedProjects(doc, 'primary_projects');
    const { projects: pendingProjects } = useSyncedProjects(doc, 'pending_projects');

    const [input, setInput] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // Migration: LocalStorage -> Yjs
    useEffect(() => {
        const STORAGE_KEY = 'flowstudio_inspiration_ideas';
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && doc) {
            try {
                const localIdeas = JSON.parse(saved);
                if (Array.isArray(localIdeas) && localIdeas.length > 0) {
                    console.info("Migrating Inspiration ideas to Sync...");
                    // We only migrate if Sync data is empty to avoid duplicates
                    const yArray = doc.getArray('inspiration');
                    if (yArray.length === 0) {
                        localIdeas.forEach(idea => addIdea(idea));
                    }
                    // Clear local storage after migration? Or keep as backup? 
                    // Let's rename key to avoid re-migration
                    localStorage.setItem(STORAGE_KEY + '_migrated', 'true');
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                console.error("Migration failed", e);
            }
        }
    }, [doc, addIdea]);

    const handleAdd = () => {
        if (!input.trim()) return;
        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            timestamp: Date.now(),
        };
        addIdea(newIdea);
        setInput('');
    };

    const handleCopy = async (content, id) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleTagClick = (projectTitle) => {
        const tag = `[${projectTitle}] `;
        setInput(prev => prev + tag);
    };

    // Combine and sort projects for tags
    const allProjectTags = [...(primaryProjects || []), ...(pendingProjects || [])]
        .map(p => p.title)
        .filter(t => t && t.trim().length > 0)
        .sort();

    return (
        <div className="max-w-4xl mx-auto pt-14 px-6 md:px-10 pb-32">
            {/* Header Section */}
            <div className="mb-14 text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight">
                        Inspiration
                    </h2>
                </div>
                <p className="text-gray-500 text-base font-light tracking-wide max-w-md mx-auto md:mx-0 leading-relaxed">
                    捕捉瞬时灵感，为未来积蓄能量。
                </p>
            </div>

            {/* Input Section */}
            <div className="relative mb-20 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] group-hover:border-gray-200">

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="记录一闪而过的念头..."
                        className="w-full bg-transparent text-lg text-gray-800 placeholder:text-gray-300 outline-none p-6 pb-20 min-h-[140px] resize-none font-light leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleAdd();
                            }
                        }}
                    />

                    {/* Bottom Action Area */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        {/* Project Tags Bar */}
                        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 mr-4 mask-linear-fade">
                            {allProjectTags.length > 0 && (
                                <>
                                    <Hash size={14} className="text-gray-300 flex-shrink-0" />
                                    {allProjectTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagClick(tag)}
                                            className="flex-shrink-0 px-3 py-1 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-full text-[11px] font-medium transition-colors border border-emerald-100/50 hover:border-emerald-200 whitespace-nowrap shadow-sm"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] text-gray-300 font-mono hidden md:inline-block">
                                CMD + ENTER
                            </span>
                            <button
                                onClick={handleAdd}
                                disabled={!input.trim()}
                                className="flex items-center justify-center p-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-900 transition-all duration-300 active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <ArrowRight size={18} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {ideas.sort((a, b) => b.timestamp - a.timestamp).map((idea) => (
                        <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            layout
                            className="group relative bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start gap-6">
                                <div className="text-gray-700 text-base font-light leading-7 whitespace-pre-wrap flex-grow font-sans">
                                    {(() => {
                                        // Simple parser for [Tag] pattern
                                        const parts = idea.content.split(/(\[.*?\])/g);
                                        return parts.map((part, index) => {
                                            if (part.match(/^\[(.*?)\]$/)) {
                                                const tagName = part.slice(1, -1); // Remove [ and ]
                                                return (
                                                    <span
                                                        key={index}
                                                        className="inline-block px-2 py-0.5 mx-1 first:ml-0 bg-emerald-50 text-emerald-600 rounded-md text-[11px] font-medium align-middle border border-emerald-100/50 shadow-sm transform -translate-y-0.5"
                                                    >
                                                        {tagName}
                                                    </span>
                                                );
                                            }
                                            return <span key={index}>{part}</span>;
                                        });
                                    })()}
                                </div>
                                <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleCopy(idea.content, idea.id)}
                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                                        title="Copy to clipboard"
                                    >
                                        {copiedId === idea.id ? (
                                            <Check size={16} className="text-emerald-500" strokeWidth={2} />
                                        ) : (
                                            <Copy size={16} strokeWidth={1.5} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => removeIdea(idea.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                                    {new Date(idea.timestamp || Date.now()).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                    <span className="mx-2 text-gray-200">|</span>
                                    {new Date(idea.timestamp || Date.now()).toLocaleTimeString(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {ideas.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-400 text-sm font-light tracking-wide">
                            暂无灵感，记录下第一个想法吧
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default InspirationModule;
