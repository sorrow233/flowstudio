import React, { useState, useEffect } from 'react';
import { Send, Trash2, ArrowRight, Copy, Check, Lightbulb, Hash, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';

const STORAGE_KEY = 'flowstudio_inspiration_ideas';

// Refined Color Configuration for "Elegant and Faint" look
const COLOR_CONFIG = [
    {
        id: 'emerald',
        dot: 'bg-emerald-400',
        glow: 'group-hover:ring-emerald-500/10 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]',
        border: 'hover:border-emerald-200 dark:hover:border-emerald-800/50'
    },
    {
        id: 'amber',
        dot: 'bg-amber-400',
        glow: 'group-hover:ring-amber-500/10 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]',
        border: 'hover:border-amber-200 dark:hover:border-amber-800/50'
    },
    {
        id: 'violet',
        dot: 'bg-violet-400',
        glow: 'group-hover:ring-violet-500/10 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]',
        border: 'hover:border-violet-200 dark:hover:border-violet-800/50'
    },
    {
        id: 'blue',
        dot: 'bg-blue-400',
        glow: 'group-hover:ring-blue-500/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]',
        border: 'hover:border-blue-200 dark:hover:border-blue-800/50'
    },
    {
        id: 'rose',
        dot: 'bg-rose-400',
        glow: 'group-hover:ring-rose-500/10 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.05)]',
        border: 'hover:border-rose-200 dark:hover:border-rose-800/50'
    },
    {
        id: 'lime',
        dot: 'bg-lime-400',
        glow: 'group-hover:ring-lime-500/10 group-hover:shadow-[0_0_20px_rgba(132,204,22,0.05)]',
        border: 'hover:border-lime-200 dark:hover:border-lime-800/50'
    },
];

const getColorConfig = (index) => COLOR_CONFIG[index % COLOR_CONFIG.length];

// Extracted Item Component to manage local drag state
const InspirationItem = ({ idea, onRemove, onCopy, onUpdateColor, copiedId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const { t } = useTranslation();

    const config = getColorConfig(idea.colorIndex || 0);

    // Handle double click to toggle completion (strikethrough)
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsCompleted(prev => !prev);
    };

    return (
        <div className="relative">
            {/* Swipe Background (Delete Action) 
                Only visible when dragging to prevent flash during entry animation 
            */}
            <div
                className={`absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6 -z-10 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
            >
                <Trash2 className="text-white" size={20} />
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ right: 0.05, left: 0.5 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                    setIsDragging(false);
                    // Higher threshold: need to drag further or swipe faster
                    if (info.offset.x < -150 || info.velocity.x < -800) {
                        onRemove(idea.id);
                    }
                }}
                onClick={() => {
                    if (!window.getSelection().toString()) {
                        onCopy(idea.content, idea.id);
                    }
                }}
                onDoubleClick={handleDoubleClick}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: 0
                }}
                transition={{ x: { type: "spring", stiffness: 500, damping: 30 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`
                    group relative bg-white dark:bg-gray-900 rounded-xl p-5 
                    border border-gray-100 dark:border-gray-800 shadow-sm 
                    transition-all duration-500 cursor-pointer active:scale-[0.99]
                    ${isDragging ? '' : `hover:shadow-md ${config.border} hover:ring-1 ring-inset ${config.glow}`}
                    ${isCompleted ? 'opacity-50' : ''}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Color Status Dot - Click to cycle colors */}
                    <div
                        className="flex-shrink-0 mt-1.5 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Cycle to next color
                            const currentIndex = typeof idea.colorIndex === 'number' ? idea.colorIndex : 0;
                            const nextIndex = (currentIndex + 1) % COLOR_CONFIG.length;
                            onUpdateColor(idea.id, nextIndex);
                        }}
                    >
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-sm transition-transform duration-200 hover:scale-125 ${isCompleted ? 'scale-75 opacity-50' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={`text-gray-700 dark:text-gray-200 text-[15px] font-normal leading-relaxed whitespace-pre-wrap font-sans transition-all duration-200 ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                            {(() => {
                                // Light-weight Markdown Parser for **bold**, `code`, and [Tag]
                                const parseRichText = (text) => {
                                    // Split by delimiters: **...**, `...`, [ ... ]
                                    // Using capturing groups to keep delimiters in the array
                                    // Note: Order matters. Check code first, then bold, then tag.
                                    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\])/g);

                                    return parts.map((part, index) => {
                                        // Inline Code: `...`
                                        if (part.startsWith('`') && part.endsWith('`')) {
                                            return (
                                                <code key={index} className="bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded text-[13px] font-mono text-emerald-600 dark:text-emerald-400 mx-0.5 border border-emerald-100 dark:border-emerald-800/50">
                                                    {part.slice(1, -1)}
                                                </code>
                                            );
                                        }
                                        // Bold: **...**
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return (
                                                <span key={index} className="font-bold text-gray-900 dark:text-gray-100 mx-0.5">
                                                    {part.slice(2, -2)}
                                                </span>
                                            );
                                        }
                                        // Tag: [...]
                                        if (part.startsWith('[') && part.endsWith(']')) {
                                            const tagName = part.slice(1, -1);
                                            return (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-0.5 mx-1 first:ml-0 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md text-[11px] font-medium align-middle border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm transform -translate-y-0.5"
                                                >
                                                    {tagName}
                                                </span>
                                            );
                                        }
                                        // Plain text
                                        return <span key={index}>{part}</span>;
                                    });
                                };

                                return parseRichText(idea.content);
                            })()}
                        </div>
                        {/* Date/Time - compact, directly under content */}
                        <div className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                            {new Date(idea.timestamp || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                            <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                            {new Date(idea.timestamp || Date.now()).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* Copied Indicator */}
                <AnimatePresence>
                    {copiedId === idea.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-3 right-3 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm border border-emerald-100 dark:border-emerald-800"
                        >
                            <Check size={12} strokeWidth={3} />
                            <span>{t('common.copied')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </div >
    );
};

const InspirationModule = () => {
    // ... (rest of component logic remains same until return)
    // Sync
    const { doc } = useSyncStore('flowstudio_v1');
    const { t } = useTranslation();
    const {
        projects: ideas,
        addProject: addIdea,
        removeProject: removeIdea,
        updateProject: updateIdea
    } = useSyncedProjects(doc, 'inspiration');

    // Fetch existing projects for tags
    const { projects: primaryProjects } = useSyncedProjects(doc, 'primary_projects');
    const { projects: pendingProjects } = useSyncedProjects(doc, 'pending_projects');

    const [input, setInput] = useState('');
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [copiedId, setCopiedId] = useState(null);
    const [deletedIdea, setDeletedIdea] = useState(null);

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

    // Cleanup undo toast after 5s
    useEffect(() => {
        if (deletedIdea) {
            const timer = setTimeout(() => {
                setDeletedIdea(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [deletedIdea]);

    // Keyboard shortcut: Cmd+Z to undo
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+Z or Ctrl+Z to undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                if (deletedIdea) {
                    e.preventDefault();
                    addIdea(deletedIdea);
                    setDeletedIdea(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deletedIdea, addIdea]);

    const handleAdd = () => {
        if (!input.trim()) return;
        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            timestamp: Date.now(),
            colorIndex: selectedColorIndex,
        };
        addIdea(newIdea);
        setInput('');
    };

    const handleUpdateColor = (id, newColorIndex) => {
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            updateIdea(id, { colorIndex: newColorIndex });
        }
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

    const handleRemove = (id) => {
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            setDeletedIdea(idea);
            removeIdea(id);
        }
    };

    const handleUndo = () => {
        if (deletedIdea) {
            addIdea(deletedIdea);
            setDeletedIdea(null);
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
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                        {t('inspiration.title')}
                    </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-wide max-w-md mx-auto md:mx-0 leading-relaxed">
                    {t('inspiration.subtitle')}
                </p>
            </div>

            {/* Input Section */}
            <div className="relative mb-20 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 dark:from-gray-800 via-gray-50 dark:via-gray-900 to-gray-100 dark:to-gray-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.4)] group-hover:border-gray-200 dark:group-hover:border-gray-700">

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('inspiration.placeholder')}
                        className="w-full bg-transparent text-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none p-6 pb-20 min-h-[140px] resize-none font-light leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleAdd();
                            }
                        }}
                    />

                    {/* Bottom Action Area */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Minimal Color Picker */}
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm">
                                {COLOR_CONFIG.map((conf, index) => (
                                    <button
                                        key={conf.id}
                                        onClick={() => setSelectedColorIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${conf.dot} ${index === selectedColorIndex ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-gray-400 dark:ring-gray-500 scale-110' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                                    />
                                ))}
                            </div>

                            {/* Project Tags Bar */}
                            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 mask-linear-fade">
                                {allProjectTags.length > 0 && (
                                    <>
                                        <Hash size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                        {allProjectTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagClick(tag)}
                                                className="flex-shrink-0 px-3 py-1 bg-emerald-50/80 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-full text-[11px] font-medium transition-colors border border-emerald-100/50 dark:border-emerald-800/50 hover:border-emerald-200 dark:hover:border-emerald-700 whitespace-nowrap shadow-sm"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono hidden md:inline-block">
                                    {t('inspiration.cmdEnter')}
                                </span>
                                <button
                                    onClick={handleAdd}
                                    disabled={!input.trim()}
                                    className="flex items-center justify-center p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-black dark:hover:bg-gray-100 disabled:opacity-30 transition-all duration-300 active:scale-95 shadow-lg shadow-gray-200 dark:shadow-gray-900"
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {ideas.sort((a, b) => b.timestamp - a.timestamp).map((idea) => (
                        <InspirationItem
                            key={idea.id}
                            idea={idea}
                            onRemove={handleRemove}
                            onCopy={handleCopy}
                            onUpdateColor={handleUpdateColor}
                            copiedId={copiedId}
                        />
                    ))}
                </AnimatePresence>

                {ideas.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="text-gray-300 dark:text-gray-600" size={24} />
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-light tracking-wide">
                            {t('inspiration.emptyState')}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Undo Toast */}
            <AnimatePresence>
                {deletedIdea && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50"
                    >
                        <span className="text-sm font-medium">{t('inspiration.ideaDeleted')}</span>
                        <button
                            onClick={handleUndo}
                            className="text-sm font-bold text-emerald-400 dark:text-emerald-600 hover:text-emerald-300 dark:hover:text-emerald-500 transition-colors flex items-center gap-2"
                        >
                            <span>{t('common.undo')}</span>
                            <kbd className="text-[10px] bg-gray-700 dark:bg-gray-300 px-1.5 py-0.5 rounded text-gray-300 dark:text-gray-700 font-mono">⌘Z</kbd>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InspirationModule;
