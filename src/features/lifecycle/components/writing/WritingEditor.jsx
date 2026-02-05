import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, History, Download, Undo2, Redo2, Save, Copy } from 'lucide-react';
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
    canRedo,
    syncStatus = 'synced'
}) => {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [contentMarkup, setContentMarkup] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [wordCountLabelKey, setWordCountLabelKey] = useState('inspiration.words');
    const [charCount, setCharCount] = useState(0);
    const [readMinutes, setReadMinutes] = useState(0);
    const [pendingRemoteHtml, setPendingRemoteHtml] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [conflictState, setConflictState] = useState(null);
    const [safeTop, setSafeTop] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [copiedAt, setCopiedAt] = useState(null);
    const [isEditorFocused, setIsEditorFocused] = useState(false);

    const lastSnapshotAtRef = useRef(0);
    const lastSnapshotContentRef = useRef('');
    const lastSeenRemoteContentRef = useRef('');
    const forceRemoteApplyRef = useRef(false);
    const exportMenuRef = useRef(null);
    const exportButtonRef = useRef(null);

    const hasUnsavedChanges = useMemo(() => {
        if (!writingDoc) return false;
        return title !== (writingDoc.title || '') || contentMarkup !== (writingDoc.content || '');
    }, [contentMarkup, title, writingDoc]);

    const statusLabel = useMemo(() => {
        if (syncStatus === 'offline' || syncStatus === 'disconnected') {
            return t('inspiration.offline');
        }
        if (isSaving || hasUnsavedChanges) {
            return t('inspiration.saving');
        }
        if (syncStatus === 'syncing') {
            return t('inspiration.syncing');
        }
        return t('inspiration.synced');
    }, [hasUnsavedChanges, isSaving, syncStatus, t]);

    const isOffline = syncStatus === 'offline' || syncStatus === 'disconnected';
    const isSyncing = isSaving || hasUnsavedChanges || syncStatus === 'syncing';

    const computeWordCount = useCallback((text) => {
        const normalized = (text || '').trim();
        if (!normalized) return 0;
        const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(normalized);
        const hasSpace = /\s/.test(normalized);
        if (hasCjk && !hasSpace) {
            return (normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
        }
        return (normalized.match(/\S+/g) || []).length;
    }, []);

    const computeCharCount = useCallback((text) => {
        if (!text) return 0;
        return text.replace(/\s/g, '').length;
    }, []);

    const computeReadMinutes = useCallback((words, chars) => {
        if (!words && !chars) return 0;
        const basis = words > 0 ? words : Math.ceil(chars / 2);
        return Math.max(1, Math.ceil(basis / 200));
    }, []);

    const updateStatsFromEditor = useCallback(() => {
        const text = editorRef.current?.innerText || '';
        const words = computeWordCount(text);
        const chars = computeCharCount(text);
        const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(text || '');
        const hasSpace = /\s/.test(text || '');
        setWordCountLabelKey(hasCjk && !hasSpace ? 'inspiration.characters' : 'inspiration.words');
        setWordCount(words);
        setCharCount(chars);
        setReadMinutes(computeReadMinutes(words, chars));
    }, [computeCharCount, computeReadMinutes, computeWordCount]);

    const versions = useMemo(() => {
        if (!writingDoc?.versions || !Array.isArray(writingDoc.versions)) return [];
        return [...writingDoc.versions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [writingDoc?.versions]);

    useEffect(() => {
        const updateSafeTop = () => {
            const safeInset = Number.parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue('--safe-top')
            );
            if (!Number.isNaN(safeInset) && safeInset > 0) {
                setSafeTop(safeInset);
                return;
            }
            if (typeof window !== 'undefined' && window.visualViewport) {
                setSafeTop(Math.max(0, window.visualViewport.offsetTop || 0));
            } else {
                setSafeTop(0);
            }
        };

        updateSafeTop();
        window.addEventListener('resize', updateSafeTop);
        window.visualViewport?.addEventListener('resize', updateSafeTop);
        return () => {
            window.removeEventListener('resize', updateSafeTop);
            window.visualViewport?.removeEventListener('resize', updateSafeTop);
        };
    }, []);

    useEffect(() => {
        if (writingDoc?.lastModified) {
            setLastSavedAt(writingDoc.lastModified);
        } else if (writingDoc?.timestamp) {
            setLastSavedAt(writingDoc.timestamp);
        }
    }, [writingDoc?.lastModified, writingDoc?.timestamp]);

    useEffect(() => {
        if (!copiedAt) return;
        const timer = setTimeout(() => setCopiedAt(null), 1800);
        return () => clearTimeout(timer);
    }, [copiedAt]);

    // Sync local state with document prop
    useEffect(() => {
        if (writingDoc) {
            const prevRemoteContent = lastSeenRemoteContentRef.current;
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
                const shouldForceApply = forceRemoteApplyRef.current;
                if (shouldForceApply) {
                    forceRemoteApplyRef.current = false;
                }

                if (shouldForceApply || !isFocused) {
                    editorRef.current.innerHTML = remoteHtml;
                    updateStatsFromEditor();
                    setPendingRemoteHtml(null);
                    setConflictState(null);
                } else if (isFocused && localDirty && remoteContent !== prevRemoteContent) {
                    setConflictState({
                        remoteContent,
                        remoteTitle: writingDoc.title || '',
                        timestamp: Date.now()
                    });
                    setPendingRemoteHtml(null);
                } else if (isFocused) {
                    setPendingRemoteHtml(remoteHtml);
                } else {
                    editorRef.current.innerHTML = remoteHtml;
                    updateStatsFromEditor();
                }
            }
            const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
            const localDirty = contentMarkup !== remoteContent;
            if (remoteContent !== contentMarkup && (!localDirty || !isFocused)) {
                setContentMarkup(remoteContent);
            }
            lastSeenRemoteContentRef.current = remoteContent;
        }
    }, [writingDoc?.id, writingDoc?.content, writingDoc?.title, contentMarkup, title, updateStatsFromEditor]);

    useEffect(() => {
        if (!writingDoc) return;
        if (versions.length > 0) {
            const latest = versions[0];
            lastSnapshotAtRef.current = latest.timestamp || Date.now();
            lastSnapshotContentRef.current = latest.content || '';
        } else {
            lastSnapshotAtRef.current = Date.now();
            lastSnapshotContentRef.current = writingDoc.content || '';
        }
    }, [writingDoc?.id, versions]);

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

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                setShowExport(false);
                setShowHistory(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleUndo = useCallback(() => {
        if (!canUndo) return;
        forceRemoteApplyRef.current = true;
        onUndo?.();
    }, [canUndo, onUndo]);

    const handleRedo = useCallback(() => {
        if (!canRedo) return;
        forceRemoteApplyRef.current = true;
        onRedo?.();
    }, [canRedo, onRedo]);

    // Undo / Redo keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!editorRef.current) return;
            const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
            if (!isFocused) return;

            const isMod = e.metaKey || e.ctrlKey;
            if (!isMod) return;

            const key = e.key.toLowerCase();
            const isUndo = key === 'z' && !e.shiftKey;
            const isRedo = (key === 'z' && e.shiftKey) || key === 'y';
            const isSaveSnapshot = key === 's';

            if (isSaveSnapshot) {
                e.preventDefault();
                handleManualSnapshot();
                return;
            }

            if (isUndo) {
                e.preventDefault();
                handleUndo();
            } else if (isRedo) {
                e.preventDefault();
                handleRedo();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleManualSnapshot, handleRedo, handleUndo]);

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
                const toolbarWidth = isMobile ? 220 : 170;
                const toolbarHeight = isMobile ? 56 : 46;
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
    }, [isMobile, safeTop]);

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
        updateStatsFromEditor();
    }, [updateStatsFromEditor]);

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
                setLastSavedAt(Date.now());
                setTimeout(() => setIsSaving(false), 500);
                maybeSnapshot(currentContentMarkup);
            } else {
                setIsSaving(false);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, contentMarkup, writingDoc, onUpdate, maybeSnapshot]);

    const handleManualSnapshot = useCallback(() => {
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
    }, [addSnapshot, contentMarkup, title, wordCount, writingDoc]);

    const restoreSnapshot = (snapshot) => {
        if (!writingDoc || !snapshot) return;
        const restoredTitle = snapshot.title || '';
        const restoredContent = snapshot.content || '';
        setTitle(restoredTitle);
        setContentMarkup(restoredContent);
        if (editorRef.current) {
            editorRef.current.innerHTML = markupToHtml(restoredContent);
        }
        updateStatsFromEditor();
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

    const formatTimeShort = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    const handleCopy = async () => {
        if (!canCopy) return;
        const plain = markupToPlain(contentMarkup || '');
        const output = title ? `${title}\n\n${plain}` : plain;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(output);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = output;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }
            setCopiedAt(Date.now());
        } catch (error) {
            console.warn('Copy failed:', error);
        }
    };

    const handleApplyPendingRemote = () => {
        if (!pendingRemoteHtml || !writingDoc) return;
        if (editorRef.current) {
            editorRef.current.innerHTML = pendingRemoteHtml;
        }
        setContentMarkup(writingDoc.content || '');
        updateStatsFromEditor();
        setPendingRemoteHtml(null);
        setConflictState(null);
        lastSeenRemoteContentRef.current = writingDoc.content || '';
    };

    const handleKeepPendingLocal = () => {
        setPendingRemoteHtml(null);
        if (writingDoc?.content) {
            lastSeenRemoteContentRef.current = writingDoc.content;
        }
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
        lastSeenRemoteContentRef.current = conflictState.remoteContent || '';
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
        updateStatsFromEditor();
        setConflictState(null);
        setPendingRemoteHtml(null);
        lastSeenRemoteContentRef.current = remote;
    };

    const canManualSnapshot = Boolean(writingDoc) && contentMarkup !== (lastSnapshotContentRef.current || '');
    const hasPendingRemote = Boolean(pendingRemoteHtml);
    const canCopy = Boolean((title || '').trim() || (contentMarkup || '').trim());
    const statusNeedsAttention = isOffline || isSyncing;
    const conflictPreview = useMemo(() => {
        if (!conflictState?.remoteContent) return '';
        const cleaned = markupToPlain(conflictState.remoteContent || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!cleaned) return '';
        return cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned;
    }, [conflictState?.remoteContent]);

    return (
        <div className="flex-1 h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative z-10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.18),transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] [background-size:16px_16px] dark:opacity-[0.08]" />
            </div>
            {/* Conflict Banner */}
            <AnimatePresence>
                {conflictState && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute top-0 left-0 right-0 z-40 px-4 py-3 bg-rose-50/95 dark:bg-rose-900/40 backdrop-blur-md border-b border-rose-200/60 dark:border-rose-800/40 text-[12px] ${isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}
                        style={{ paddingTop: safeTop ? safeTop + 8 : undefined }}
                    >
                        <div className={`flex w-full ${isMobile ? 'flex-col gap-2' : 'items-center justify-between gap-4'}`}>
                            <div className="min-w-0">
                                <div className="text-rose-700 dark:text-rose-200">
                                    {t('inspiration.conflictDetected')}
                                </div>
                                {conflictPreview && (
                                    <div className="text-[11px] text-rose-600/80 dark:text-rose-200/70 line-clamp-2">
                                        {t('inspiration.remotePreview')}: {conflictPreview}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleConflictUseRemote}
                                    className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/70 text-rose-700 dark:text-rose-200 border border-rose-200/60 dark:border-rose-800/40"
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
                        p-2.5 text-gray-400 hover:text-rose-500 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl transition-all shadow-sm hover:shadow-md
                        ${isMobile ? 'ring-2 ring-rose-100 dark:ring-rose-900/30' : ''}
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
                        className={`fixed z-50 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/10 -translate-x-1/2 ${isMobile ? 'p-3 gap-3' : 'p-2'}`}
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
                }}
            >

                <div className={`w-full max-w-[68ch] ${isMobile ? 'px-6 py-10' : 'px-10 py-20'} animate-in fade-in zoom-in-95 duration-700 ease-out`}>
                    <div
                        className={`sticky z-20 bg-white/88 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 px-4 py-4 transition-shadow duration-300 ${isEditorFocused ? 'shadow-[0_18px_60px_-35px_rgba(244,63,94,0.35)] ring-1 ring-rose-200/50 dark:ring-rose-700/30' : 'shadow-[0_12px_36px_-26px_rgba(0,0,0,0.35)]'}`}
                        style={{ top: conflictState ? 48 + safeTop : 0 }}
                    >
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between gap-6'}`}>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleUndo}
                                    disabled={!canUndo}
                                    className={`min-w-[40px] min-h-[40px] p-2 rounded-xl border text-gray-400 hover:text-rose-500 transition-all active:scale-[0.97] active:translate-y-[0.5px] ${canUndo ? 'bg-white/70 dark:bg-slate-800/60 border-white/30 hover:shadow-[0_10px_20px_-16px_rgba(244,63,94,0.4)]' : 'bg-white/20 dark:bg-slate-800/20 border-white/10 opacity-40 cursor-not-allowed'}`}
                                    title={t('common.undo')}
                                >
                                    <Undo2 size={16} />
                                </button>
                                <button
                                    onClick={handleRedo}
                                    disabled={!canRedo}
                                    className={`min-w-[40px] min-h-[40px] p-2 rounded-xl border text-gray-400 hover:text-rose-500 transition-all active:scale-[0.97] active:translate-y-[0.5px] ${canRedo ? 'bg-white/70 dark:bg-slate-800/60 border-white/30 hover:shadow-[0_10px_20px_-16px_rgba(244,63,94,0.4)]' : 'bg-white/20 dark:bg-slate-800/20 border-white/10 opacity-40 cursor-not-allowed'}`}
                                    title={t('common.redo')}
                                >
                                    <Redo2 size={16} />
                                </button>
                            </div>
                            <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-2'}`}>
                                <button
                                    onClick={handleManualSnapshot}
                                    disabled={!canManualSnapshot}
                                    className={`min-h-[40px] px-3 py-2 rounded-full border text-xs transition-all active:scale-[0.98] active:translate-y-[0.5px] ${canManualSnapshot ? 'bg-white/80 dark:bg-slate-800/60 text-gray-500 hover:text-rose-500 border-white/50 hover:shadow-[0_10px_22px_-18px_rgba(244,63,94,0.35)]' : 'bg-white/30 dark:bg-slate-800/30 text-gray-400/70 border-white/20 cursor-not-allowed'}`}
                                    title={t('inspiration.saveVersion')}
                                >
                                    <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                        <Save size={14} />
                                        {!isMobile && t('inspiration.saveVersion')}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setShowHistory(true)}
                                    className="min-h-[40px] px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/60 text-gray-500 hover:text-rose-500 border border-white/50 text-xs transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:shadow-[0_10px_22px_-18px_rgba(244,63,94,0.35)]"
                                    title={t('inspiration.versionHistory')}
                                >
                                    <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                        <History size={14} />
                                        {!isMobile && t('inspiration.versionHistory')}
                                    </span>
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!canCopy}
                                    className={`min-h-[40px] px-3 py-2 rounded-full border text-xs transition-all active:scale-[0.98] active:translate-y-[0.5px] ${canCopy ? 'bg-white/80 dark:bg-slate-800/60 text-gray-500 hover:text-rose-500 border-white/50 hover:shadow-[0_10px_22px_-18px_rgba(244,63,94,0.35)]' : 'bg-white/30 dark:bg-slate-800/30 text-gray-400/70 border-white/20 cursor-not-allowed'}`}
                                    title={t('common.copy')}
                                >
                                    <span className={`inline-flex items-center ${isMobile ? '' : 'gap-2'}`}>
                                        <Copy size={14} />
                                        {!isMobile && (copiedAt ? t('common.copied') : t('common.copy'))}
                                    </span>
                                </button>
                                <div className="relative">
                                    <button
                                        ref={exportButtonRef}
                                        onClick={() => setShowExport((v) => !v)}
                                        className="min-h-[40px] px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/60 text-gray-500 hover:text-rose-500 border border-white/50 text-xs transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:shadow-[0_10px_22px_-18px_rgba(244,63,94,0.35)]"
                                        title={t('inspiration.export')}
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
                                                <button onClick={() => exportDoc('md')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                    {t('inspiration.exportMarkdown')}
                                                </button>
                                                <button onClick={() => exportDoc('html')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                    {t('inspiration.exportHtml')}
                                                </button>
                                                <button onClick={() => exportDoc('txt')} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                    {t('inspiration.exportTxt')}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className={`mt-4 flex ${isMobile ? 'flex-col gap-3' : 'items-end justify-between gap-6'}`}>
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
                                    w-full font-semibold bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 tracking-tight shrink-0 leading-tight transition-all duration-300 text-gray-900 dark:text-gray-100
                                    ${isMobile ? 'text-3xl' : 'text-5xl'}
                                `}
                                placeholder={t('inspiration.untitled')}
                            />
                            <div className={`flex flex-col ${isMobile ? 'items-start' : 'items-end'} text-[11px] text-gray-400/80 dark:text-gray-500/80 font-medium`}>
                                <div className="flex flex-wrap gap-3">
                                    <span className="tabular-nums font-mono">{wordCount} {t(wordCountLabelKey)}</span>
                                    {!isMobile && wordCountLabelKey !== 'inspiration.characters' && (
                                        <span className="tabular-nums font-mono">{charCount} {t('inspiration.characters')}</span>
                                    )}
                                    {!isMobile && readMinutes > 0 && (
                                        <span className="tabular-nums font-mono">{readMinutes} {t('inspiration.readTime')}</span>
                                    )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="flex items-center gap-2 uppercase text-[9px] tracking-widest opacity-70">
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusNeedsAttention ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400/70'}`} />
                                        {statusLabel}
                                    </span>
                                    {lastSavedAt ? (
                                        <span className="text-[9px] uppercase tracking-widest opacity-60">
                                            {t('inspiration.lastSaved')} {formatTimeShort(lastSavedAt)}
                                        </span>
                                    ) : null}
                                    {hasPendingRemote ? (
                                        <span className="text-[9px] uppercase tracking-widest text-amber-500/80">
                                            {t('inspiration.pendingRemote')}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {pendingRemoteHtml && !conflictState && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl px-3 py-2">
                            <span className="text-amber-700 dark:text-amber-200">{t('inspiration.pendingRemote')}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleApplyPendingRemote}
                                    className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/80 text-amber-700 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40 text-xs"
                                >
                                    {t('inspiration.applyRemote')}
                                </button>
                                <button
                                    onClick={handleKeepPendingLocal}
                                    className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs"
                                >
                                    {t('inspiration.keepLocal')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onFocus={() => setIsEditorFocused(true)}
                            onBlur={() => setIsEditorFocused(false)}
                            spellCheck
                            className={`
                                w-full outline-none text-gray-700 dark:text-gray-200 font-['Fraunces'] leading-[1.85] min-h-[50vh] empty:before:content-[attr(placeholder)] empty:before:text-gray-300/80 dark:empty:before:text-gray-600/80 focus:before:content-none selection:bg-rose-100/60 dark:selection:bg-rose-500/30 transition-all duration-300 caret-rose-500
                                ${isMobile ? 'text-lg' : 'text-xl'}
                            `}
                            placeholder={t('inspiration.placeholder')}
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', outline: 'none' }}
                        />

                        {/* End of content indicator */}
                        <div className="mt-32 flex flex-col items-center opacity-20">
                            <div className="w-2 h-2 rounded-full bg-rose-400 mb-4" />
                            <div className="w-1 h-1 rounded-full bg-rose-300" />
                        </div>
                    </div>
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
                                    className="text-xs text-gray-400 hover:text-rose-500"
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
                                                className="px-3 py-1.5 text-xs rounded-full bg-rose-500 text-white"
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
