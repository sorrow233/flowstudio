import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowRight, Lightbulb, Hash, X, Calendar, PenTool, CheckSquare, Trash2, Tag, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useImportQueue } from '../sync/hooks/useImportQueue';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from '../i18n';
import InspirationItem from './components/inspiration/InspirationItem';
import { COLOR_CONFIG } from './components/inspiration/InspirationUtils';
import RichTextInput from './components/inspiration/RichTextInput';
import Spotlight from '../../components/shared/Spotlight';
import { INSPIRATION_CATEGORIES } from '../../utils/constants';

// Auto color logic: Every 3 items, switch to next color
const getNextAutoColorIndex = (totalCount) => {
    const groupIndex = Math.floor(totalCount / 3);
    return groupIndex % COLOR_CONFIG.length;
};


const InspirationModule = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // Sync - 使用 immediateSync 实现即时同步
    const { doc, immediateSync, status } = useSync();
    const isReady = status === 'synced';

    const { t } = useTranslation();
    const {
        projects: allProjects,
        addProject: addProjectBase,
        removeProject: removeProjectBase,
        updateProject: updateProjectBase
    } = useSyncedProjects(doc, 'all_projects');

    // 包装 CRUD 操作，添加即时同步（仅 Inspiration 页面）
    const addIdea = useCallback((idea) => {
        addProjectBase(idea);
        immediateSync?.();
    }, [addProjectBase, immediateSync]);

    const removeIdea = useCallback((id) => {
        removeProjectBase(id);
        immediateSync?.();
    }, [removeProjectBase, immediateSync]);

    const updateIdea = useCallback((id, updates) => {
        updateProjectBase(id, updates);
        immediateSync?.();
    }, [updateProjectBase, immediateSync]);

    // Filter for ideas (stage: 'inspiration')
    const ideas = useMemo(() =>
        allProjects.filter(p => (p.stage || 'inspiration') === 'inspiration'),
        [allProjects]);

    // 处理待导入队列（从外部项目发送的内容）
    useImportQueue(user?.uid, addIdea, ideas.length, getNextAutoColorIndex, isReady);

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
    const [showWeekSelector, setShowWeekSelector] = useState(false);
    const [deletedIdeas, setDeletedIdeas] = useState([]);
    const [archiveShake, setArchiveShake] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('note'); // 分类状态
    const [isSelectionMode, setIsSelectionMode] = useState(false); // 多选模式
    const [selectedIdeaIds, setSelectedIdeaIds] = useState([]); // 已选中的 ID
    const editorRef = useRef(null);
    const textareaRef = useRef(null); // Define textareaRef even if not used widely now

    // Autocomplete State
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompleteIndex, setAutocompleteIndex] = useState(0);


    // 多选处理逻辑
    // 多选处理逻辑
    const handleToggleSelect = useCallback((ideaId) => {
        setSelectedIdeaIds(prev =>
            prev.includes(ideaId)
                ? prev.filter(id => id !== ideaId)
                : [...prev, ideaId]
        );
    }, []);

    const handleBatchMove = (category) => {
        if (selectedIdeaIds.length === 0) return;

        selectedIdeaIds.forEach(id => {
            updateIdea(id, { category });
        });

        // 成功后退出多选模式
        setIsSelectionMode(false);
        setSelectedIdeaIds([]);
    };

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

    // 跨项目内容接收：检测 URL 参数中的 import_text
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const importText = params.get('import_text');

        if (importText) {
            const decoded = decodeURIComponent(importText);
            const newIdea = {
                id: uuidv4(),
                content: decoded,
                timestamp: Date.now(),
                colorIndex: getNextAutoColorIndex(ideas.length),
                stage: 'inspiration',
            };
            addIdea(newIdea);

            // 清理 URL 参数（避免刷新后重复创建）
            const url = new URL(window.location);
            url.searchParams.delete('import_text');
            window.history.replaceState({}, '', url);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handleColorClick = useCallback((index) => {
        const colorConfig = COLOR_CONFIG[index];

        // 使用 contenteditable 的 applyColor 方法
        if (editorRef.current) {
            const applied = editorRef.current.applyColor(colorConfig.id);
            if (!applied) {
                // 如果没有选中文本，只更新激活颜色状态
                setSelectedColorIndex(prev => prev === index ? null : index);
            }
        }
    }, [editorRef]);

    const handleAdd = useCallback(() => {
        if (!input.trim()) return;
        const newIdea = {
            id: uuidv4(),
            content: input.trim(),
            timestamp: Date.now(),
            colorIndex: selectedColorIndex !== null ? selectedColorIndex : getNextAutoColorIndex(ideas.length),
            category: selectedCategory, // 添加分类
            stage: 'inspiration',
        };
        addIdea(newIdea);
        setInput('');
        // 清空 contenteditable 编辑器
        if (editorRef.current) editorRef.current.clear();
    }, [input, selectedColorIndex, ideas.length, selectedCategory, addIdea]);

    const handleUpdateColor = useCallback((id, newColorIndex) => {
        updateIdea(id, { colorIndex: newColorIndex });
    }, [updateIdea]);

    const handleUpdateNote = useCallback((id, note) => {
        updateIdea(id, { note });
    }, [updateIdea]);

    const handleToggleComplete = useCallback((id, completed) => {
        updateIdea(id, { completed });
    }, [updateIdea]);

    const handleUpdateContent = useCallback((id, content) => {
        updateIdea(id, { content });
    }, [updateIdea]);

    const handleCopy = useCallback(async (content, id) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    const handleRemove = useCallback((id) => {
        // Optimistic update logic if needed, but simple state update here
        // We need ideas from state or props? ideas is from useMemo. 
        // We can't use 'ideas' directly in useCallback if we want it to be stable unless we access current state differently.
        // Actually, removeIdea is stable. But we need 'idea' object to add to deletedIdeas.
        // To make this stable, we probably need functional updates or rely on ideas changing not triggered often?
        // Wait, ideas changes often. But handleRemove prop changing will trigger re-render.
        // Simple fix: pass id to deletedIdeas functional update might be tricky if we need the object.
        // Let's assume re-creating this function when 'ideas' changes is acceptable, BUT 'ideas' changes only when content changes.
        // Selection doesn't change 'ideas'. So it IS stable during selection!
        // So wrapping in useCallback with [ideas] dependency is enough to prevent re-render during selection toggling.
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            setDeletedIdeas(prev => [...prev, { ...idea, wasArchived: false }]);
            removeIdea(id);
        }
    }, [ideas, removeIdea]);

    const handleArchive = useCallback((id) => {
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            setDeletedIdeas(prev => [...prev, { ...idea, wasArchived: true }]);
            updateIdea(id, { stage: 'archive', archiveTimestamp: Date.now() });
            // Trigger header shake
            setArchiveShake(true);
            setTimeout(() => setArchiveShake(false), 500);
        }
    }, [ideas, updateIdea]);

    const handleUndo = () => {
        if (deletedIdeas.length > 0) {
            const lastDeleted = deletedIdeas[deletedIdeas.length - 1];
            if (lastDeleted.wasArchived) {
                // Restore from archive
                updateIdea(lastDeleted.id, { stage: 'inspiration' });
            } else {
                // Restore deleted
                addIdea(lastDeleted);
            }
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
                if (editorRef.current) {
                    editorRef.current.focus();
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
        // Note: For contentEditable, this logic is more complex. For now, we skip it or use editorRef.
        if (e.key === 'Backspace' && editorRef.current) {
            // Simplified logic: normal backspace behavior for now
        }
    };

    // Sort ideas by timestamp (memoized) and filter by category
    const sortedIdeas = useMemo(() => {
        return [...ideas]
            .filter(idea => (idea.category || 'note') === selectedCategory)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [ideas, selectedCategory]);

    // Extract all available weeks for navigation, grouped by Year and Month
    const groupedWeeks = useMemo(() => {
        const olderIdeas = sortedIdeas.filter(idea => Date.now() - (idea.timestamp || Date.now()) >= 7 * 24 * 60 * 60 * 1000);
        const groups = {};

        olderIdeas.forEach(idea => {
            const ideaDate = new Date(idea.timestamp || Date.now());

            // 计算周一
            const tempDate = new Date(ideaDate.getTime());
            const day = tempDate.getDay();
            const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
            tempDate.setDate(diff);
            tempDate.setHours(0, 0, 0, 0);

            const weekStart = new Date(tempDate);
            const year = weekStart.getFullYear();
            const month = weekStart.getMonth() + 1; // 1-12

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekKey = weekStart.getTime();

            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];

            if (!groups[year][month].some(w => w.key === weekKey)) {
                // 计算当前月内的周数
                const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
                // 周数：(当前日期 + 月初是周几 - 1) / 7
                const weekNum = Math.ceil((weekStart.getDate() + monthStart.getDay() - 1) / 7);
                const weekNames = ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周'];

                groups[year][month].push({
                    start: weekStart,
                    end: weekEnd,
                    key: weekKey,
                    label: weekNames[weekNum - 1] || `${weekNum}周`
                });
            }
        });

        // 转换为排序后的结构
        return Object.entries(groups)
            .sort((a, b) => Number(b[0]) - Number(a[0])) // 年份降序
            .map(([year, months]) => ({
                year,
                months: Object.entries(months)
                    .sort((a, b) => Number(b[0]) - Number(a[0])) // 月份降序
                    .map(([month, weeks]) => ({
                        month,
                        weeks: weeks.sort((a, b) => b.key - a.key) // 周降序（最新在前）
                    }))
            }));
    }, [sortedIdeas]);

    const scrollToWeek = (weekKey) => {
        const element = document.getElementById(`week-${weekKey}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setShowWeekSelector(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-14 px-6 md:px-10 pb-32">
            {/* Header Section */}
            <div className="mb-14 text-center md:text-left">
                <motion.div
                    className="inline-flex items-center justify-center md:justify-start gap-2 mb-3"
                    animate={archiveShake ? {
                        x: [0, -4, 4, -4, 4, 0],
                        scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl"
                        animate={archiveShake ? {
                            backgroundColor: ['rgba(251, 207, 232, 0.2)', 'rgba(244, 114, 182, 0.6)', 'rgba(251, 207, 232, 0.2)'],
                            scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 0.4 }}
                    >
                        <Lightbulb className="w-5 h-5 text-pink-400" />
                    </motion.div>
                    <h2
                        onDoubleClick={() => navigate('/inspiration/archive')}
                        className="text-3xl font-light text-pink-400 dark:text-pink-300 tracking-tight relative inline-block cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {t('inspiration.title')}
                        {/* Pink Brush Stroke */}
                        <span className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-pink-200/80 via-pink-300/60 to-transparent dark:from-pink-700/50 dark:via-pink-600/30 dark:to-transparent rounded-full blur-[2px]" />
                    </h2>
                </motion.div>

                <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-wide max-w-md mx-auto md:mx-0 leading-relaxed mb-6">
                    {t('inspiration.subtitle')}
                </p>
            </div>



            <AnimatePresence mode="wait">
                <motion.div
                    key="inspiration"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                >
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
                                    className="w-full bg-transparent text-lg text-gray-800 dark:text-gray-100 caret-pink-500 outline-none p-6 pb-20 min-h-[200px] font-light leading-relaxed relative z-10 break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400/50"
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

                    {/* Category Selector - Redesigned: Capsule with Name & Dots */}
                    <div className="flex justify-end mb-6 -mt-12 px-2 relative z-20 gap-3 items-center">
                        {/* Selection Toggle */}
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                if (isSelectionMode) setSelectedIdeaIds([]); // 退出时清空选中
                            }}
                            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 backdrop-blur-md border ${isSelectionMode
                                ? 'bg-blue-500/20 border-blue-400 text-blue-500 shadow-sm'
                                : 'bg-white/40 dark:bg-gray-800/40 border-gray-100/50 dark:border-gray-800/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            title={isSelectionMode ? "退出多选" : "开启多选"}
                        >
                            {isSelectionMode ? <X size={18} /> : <ListChecks size={18} />}
                        </button>

                        <div className="flex items-center p-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-full border border-gray-100/50 dark:border-gray-800/50 shadow-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:shadow-md hover:border-pink-100/30 dark:hover:border-pink-900/30 group/selector">

                            {/* Label Section - Animated */}
                            <div className="flex items-center px-3 border-r border-gray-200/50 dark:border-gray-700/50 mr-1 min-w-[60px] justify-center relative overflow-hidden h-7">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={selectedCategory}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className={`text-xs font-medium bg-gradient-to-r bg-clip-text text-transparent ${selectedCategory === 'note' ? 'from-pink-400 to-rose-500' :
                                            selectedCategory === 'todo' ? 'from-blue-400 to-indigo-500' :
                                                'from-violet-500 to-fuchsia-500'
                                            }`}
                                    >
                                        {INSPIRATION_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            {/* Dots Section */}
                            <div className="flex items-center gap-1">
                                {INSPIRATION_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group/dot"
                                    >
                                        {selectedCategory === cat.id && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <div className={`
                                                relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-300
                                                ${cat.dotColor}
                                                ${selectedCategory === cat.id ? 'scale-110' : 'opacity-40 group-hover/dot:opacity-100 group-hover/dot:scale-110'}
                                            `} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* List Section - Improved overall transition */}
                    <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.23, 1, 0.32, 1] // Apple Style Ease Out
                                }}
                                className="space-y-6"
                            >
                                {/* Recent Ideas - Individual entry/exit animations still apply but nested */}
                                <div className="space-y-6">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {sortedIdeas
                                            .filter(idea => Date.now() - (idea.timestamp || Date.now()) < 7 * 24 * 60 * 60 * 1000)
                                            .map((idea) => (
                                                <InspirationItem
                                                    key={idea.id}
                                                    idea={idea}
                                                    onRemove={handleRemove}
                                                    onArchive={handleArchive}
                                                    onCopy={handleCopy}
                                                    onUpdateColor={handleUpdateColor}
                                                    onUpdateNote={handleUpdateNote}
                                                    onUpdateContent={handleUpdateContent}
                                                    onToggleComplete={handleToggleComplete}
                                                    copiedId={copiedId}
                                                    isSelectionMode={isSelectionMode}
                                                    isSelected={selectedIdeaIds.includes(idea.id)}
                                                    onSelect={handleToggleSelect}
                                                />
                                            ))}
                                    </AnimatePresence>
                                </div>

                                {/* Older Ideas - Grouped by week */}
                                {(() => {
                                    const olderIdeas = sortedIdeas.filter(idea => Date.now() - (idea.timestamp || Date.now()) >= 7 * 24 * 60 * 60 * 1000);
                                    if (olderIdeas.length === 0) return null;

                                    // Group by week
                                    const weekGroups = {};
                                    olderIdeas.forEach(idea => {
                                        const date = new Date(idea.timestamp || Date.now());
                                        const day = date.getDay();
                                        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                                        const weekStart = new Date(date.setDate(diff));
                                        weekStart.setHours(0, 0, 0, 0);
                                        const weekEnd = new Date(weekStart);
                                        weekEnd.setDate(weekEnd.getDate() + 6);
                                        weekEnd.setHours(23, 59, 59, 999);

                                        const weekKey = weekStart.getTime();
                                        if (!weekGroups[weekKey]) {
                                            weekGroups[weekKey] = {
                                                start: weekStart,
                                                end: weekEnd,
                                                ideas: []
                                            };
                                        }
                                        weekGroups[weekKey].ideas.push(idea);
                                    });

                                    const sortedWeeks = Object.values(weekGroups).sort((a, b) => b.start - a.start);

                                    return sortedWeeks.map(week => (
                                        <div key={week.start.getTime()}>
                                            <div className="flex items-center gap-3 mb-4 mt-8 cursor-pointer group">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 dark:via-pink-800 to-transparent group-hover:via-pink-300 transition-colors" />
                                                <span className="text-xs font-medium text-pink-300 dark:text-pink-600 tracking-wide whitespace-nowrap group-hover:text-pink-400 transition-colors">
                                                    {week.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    {' - '}
                                                    {week.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 dark:via-pink-800 to-transparent group-hover:via-pink-300 transition-colors" />
                                            </div>
                                            <div className="space-y-6">
                                                <AnimatePresence mode="popLayout" initial={false}>
                                                    {week.ideas.map((idea) => (
                                                        <InspirationItem
                                                            key={idea.id}
                                                            idea={idea}
                                                            onRemove={handleRemove}
                                                            onArchive={handleArchive}
                                                            onCopy={handleCopy}
                                                            onUpdateColor={handleUpdateColor}
                                                            onUpdateNote={handleUpdateNote}
                                                            onUpdateContent={handleUpdateContent}
                                                            onToggleComplete={handleToggleComplete}
                                                            copiedId={copiedId}
                                                            isSelectionMode={isSelectionMode}
                                                            isSelected={selectedIdeaIds.includes(idea.id)}
                                                            onSelect={handleToggleSelect}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ));
                                })()}

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
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Undo Toast */}
            <AnimatePresence>
                {
                    deletedIdeas.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-24 left-6 right-6 md:bottom-10 md:left-auto md:right-10 md:w-auto bg-pink-50 dark:bg-pink-900 text-pink-900 dark:text-pink-50 px-6 py-3 rounded-xl shadow-2xl shadow-pink-100 dark:shadow-pink-900/20 border border-pink-100 dark:border-pink-800 flex items-center justify-between md:justify-start gap-4 z-50"
                        >
                            <span className="text-sm font-medium">
                                {deletedIdeas[deletedIdeas.length - 1]?.wasArchived
                                    ? t('inspiration.ideaArchived', '已归档')
                                    : t('inspiration.ideaDeleted')}
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
                    )
                }
            </AnimatePresence >

            {/* Week Selector Modal */}
            < AnimatePresence >
                {showWeekSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 dark:bg-black/40 backdrop-blur-xl"
                        onClick={() => setShowWeekSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-light text-gray-900 dark:text-white mb-1">选择周区间</h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-light">快速跳转到历史灵感</p>
                                    </div>
                                    <button
                                        onClick={() => setShowWeekSelector(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
                                    >
                                        <X size={20} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {groupedWeeks.map((yearGroup) => (
                                        <div key={yearGroup.year} className="space-y-4">
                                            {groupedWeeks.length > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                        {yearGroup.year}
                                                    </span>
                                                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                                                </div>
                                            )}

                                            {yearGroup.months.map((monthGroup) => {
                                                const SOLAR_TERMS = [
                                                    ['小寒', '大寒'], ['立春', '雨水'], ['惊蛰', '春分'],
                                                    ['清明', '谷雨'], ['立夏', '小满'], ['芒种', '夏至'],
                                                    ['小暑', '大暑'], ['立秋', '处暑'], ['白露', '秋分'],
                                                    ['寒露', '霜降'], ['立冬', '小雪'], ['大雪', '冬至']
                                                ];
                                                const terms = SOLAR_TERMS[parseInt(monthGroup.month) - 1] || [];

                                                return (
                                                    <div key={monthGroup.month} className="space-y-2">
                                                        <div className="flex items-center justify-between px-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                                    {monthGroup.month}月
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-light mt-0.5">
                                                                    · {terms.join(' ')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            {monthGroup.weeks.map((week) => (
                                                                <button
                                                                    key={week.key}
                                                                    onClick={() => scrollToWeek(week.key)}
                                                                    className="text-center p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-pink-50 dark:hover:bg-pink-900/40 group transition-all duration-300 border border-transparent hover:border-pink-100 dark:hover:border-pink-800/50 flex flex-col justify-center min-h-[50px]"
                                                                >
                                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-300">
                                                                        {week.start.getDate()} - {week.end.getDate()}日
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {groupedWeeks.length === 0 && (
                                        <div className="py-12 text-center">
                                            <Calendar className="mx-auto text-gray-200 dark:text-gray-800 mb-2" size={32} />
                                            <p className="text-gray-400 font-light text-sm italic">暂无历史灵感回顾</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Batch Action Bar */}
            < AnimatePresence >
                {isSelectionMode && selectedIdeaIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] md:w-auto"
                    >
                        <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-3 flex items-center gap-2 md:gap-3">
                            {/* 已选项 - 固定在左侧 */}
                            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{selectedIdeaIds.length} 项</span>
                            </div>

                            {/* 转移按钮 - 可滚动区域 */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
                                {INSPIRATION_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleBatchMove(cat.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 border flex-shrink-0 ${cat.textColor} ${cat.color.replace('bg-', 'bg-opacity-10 dark:bg-opacity-20 ')} border-transparent hover:border-current shadow-sm active:scale-95`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                                        <span className="whitespace-nowrap">{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 取消按钮 - 固定在右侧 */}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIdeaIds([]);
                                }}
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-medium transition-colors active:scale-95 flex-shrink-0"
                            >
                                取消
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default InspirationModule;
