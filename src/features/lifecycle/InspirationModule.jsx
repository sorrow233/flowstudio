import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Lightbulb, Hash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';
import InspirationItem, { COLOR_CONFIG } from './components/inspiration/InspirationItem';
import RichTextInput from './components/inspiration/RichTextInput';
import Spotlight from '../../components/shared/Spotlight';

// Auto color logic: Every 3 items, switch to next color
const getNextAutoColorIndex = (totalCount) => {
    const groupIndex = Math.floor(totalCount / 3);
    return groupIndex % COLOR_CONFIG.length;
};


const InspirationModule = () => {
    // Sync - 使用 immediateSync 实现即时同步
    const { doc, immediateSync } = useSync();
    const { t } = useTranslation();
    const {
        projects: allProjects,
        addProject: addProjectBase,
        removeProject: removeProjectBase,
        updateProject: updateProjectBase
    } = useSyncedProjects(doc, 'all_projects');

    // 包装 CRUD 操作，添加即时同步（仅 Inspiration 页面）
    const addIdea = (idea) => {
        addProjectBase(idea);
        immediateSync?.();
    };
    const removeIdea = (id) => {
        removeProjectBase(id);
        immediateSync?.();
    };
    const updateIdea = (id, updates) => {
        updateProjectBase(id, updates);
        immediateSync?.();
    };

    // Filter for ideas (stage: 'inspiration')
    const ideas = useMemo(() =>
        allProjects.filter(p => (p.stage || 'inspiration') === 'inspiration'),
        [allProjects]);

    // Fetch existing projects for tags
    const primaryProjects = useMemo(() =>
        allProjects.filter(p => p.stage === 'primary'),
        [allProjects]);
    const pendingProjects = useMemo(() =>
        allProjects.filter(p => p.stage === 'pending'),
        [allProjects]);

    const [input, setInput] = useState('');
    const [selectedColorIndex, setSelectedColorIndex] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [deletedIdeas, setDeletedIdeas] = useState([]);
    const editorRef = useRef(null);

    // Autocomplete State
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompleteIndex, setAutocompleteIndex] = useState(0);


    // Combine and sort projects for tags (Memoized)
    const allProjectTags = useMemo(() => {
        return [...(primaryProjects || []), ...(pendingProjects || [])]
            .map(p => p.title)
            .filter(t => t && t.trim().length > 0)
            .sort();
    }, [primaryProjects, pendingProjects]);

    // Cleanup undo stack after 5s of inactivity
    useEffect(() => {
        if (deletedIdeas.length > 0) {
            const timer = setTimeout(() => {
                setDeletedIdeas([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [deletedIdeas]);

    // Keyboard shortcut: Cmd+Z to undo
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+Z or Ctrl+Z to undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                if (deletedIdeas.length > 0) {
                    e.preventDefault();
                    const lastDeleted = deletedIdeas[deletedIdeas.length - 1];
                    addIdea(lastDeleted);
                    setDeletedIdeas(prev => prev.slice(0, -1));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deletedIdeas, addIdea]);

    const handleColorClick = (index) => {
        const colorConfig = COLOR_CONFIG[index];

        // 使用 contenteditable 的 applyColor 方法
        if (editorRef.current) {
            const applied = editorRef.current.applyColor(colorConfig.id);
            if (!applied) {
                // 如果没有选中文本，只更新激活颜色状态
                setSelectedColorIndex(prev => prev === index ? null : index);
            }
        }
    };

    const handleAdd = () => {
        if (!input.trim()) return;
        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            timestamp: Date.now(),
            colorIndex: selectedColorIndex !== null ? selectedColorIndex : getNextAutoColorIndex(ideas.length),
            stage: 'inspiration',
        };
        addIdea(newIdea);
        setInput('');
        // 清空 contenteditable 编辑器
        if (editorRef.current) editorRef.current.clear();
    };

    const handleUpdateColor = (id, newColorIndex) => {
        updateIdea(id, { colorIndex: newColorIndex });
    };

    const handleUpdateNote = (id, note) => {
        updateIdea(id, { note });
    };

    const handleToggleComplete = (id, completed) => {
        updateIdea(id, { completed });
    };

    const handleUpdateContent = (id, content) => {
        updateIdea(id, { content });
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
            setDeletedIdeas(prev => [...prev, idea]);
            removeIdea(id);
        }
    };

    const handleUndo = () => {
        if (deletedIdeas.length > 0) {
            const lastDeleted = deletedIdeas[deletedIdeas.length - 1];
            addIdea(lastDeleted);
            setDeletedIdeas(prev => prev.slice(0, -1));
        }
    };

    const handleTagClick = (projectTitle) => {
        const tag = `[${projectTitle}] `;
        setInput(prev => prev + tag);
        editorRef.current?.focus();
    };


    // --- Autocomplete Logic ---
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;
        setInput(newValue);
        setCursorPosition(e.target.selectionStart);

        // Check for trigger character '['
        // logic: find the last occurrence of '[' before cursor
        const textBeforeCursor = newValue.substring(0, newCursorPos);
        const lastOpenBracketIndex = textBeforeCursor.lastIndexOf('[');

        if (lastOpenBracketIndex !== -1) {
            // Check if there is a closing bracket ']' after it before cursor
            const textSinceBracket = textBeforeCursor.substring(lastOpenBracketIndex + 1);
            if (!textSinceBracket.includes(']')) {
                // We are inside a potential tag
                setAutocompleteQuery(textSinceBracket);
                setShowAutocomplete(true);
                setAutocompleteIndex(0);
                return;
            }
        }
        setShowAutocomplete(false);
    };

    const filteredTags = useMemo(() => {
        if (!autocompleteQuery) return allProjectTags;
        return allProjectTags.filter(tag =>
            tag.toLowerCase().includes(autocompleteQuery.toLowerCase())
        );
    }, [allProjectTags, autocompleteQuery]);

    const insertTag = (tag) => {
        // Find position of last '['
        const textBeforeCursor = input.substring(0, cursorPosition);
        const lastOpenBracketIndex = textBeforeCursor.lastIndexOf('[');
        if (lastOpenBracketIndex !== -1) {
            const textAfterCursor = input.substring(cursorPosition);
            const newText = input.substring(0, lastOpenBracketIndex) + `[${tag}] ` + textAfterCursor;
            setInput(newText);
            setShowAutocomplete(false);
            // Focus and set cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Position after: [tag] + space
                    const newPos = lastOpenBracketIndex + tag.length + 3; // +2 for [], +1 for space
                    textareaRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        }
    };

    const handleKeyDown = (e) => {
        if (showAutocomplete && filteredTags.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAutocompleteIndex(prev => (prev + 1) % filteredTags.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAutocompleteIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertTag(filteredTags[autocompleteIndex]);
                return;
            }
            if (e.key === 'Escape') {
                setShowAutocomplete(false);
                return;
            }
        }

        // 1. Submit: Cmd+Enter or Ctrl+Enter
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleAdd();
            return;
        }

        // 2. Atom Delete: If backspace at the end of a tag, delete the whole tag
        if (e.key === 'Backspace' && textareaRef.current) {
            const { selectionStart, selectionEnd } = textareaRef.current;
            if (selectionStart === selectionEnd) {
                const textBefore = input.substring(0, selectionStart);
                const tagMatch = textBefore.match(/\[[^\]\n]+\] $/); // Matches "[Tag] " at the end
                if (tagMatch) {
                    const tagFull = tagMatch[0];
                    const newText = input.substring(0, selectionStart - tagFull.length) + input.substring(selectionEnd);
                    setInput(newText);
                    setTimeout(() => {
                        textareaRef.current.setSelectionRange(selectionStart - tagFull.length, selectionStart - tagFull.length);
                    }, 0);
                    e.preventDefault();
                }
            }
        }
    };

    // Sort ideas by timestamp (memoized)
    const sortedIdeas = useMemo(() => {
        return [...ideas].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [ideas]);

    return (
        <div className="max-w-4xl mx-auto pt-14 px-6 md:px-10 pb-32">
            {/* Header Section */}
            <div className="mb-14 text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3">
                    <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                        <Lightbulb className="w-5 h-5 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-light text-pink-400 dark:text-pink-300 tracking-tight">
                        {t('inspiration.title')}
                    </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-wide max-w-md mx-auto md:mx-0 leading-relaxed">
                    {t('inspiration.subtitle')}
                </p>
            </div>

            {/* Input Section */}
            <div className="relative mb-20 group z-30">
                <Spotlight className="rounded-2xl transition-all duration-300 focus-within:ring-1 focus-within:ring-pink-300 dark:focus-within:ring-pink-500 focus-within:shadow-[0_0_30px_-5px_rgba(244,114,182,0.4)]" spotColor="rgba(244, 114, 182, 0.12)">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 dark:from-gray-800 via-gray-50 dark:via-gray-900 to-gray-100 dark:to-gray-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 overflow-visible transition-all duration-300 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.4)] group-hover:border-gray-200 dark:group-hover:border-gray-700">

                        {/* 富文本输入框 - 使用 contenteditable 实现 */}
                        <RichTextInput
                            ref={editorRef}
                            value={input}
                            onChange={setInput}
                            onKeyDown={handleKeyDown}
                            placeholder={t('inspiration.placeholder')}
                            className="w-full bg-transparent text-lg text-gray-700 dark:text-gray-200 caret-pink-500 outline-none p-6 pb-20 min-h-[140px] font-light leading-relaxed relative z-10 break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400/50"
                            style={{
                                fontFamily: 'inherit',
                                lineHeight: '1.625',
                                letterSpacing: 'normal',
                                fontVariantLigatures: 'none',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                            }}
                        />

                        {/* Autocomplete Popover */}
                        <AnimatePresence>
                            {showAutocomplete && filteredTags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-6 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl shadow-pink-100 dark:shadow-pink-900/10 border border-gray-100 dark:border-gray-800 p-1 min-w-[200px] max-h-[200px] overflow-y-auto"
                                    style={{
                                        top: 'auto', // Dynamic positioning would require more complex calc, ensuring it shows below input or "near cursor"
                                        bottom: '80px' // Show above toolbar
                                    }}
                                >
                                    <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Link Project
                                    </div>
                                    {filteredTags.map((tag, index) => (
                                        <button
                                            key={tag}
                                            onClick={() => insertTag(tag)}
                                            className={`
                                                w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2
                                                ${index === autocompleteIndex
                                                    ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                            `}
                                        >
                                            <Hash size={12} className="opacity-50" />
                                            {tag}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Action Area */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 z-20">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Minimal Color Picker */}
                                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm flex-shrink-0">
                                    {COLOR_CONFIG.map((conf, index) => (
                                        <button
                                            key={conf.id}
                                            onClick={() => handleColorClick(index)}
                                            className={`relative w-3 h-3 rounded-full transition-all duration-300 ${conf.dot} ${index === selectedColorIndex ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-gray-400 dark:ring-gray-500 scale-110' : 'opacity-40 hover:opacity-100 hover:scale-110'} after:absolute after:-inset-2`}
                                            title={conf.id}
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
                                                    className="flex-shrink-0 px-2 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-md text-[11px] font-medium transition-all duration-300 border border-pink-100 dark:border-pink-800/30 whitespace-nowrap"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono hidden md:inline-block">
                                    {t('inspiration.cmdEnter')}
                                </span>
                                <button
                                    onClick={handleAdd}
                                    disabled={!input.trim()}
                                    className="flex items-center justify-center p-3 bg-pink-400 dark:bg-pink-500 text-white rounded-xl hover:bg-pink-500 dark:hover:bg-pink-400 disabled:opacity-30 transition-all duration-300 active:scale-95 shadow-lg shadow-pink-200 dark:shadow-pink-900/20"
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Spotlight>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {sortedIdeas.map((idea) => (
                        <InspirationItem
                            key={idea.id}
                            idea={idea}
                            onRemove={handleRemove}
                            onCopy={handleCopy}
                            onUpdateColor={handleUpdateColor}
                            onUpdateNote={handleUpdateNote}
                            onUpdateContent={handleUpdateContent}
                            onToggleComplete={handleToggleComplete}
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
                {deletedIdeas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-6 right-6 md:bottom-10 md:left-auto md:right-10 md:w-auto bg-pink-50 dark:bg-pink-900 text-pink-900 dark:text-pink-50 px-6 py-3 rounded-xl shadow-2xl shadow-pink-100 dark:shadow-pink-900/20 border border-pink-100 dark:border-pink-800 flex items-center justify-between md:justify-start gap-4 z-50"
                    >
                        <span className="text-sm font-medium">
                            {t('inspiration.ideaDeleted')}
                            {deletedIdeas.length > 1 && <span className="ml-1 opacity-70">({deletedIdeas.length})</span>}
                        </span>
                        <button
                            onClick={handleUndo}
                            className="text-sm font-bold text-pink-500 dark:text-pink-300 hover:text-pink-400 dark:hover:text-pink-200 transition-colors flex items-center gap-2"
                        >
                            <span>{t('common.undo')}</span>
                            <kbd className="text-[10px] bg-pink-100 dark:bg-pink-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-200 font-mono border border-pink-200 dark:border-pink-700">⌘Z</kbd>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InspirationModule;
