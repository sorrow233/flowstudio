import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, History, Download, Undo2, Redo2, Save } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
const SNAPSHOT_MIN_CHANGE = 200;
const MAX_VERSIONS = 50;

const WritingEditor = ({
    doc: writingDoc,
    onUpdate,
    isSidebarOpen,
    onToggleSidebar,
    isMobile,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [contentMarkup, setContentMarkup] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [pendingRemoteHtml, setPendingRemoteHtml] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [conflictState, setConflictState] = useState(null);
    const [safeTop, setSafeTop] = useState(0);

    const lastSnapshotAtRef = useRef(0);
    const lastSnapshotContentRef = useRef('');
    const lastSeenRemoteContentRef = useRef('');
    const exportMenuRef = useRef(null);
    const exportButtonRef = useRef(null);

    const computeWordCount = useCallback((text) => {
        const normalized = (text || '').trim();
        if (!normalized) return 0;
        return normalized.split(/\s+/).length;
    }, []);

    const updateWordCountFromEditor = useCallback(() => {
        const text = editorRef.current?.innerText || '';
        setWordCount(computeWordCount(text));
    }, [computeWordCount]);

    const versions = useMemo(() => {
        if (!writingDoc?.versions || !Array.isArray(writingDoc.versions)) return [];
        return [...writingDoc.versions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [writingDoc?.versions]);

    useEffect(() => {
        const safeInset = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--safe-top')
        );
        if (!Number.isNaN(safeInset) && safeInset > 0) {
            setSafeTop(safeInset);
            return;
        }
        if (typeof window !== 'undefined' && window.visualViewport) {
            setSafeTop(Math.max(0, window.visualViewport.offsetTop || 0));
        }
    }, []);

    // Sync local state with document prop
    useEffect(() => {
        if (writingDoc) {
            // Update title if changed remotely
            if (writingDoc.title !== title) {
                setTitle(writingDoc.title || '');
            }

            // Update content if changed remotely
            const remoteContent = writingDoc.content || '';
            const remoteHtml = markupToHtml(remoteContent);
            if (editorRef.current && remoteHtml !== editorRef.current.innerHTML) {
                const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
                const localDirty = contentMarkup !== (writingDoc.content || '');

                if (isFocused && localDirty && remoteContent !== lastSeenRemoteContentRef.current) {
                    setConflictState({
                        remoteContent,
                        remoteTitle: writingDoc.title || '',
                        timestamp: Date.now()
                    });
                    lastSeenRemoteContentRef.current = remoteContent;
                } else if (isFocused) {
                    setPendingRemoteHtml(remoteHtml);
                } else {
                    editorRef.current.innerHTML = remoteHtml;
                    updateWordCountFromEditor();
                }
            }
            if (remoteContent !== contentMarkup) {
                setContentMarkup(remoteContent);
            }
        }
    }, [writingDoc?.id, writingDoc?.content, writingDoc?.title, contentMarkup, title, updateWordCountFromEditor]);

    useEffect(() => {
        if (!showExport) return;
        const handleClick = (event) => {
            const menu = exportMenuRef.current;
            const button = exportButtonRef.current;
            if (!menu || !button) return;
            if (menu.contains(event.target) || button.contains(event.target)) return;
            setShowExport(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showExport]);

    // Undo / Redo keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!editorRef.current) return;
            const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
            if (!isFocused) return;

            const isMod = e.metaKey || e.ctrlKey;
            if (!isMod) return;

            const isUndo = e.key.toLowerCase() === 'z' && !e.shiftKey;
            const isRedo = (e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y';

            if (isUndo && canUndo) {
                e.preventDefault();
                onUndo?.();
            } else if (isRedo && canRedo) {
                e.preventDefault();
                onRedo?.();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, onUndo, onRedo]);

    // Handle Text Selection for Floating Toolbar
    useEffect(() => {
        const handleSelection = () => {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
                // Adjust for mobile to prevent keyboard overlap or obscured view
                const offset = isMobile ? 80 : 60;
                const toolbarWidth = isMobile ? 190 : 150;
                const toolbarHeight = isMobile ? 52 : 44;
                const padding = 12;
                const maxLeft = window.innerWidth - toolbarWidth / 2 - padding;
                const minLeft = toolbarWidth / 2 + padding;
                const desiredLeft = rect.left + rect.width / 2;
                const clampedLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));

                const minTop = padding + safeTop;
                const maxTop = window.innerHeight - toolbarHeight - padding;
                const desiredTop = rect.top - offset;
                const clampedTop = Math.min(maxTop, Math.max(minTop, desiredTop));

                setToolbarPosition({
                    top: clampedTop,
                    left: clampedLeft
                });
            } else {
                setToolbarPosition(null);
            }
        };

        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('selectionchange', handleSelection);
        }

        return () => {
            if (typeof document !== 'undefined' && document.removeEventListener) {
                document.removeEventListener('selectionchange', handleSelection);
            }
        };
    }, [isMobile]);

    // Apply Color to Selection
    const applyColor = (colorId) => {
        if (typeof window === 'undefined' || !window.getSelection) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
        if (!colorConfig) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        const highlightColor = colorConfig.highlight || 'rgba(167, 139, 250, 0.5)';

        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';

        try {
            range.surroundContents(span);
            selection.removeAllRanges();
            handleInput();
        } catch (e) {
            console.warn("Could not wrap selection, likely crossing node boundaries.", e);
        }
        setToolbarPosition(null);
    };


    // Serialization Helpers
    const htmlToMarkup = (element) => {
        if (!element) return '';
        let result = '';
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                result += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    result += '\n';
                } else if (node.classList?.contains('colored-text')) {
                    const colorId = node.dataset.colorId;
                    result += `#!${colorId}:${node.textContent}#`;
                } else if (node.tagName === 'DIV') {
                    const inner = htmlToMarkup(node);
                    if (result && !result.endsWith('\n')) result += '\n';
                    result += inner;
                } else {
                    result += htmlToMarkup(node);
                }
            }
        });
        return result;
    };

    const markupToHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/#!([^:]+):([^#]+)#/g, (match, colorId, content) => {
                const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
                const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
                const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;
                return `<span class="colored-text relative inline" data-color-id="${colorId}" style="${style}">${content}</span>`;
            })
            .replace(/\n/g, '<br>');
    };

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        const nextMarkup = htmlToMarkup(editorRef.current);
        setContentMarkup(nextMarkup);
        setIsSaving(true);
        updateWordCountFromEditor();
    }, [updateWordCountFromEditor]);

    const handleEditorBlur = useCallback(() => {
        if (!editorRef.current || !pendingRemoteHtml) return;
        editorRef.current.innerHTML = pendingRemoteHtml;
        setPendingRemoteHtml(null);
        const nextMarkup = htmlToMarkup(editorRef.current);
        setContentMarkup(nextMarkup);
        updateWordCountFromEditor();
    }, [pendingRemoteHtml, updateWordCountFromEditor]);

    const addSnapshot = useCallback((snapshot) => {
        if (!writingDoc) return;
        const existing = Array.isArray(writingDoc.versions) ? writingDoc.versions : [];
        const next = [snapshot, ...existing].slice(0, MAX_VERSIONS);
        onUpdate(writingDoc.id, { versions: next });
    }, [onUpdate, writingDoc]);

    const maybeSnapshot = useCallback((markup) => {
        if (!writingDoc) return;
        const now = Date.now();
        const lastSnapshotAt = lastSnapshotAtRef.current;
        const lastSnapshotContent = lastSnapshotContentRef.current || '';

        const timeOk = now - lastSnapshotAt >= SNAPSHOT_INTERVAL_MS;
        const delta = Math.abs((markup || '').length - lastSnapshotContent.length);
        const changeOk = delta >= SNAPSHOT_MIN_CHANGE;
        if (!timeOk || !changeOk) return;

        const snapshot = {
            id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: now,
            title: title || '',
            content: markup || '',
            wordCount: computeWordCount(editorRef.current?.innerText || '')
        };
        addSnapshot(snapshot);
        lastSnapshotAtRef.current = now;
        lastSnapshotContentRef.current = markup || '';
    }, [addSnapshot, computeWordCount, title, writingDoc]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!editorRef.current) return;
            const currentContentMarkup = contentMarkup;
            if (writingDoc && (title !== (writingDoc.title || '') || currentContentMarkup !== (writingDoc.content || ''))) {
                setIsSaving(true);
                onUpdate(writingDoc.id, { title, content: currentContentMarkup });
                setTimeout(() => setIsSaving(false), 500);
                maybeSnapshot(currentContentMarkup);
            } else {
                setIsSaving(false);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, contentMarkup, writingDoc, onUpdate, maybeSnapshot]);

    const handleManualSnapshot = () => {
        if (!writingDoc) return;
        const now = Date.now();
        const snapshot = {
            id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: now,
            title: title || '',
            content: contentMarkup || '',
            wordCount
        };
        addSnapshot(snapshot);
        lastSnapshotAtRef.current = now;
        lastSnapshotContentRef.current = contentMarkup || '';
    };

    const restoreSnapshot = (snapshot) => {
        if (!writingDoc || !snapshot) return;
        const restoredTitle = snapshot.title || '';
        const restoredContent = snapshot.content || '';
        setTitle(restoredTitle);
        setContentMarkup(restoredContent);
        if (editorRef.current) {
            editorRef.current.innerHTML = markupToHtml(restoredContent);
        }
        updateWordCountFromEditor();
        onUpdate(writingDoc.id, {
            title: restoredTitle,
            content: restoredContent
        });
        setShowHistory(false);
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleString();
    };

    const markupToPlain = (text) => {
        if (!text) return '';
        return text.replace(/#!([^:]+):([^#]+)#/g, (_, __, content) => content);
    };

    const markupToMarkdown = (text) => {
        if (!text) return '';
        return text.replace(/#!([^:]+):([^#]+)#/g, (_, __, content) => `==${content}==`);
    };

    const sanitizeFileName = (name) => {
        const base = (name || 'untitled')
            .replace(/[\\/:*?"<>|]+/g, '')
            .trim();
        return base || 'untitled';
    };

    const downloadContent = (content, type, ext) => {
        const filename = `${sanitizeFileName(title)}.${ext}`;
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const exportDoc = (format) => {
        if (!writingDoc) return;
        const markup = contentMarkup || '';
        if (format === 'md') {
            const md = `# ${title || ''}\n\n${markupToMarkdown(markup)}`;
            downloadContent(md, 'text/markdown', 'md');
        } else if (format === 'html') {
            const body = markupToHtml(markup);
            const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${title || ''}</title></head><body>${body}</body></html>`;
            downloadContent(html, 'text/html', 'html');
        } else {
            const txt = `${title ? `${title}\n\n` : ''}${markupToPlain(markup)}`;
            downloadContent(txt, 'text/plain', 'txt');
        }
        setShowExport(false);
    };

    const handleConflictKeepLocal = () => {
        if (!conflictState || !writingDoc) return;
        addSnapshot({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            title: conflictState.remoteTitle || '',
            content: conflictState.remoteContent || '',
            wordCount: computeWordCount(markupToPlain(conflictState.remoteContent || ''))
        });
        onUpdate(writingDoc.id, {
            title: title || '',
            content: contentMarkup || ''
        });
        setConflictState(null);
        setPendingRemoteHtml(null);
    };

    const handleConflictUseRemote = () => {
        if (!conflictState) return;
        const remote = conflictState.remoteContent || '';
        const remoteTitle = conflictState.remoteTitle || '';
        setTitle(remoteTitle);
        setContentMarkup(remote);
        if (editorRef.current) {
            editorRef.current.innerHTML = markupToHtml(remote);
        }
        updateWordCountFromEditor();
        setConflictState(null);
        setPendingRemoteHtml(null);
    };

    return (
        <div className="flex-1 h-full flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-md relative z-10">
            {/* Conflict Banner */}
            <AnimatePresence>
                {conflictState && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-0 left-0 right-0 z-40 px-4 py-3 bg-rose-50/95 dark:bg-rose-900/40 backdrop-blur-md border-b border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between text-[12px]"
                        style={{ paddingTop: safeTop ? safeTop + 8 : undefined }}
                    >
                        <span className="text-rose-700 dark:text-rose-200">
                            {t('inspiration.conflictDetected')}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleConflictUseRemote}
                                className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/70 text-rose-700 dark:text-rose-200 border border-rose-200/60 dark:border-rose-800/40"
                            >
                                {t('inspiration.useRemote')}
                            </button>
                            <button
                                onClick={handleConflictKeepLocal}
                                className="px-3 py-1 rounded-full bg-rose-500 text-white"
                            >
                                {t('inspiration.keepLocal')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Toggle Button - Responsive positioning */}
            <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 left-6'} z-30`}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleSidebar}
                    className={`
                        p-2.5 text-gray-400 hover:text-pink-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl transition-all shadow-sm hover:shadow-md
                        ${isMobile ? 'ring-2 ring-pink-100 dark:ring-pink-900/30' : ''}
                    `}
                    title={t('inspiration.toggleSidebar')}
                >
                    {isSidebarOpen ? <PanelLeftClose size={isMobile ? 20 : 18} /> : <PanelLeftOpen size={isMobile ? 20 : 18} />}
                </motion.button>
            </div>

            {/* Floating Toolbar - Touch Optimized */}
            <AnimatePresence>
                {toolbarPosition && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        className={`fixed z-50 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 dark:border-gray-700/50 -translate-x-1/2 ${isMobile ? 'p-3 gap-3' : 'p-2'}`}
                    >
                        {COLOR_CONFIG.map((conf) => (
                            <button
                                key={conf.id}
                                onMouseDown={(e) => { e.preventDefault(); applyColor(conf.id); }}
                                className={`${isMobile ? 'w-7 h-7' : 'w-5 h-5'} rounded-full transition-all hover:scale-125 hover:rotate-12 ${conf.dot} shadow-sm border border-white/20 dark:border-transparent`}
                                title={conf.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Container - Focused Area */}
            <div
                className="flex-1 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center"
                style={{ paddingTop: conflictState ? 64 + safeTop : 32 }}
                onClick={(e) => {
                if (e.target.tagName !== 'INPUT' && e.target !== editorRef.current) {
                    editorRef.current?.focus();
                }
            }}>
                <div className={`w-full max-w-[65ch] ${isMobile ? 'px-6 py-10' : 'px-8 py-20'} animate-in fade-in zoom-in-95 duration-700 ease-out`}>
                    <div className="sticky top-0 z-20 mb-6 pt-4 pb-3 bg-white/75 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-800/50 px-3">
                        <div className={`flex items-center ${isMobile ? 'justify-between gap-2' : 'justify-between'}`}>
                            <div className="flex items-center gap-2">
                            <button
                                onClick={() => onUndo?.()}
                                disabled={!canUndo}
                                className={`min-w-[40px] min-h-[40px] p-2 rounded-xl border text-gray-400 hover:text-pink-500 transition ${canUndo ? 'bg-white/60 dark:bg-gray-800/60 border-white/30' : 'bg-white/20 dark:bg-gray-800/20 border-white/10 opacity-40 cursor-not-allowed'}`}
                                title={t('common.undo')}
                            >
                                <Undo2 size={16} />
                            </button>
                            <button
                                onClick={() => onRedo?.()}
                                disabled={!canRedo}
                                className={`min-w-[40px] min-h-[40px] p-2 rounded-xl border text-gray-400 hover:text-pink-500 transition ${canRedo ? 'bg-white/60 dark:bg-gray-800/60 border-white/30' : 'bg-white/20 dark:bg-gray-800/20 border-white/10 opacity-40 cursor-not-allowed'}`}
                                title={t('common.redo')}
                            >
                                <Redo2 size={16} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleManualSnapshot}
                                className="min-h-[40px] px-3 py-2 rounded-full bg-white/70 dark:bg-gray-800/60 text-gray-500 hover:text-pink-500 border border-white/40 text-xs"
                            >
                                <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                    <Save size={14} />
                                    {!isMobile && t('inspiration.saveVersion')}
                                </span>
                            </button>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="min-h-[40px] px-3 py-2 rounded-full bg-white/70 dark:bg-gray-800/60 text-gray-500 hover:text-pink-500 border border-white/40 text-xs"
                            >
                                <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                    <History size={14} />
                                    {!isMobile && t('inspiration.versionHistory')}
                                </span>
                            </button>
                            <div className="relative">
                                <button
                                    ref={exportButtonRef}
                                    onClick={() => setShowExport((v) => !v)}
                                    className="min-h-[40px] px-3 py-2 rounded-full bg-white/70 dark:bg-gray-800/60 text-gray-500 hover:text-pink-500 border border-white/40 text-xs"
                                >
                                    <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                        <Download size={14} />
                                        {!isMobile && t('inspiration.export')}
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {showExport && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            ref={exportMenuRef}
                                            className={`absolute mt-2 w-36 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/40 dark:border-gray-800/60 rounded-2xl shadow-xl p-2 z-40 ${isMobile ? 'left-0' : 'right-0'}`}
                                        >
                                            <button onClick={() => exportDoc('md')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-pink-50 dark:hover:bg-pink-900/20">
                                                {t('inspiration.exportMarkdown')}
                                            </button>
                                            <button onClick={() => exportDoc('html')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-pink-50 dark:hover:bg-pink-900/20">
                                                {t('inspiration.exportHtml')}
                                            </button>
                                            <button onClick={() => exportDoc('txt')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-pink-50 dark:hover:bg-pink-900/20">
                                                {t('inspiration.exportTxt')}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                editorRef.current?.focus();
                            }
                        }}
                        className={`
                            w-full font-bold bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-8 tracking-tight shrink-0 leading-tight transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 focus:drop-shadow-[0_2px_10px_rgba(244,114,182,0.2)]
                            ${isMobile ? 'text-3xl' : 'text-5xl'}
                        `}
                        placeholder={t('inspiration.untitled')}
                    />

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onBlur={handleEditorBlur}
                        className={`
                            w-full outline-none text-gray-700 dark:text-gray-200 font-serif leading-[1.8] min-h-[50vh] empty:before:content-[attr(placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 focus:before:content-none selection:bg-pink-100/50 dark:selection:bg-pink-500/30 transition-all duration-300
                            ${isMobile ? 'text-lg' : 'text-xl'}
                        `}
                        placeholder={t('inspiration.placeholder')}
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', outline: 'none' }}
                    />

                    {/* End of content indicator */}
                    <div className="mt-32 flex flex-col items-center opacity-20">
                        <div className="w-2 h-2 rounded-full bg-pink-400 mb-4" />
                        <div className="w-1 h-1 rounded-full bg-pink-300" />
                    </div>
                </div>
            </div>

            {/* Status Bar - Responsive Padding */}
            <div className={`px-6 py-3 text-[11px] text-gray-400/80 dark:text-gray-500/80 font-medium flex justify-between items-center bg-white/0 absolute bottom-0 w-full z-10 pointer-events-none ${isMobile ? 'px-4 mb-2' : 'px-6'}`}>
                <div className="flex gap-4">
                    <span className="tabular-nums font-mono opacity-50 hover:opacity-100 transition-opacity cursor-default pointer-events-auto">{wordCount} {t('inspiration.words')}</span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-green-500/40'}`} />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={isSaving ? 'saving' : 'saved'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="uppercase text-[9px] tracking-widest opacity-60"
                        >
                            {isSaving ? 'Syncing...' : 'Synced'}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
            {/* Safe Area Spacer for iOS bottom bar */}
            {isMobile && <div className="h-safe-bottom" />}

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4"
                        onClick={() => setShowHistory(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            className="w-full max-w-xl bg-white/95 dark:bg-gray-900/95 border border-white/40 dark:border-gray-800/60 rounded-3xl shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('inspiration.versionHistory')}</h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="text-xs text-gray-400 hover:text-pink-500"
                            >
                                {t('common.close')}
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {versions.length === 0 ? (
                                <div className="text-sm text-gray-400 py-8 text-center">{t('inspiration.noVersions')}</div>
                            ) : (
                                versions.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="min-w-0">
                                            <div className="text-sm text-gray-800 dark:text-gray-100 truncate">{v.title || t('inspiration.untitled')}</div>
                                            <div className="text-[11px] text-gray-400 mt-1">{formatTimestamp(v.timestamp)} · {v.wordCount || 0} {t('inspiration.words')}</div>
                                        </div>
                                        <button
                                            onClick={() => restoreSnapshot(v)}
                                            className="px-3 py-1.5 text-xs rounded-full bg-pink-500 text-white"
                                        >
                                            {t('inspiration.restore')}
                                        </button>
                                    </div>
                                ))
                            )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingEditor;
