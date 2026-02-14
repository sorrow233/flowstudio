import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';
import {
    htmlToMarkup,
    markupToHtml,
    markupToPlain,
    markupToMarkdown,
    computeWordCount,
    computeCharCount,
    computeReadMinutes,
    detectWordCountLabel,
    downloadContent,
} from './editorUtils';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';
import FloatingColorPicker from './FloatingColorPicker';
import ConflictBanner from './ConflictBanner';
import VersionHistoryModal from './VersionHistoryModal';

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
const SNAPSHOT_MIN_CHANGE = 200;
const MAX_VERSIONS = 50;
const normalizeMarkupForSync = (value = '') =>
    (value || '')
        .replace(/\r\n/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/\n+$/g, '');

const WritingEditor = ({
    doc: writingDoc,
    onUpdate,
    isSidebarOpen,
    onToggleSidebar,
    onCloseSidebar,
    isMobile,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    syncStatus = 'synced',
}) => {
    const { t } = useTranslation();
    const editorRef = useRef(null);

    // ---------- Local state ----------
    const [title, setTitle] = useState('');
    const [contentMarkup, setContentMarkup] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [wordCountLabelKey, setWordCountLabelKey] = useState('inspiration.words');
    const [charCount, setCharCount] = useState(0);
    const [readMinutes, setReadMinutes] = useState(0);
    const [pendingRemoteHtml, setPendingRemoteHtml] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [conflictState, setConflictState] = useState(null);
    const [safeTop, setSafeTop] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [copiedAt, setCopiedAt] = useState(null);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);

    const lastSnapshotAtRef = useRef(0);
    const lastSnapshotContentRef = useRef('');
    const lastSeenRemoteContentRef = useRef('');
    const forceRemoteApplyRef = useRef(false);
    const statsTimeoutRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);

    // ---------- Inactivity Tracking ----------
    const resetInactivityTimer = useCallback(() => {
        if (!isMobile) {
            setIsToolbarVisible(true);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
            return;
        }

        setIsToolbarVisible(true);
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);

        inactivityTimeoutRef.current = setTimeout(() => {
            // Only hide if menus are closed and sidebar is possibly closed (optional, but requested to hide 2s after silence)
            if (!showActions && !showHistory) {
                setIsToolbarVisible(false);
            }
        }, 2000);
    }, [isMobile, showActions, showHistory]);

    useEffect(() => {
        if (!isMobile) {
            setIsToolbarVisible(true);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
            return undefined;
        }

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        const handler = () => resetInactivityTimer();

        events.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetInactivityTimer();

        return () => {
            events.forEach(e => window.removeEventListener(e, handler, { passive: true }));
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        };
    }, [isMobile, resetInactivityTimer]);

    useEffect(() => {
        if (!isMobile) {
            setIsToolbarVisible(true);
            return;
        }

        if (showActions || showHistory) {
            setIsToolbarVisible(true);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        } else {
            resetInactivityTimer();
        }
    }, [isMobile, showActions, showHistory, resetInactivityTimer]);

    // ---------- Derived ----------
    const hasUnsavedChanges = useMemo(() => {
        if (!writingDoc) return false;
        return title !== (writingDoc.title || '') || contentMarkup !== (writingDoc.content || '');
    }, [contentMarkup, title, writingDoc]);

    const statusLabel = useMemo(() => {
        if (syncStatus === 'offline' || syncStatus === 'disconnected') return t('inspiration.offline');
        if (isSaving || hasUnsavedChanges) return t('inspiration.saving');
        if (syncStatus === 'syncing') return t('inspiration.syncing');
        return t('inspiration.synced');
    }, [hasUnsavedChanges, isSaving, syncStatus, t]);

    const isOffline = syncStatus === 'offline' || syncStatus === 'disconnected';
    const isSyncing = isSaving || hasUnsavedChanges || syncStatus === 'syncing';
    const statusNeedsAttention = isOffline || isSyncing;

    const versions = useMemo(() => {
        if (!writingDoc?.versions || !Array.isArray(writingDoc.versions)) return [];
        return [...writingDoc.versions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [writingDoc?.versions]);

    const canManualSnapshot = Boolean(writingDoc) && contentMarkup !== (lastSnapshotContentRef.current || '');
    const hasPendingRemote = Boolean(pendingRemoteHtml);
    const canCopy = Boolean((title || '').trim() || (contentMarkup || '').trim());

    const conflictPreview = useMemo(() => {
        if (!conflictState?.remoteContent) return '';
        const cleaned = markupToPlain(conflictState.remoteContent).replace(/\s+/g, ' ').trim();
        return cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned;
    }, [conflictState?.remoteContent]);

    // ---------- Stat helpers ----------
    const updateStatsFromEditor = useCallback(() => {
        if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        statsTimeoutRef.current = setTimeout(() => {
            const text = editorRef.current?.innerText || '';
            const words = computeWordCount(text);
            const chars = computeCharCount(text);
            setWordCountLabelKey(detectWordCountLabel(text));
            setWordCount(words);
            setCharCount(chars);
            setReadMinutes(computeReadMinutes(words, chars));
        }, 800);
    }, []);

    useEffect(() => {
        return () => {
            if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        };
    }, []);

    // ---------- Snapshot helpers ----------
    const addSnapshot = useCallback(
        (snapshot) => {
            if (!writingDoc) return;
            const existing = Array.isArray(writingDoc.versions) ? writingDoc.versions : [];
            const next = [snapshot, ...existing].slice(0, MAX_VERSIONS);
            onUpdate(writingDoc.id, { versions: next });
        },
        [onUpdate, writingDoc],
    );

    const maybeSnapshot = useCallback(
        (markup) => {
            if (!writingDoc) return;
            const now = Date.now();
            if (now - lastSnapshotAtRef.current < SNAPSHOT_INTERVAL_MS) return;
            const delta = Math.abs((markup || '').length - (lastSnapshotContentRef.current || '').length);
            if (delta < SNAPSHOT_MIN_CHANGE) return;

            const snapshot = {
                id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
                timestamp: now,
                title: title || '',
                content: markup || '',
                wordCount: computeWordCount(editorRef.current?.innerText || ''),
            };
            addSnapshot(snapshot);
            lastSnapshotAtRef.current = now;
            lastSnapshotContentRef.current = markup || '';
        },
        [addSnapshot, title, writingDoc],
    );

    const handleManualSnapshot = useCallback(() => {
        if (!writingDoc) return;
        const now = Date.now();
        const snapshot = {
            id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: now,
            title: title || '',
            content: contentMarkup || '',
            wordCount,
        };
        addSnapshot(snapshot);
        lastSnapshotAtRef.current = now;
        lastSnapshotContentRef.current = contentMarkup || '';
    }, [addSnapshot, contentMarkup, title, wordCount, writingDoc]);

    // ---------- Effects ----------

    // Safe top inset
    useEffect(() => {
        const update = () => {
            const safeInset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top'));
            if (!Number.isNaN(safeInset) && safeInset > 0) { setSafeTop(safeInset); return; }
            if (typeof window !== 'undefined' && window.visualViewport) {
                setSafeTop(Math.max(0, window.visualViewport.offsetTop || 0));
            } else { setSafeTop(0); }
        };
        update();
        window.addEventListener('resize', update);
        window.visualViewport?.addEventListener('resize', update);
        return () => { window.removeEventListener('resize', update); window.visualViewport?.removeEventListener('resize', update); };
    }, []);

    // Last saved
    useEffect(() => {
        if (writingDoc?.lastModified) setLastSavedAt(writingDoc.lastModified);
        else if (writingDoc?.timestamp) setLastSavedAt(writingDoc.timestamp);
    }, [writingDoc?.lastModified, writingDoc?.timestamp]);

    // Copied toast auto-clear
    useEffect(() => {
        if (!copiedAt) return;
        const timer = setTimeout(() => setCopiedAt(null), 1800);
        return () => clearTimeout(timer);
    }, [copiedAt]);

    // Sync local state with document prop
    useEffect(() => {
        if (!writingDoc) return;
        const prevRemoteContentRaw = lastSeenRemoteContentRef.current;
        const prevRemoteContent = normalizeMarkupForSync(prevRemoteContentRaw);

        if (writingDoc.title !== title) setTitle(writingDoc.title || '');

        const remoteContentRaw = writingDoc.content || '';
        const remoteContent = normalizeMarkupForSync(remoteContentRaw);
        const remoteHtml = markupToHtml(remoteContentRaw);
        const liveLocalMarkupRaw = editorRef.current ? htmlToMarkup(editorRef.current) : contentMarkup;
        const liveLocalMarkup = normalizeMarkupForSync(liveLocalMarkupRaw);
        const localStateMarkup = normalizeMarkupForSync(contentMarkup);
        const remoteChanged = remoteContent !== prevRemoteContent;
        const remoteMatchesLocal = remoteContent === liveLocalMarkup;
        const localDirtySinceLastRemote = liveLocalMarkup !== prevRemoteContent;

        if (editorRef.current && remoteHtml !== editorRef.current.innerHTML) {
            const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
            const shouldForceApply = forceRemoteApplyRef.current;
            if (shouldForceApply) forceRemoteApplyRef.current = false;
            const shouldApplyImmediately = shouldForceApply || !isFocused || (remoteChanged && !localDirtySinceLastRemote);

            if (shouldApplyImmediately) {
                editorRef.current.innerHTML = remoteHtml;
                updateStatsFromEditor();
                setPendingRemoteHtml(null);
                setConflictState(null);
            } else if (!remoteChanged) {
                // 聚焦编辑期间的 DOM 结构差异（如 <div>/<br>）不应触发远端提示
            } else if (localDirtySinceLastRemote && !remoteMatchesLocal) {
                setConflictState({ remoteContent, remoteTitle: writingDoc.title || '', timestamp: Date.now() });
                setPendingRemoteHtml(null);
            } else if (!remoteMatchesLocal) {
                setPendingRemoteHtml(remoteHtml);
                setConflictState(null);
            } else {
                // 本地保存回写远端后，避免把确认同步误判为“远端更新”
                setPendingRemoteHtml(null);
                setConflictState(null);
            }
        }

        const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;
        if (remoteContent !== localStateMarkup) {
            if (!isFocused) setContentMarkup(remoteContentRaw);
            else if (remoteMatchesLocal) setContentMarkup(liveLocalMarkupRaw);
        }
        lastSeenRemoteContentRef.current = remoteContentRaw;
    }, [writingDoc?.id, writingDoc?.content, writingDoc?.title, contentMarkup, title, updateStatsFromEditor]);

    // Init snapshot ref
    useEffect(() => {
        if (!writingDoc) return;
        if (versions.length > 0) {
            lastSnapshotAtRef.current = versions[0].timestamp || Date.now();
            lastSnapshotContentRef.current = versions[0].content || '';
        } else {
            lastSnapshotAtRef.current = Date.now();
            lastSnapshotContentRef.current = writingDoc.content || '';
        }
    }, [writingDoc?.id, versions]);

    // ESC closes
    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') { setShowActions(false); setShowHistory(false); } };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);

    // Auto-save debounced
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!editorRef.current || !writingDoc) return;
            if (title !== (writingDoc.title || '') || contentMarkup !== (writingDoc.content || '')) {
                setIsSaving(true);
                onUpdate(writingDoc.id, { title, content: contentMarkup });
                setLastSavedAt(Date.now());
                setTimeout(() => setIsSaving(false), 500);
                maybeSnapshot(contentMarkup);
            } else {
                setIsSaving(false);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, contentMarkup, writingDoc, onUpdate, maybeSnapshot]);

    // Text Selection → Floating Color Picker
    useEffect(() => {
        const handleSelection = () => {
            if (typeof window === 'undefined') return;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || selection.isCollapsed) { setToolbarPosition(null); return; }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
                const offset = isMobile ? 80 : 60;
                const toolbarWidth = isMobile ? 220 : 170;
                const toolbarHeight = isMobile ? 56 : 46;
                const padding = 12;
                const maxLeft = window.innerWidth - toolbarWidth / 2 - padding;
                const minLeft = toolbarWidth / 2 + padding;
                const clampedLeft = Math.min(maxLeft, Math.max(minLeft, rect.left + rect.width / 2));
                const minTop = padding + safeTop;
                const maxTop = window.innerHeight - toolbarHeight - padding;
                const clampedTop = Math.min(maxTop, Math.max(minTop, rect.top - offset));
                setToolbarPosition({ top: clampedTop, left: clampedLeft });
            } else { setToolbarPosition(null); }
        };
        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, [isMobile, safeTop]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!editorRef.current || document.activeElement !== editorRef.current) return;
            const isMod = e.metaKey || e.ctrlKey;
            if (!isMod) return;
            const key = e.key.toLowerCase();
            if (key === 's') { e.preventDefault(); handleManualSnapshot(); return; }
            if (key === 'z' && !e.shiftKey) { e.preventDefault(); if (canUndo) { forceRemoteApplyRef.current = true; onUndo?.(); } return; }
            if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); if (canRedo) { forceRemoteApplyRef.current = true; onRedo?.(); } }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleManualSnapshot, canUndo, canRedo, onUndo, onRedo]);

    // ---------- Handlers ----------
    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        setContentMarkup(htmlToMarkup(editorRef.current));
        setIsSaving(true);
        updateStatsFromEditor();
    }, [updateStatsFromEditor]);

    const applyColor = (colorId) => {
        if (typeof window === 'undefined' || !window.getSelection) return;
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const colorConfig = COLOR_CONFIG.find((c) => c.id === colorId);
        if (!colorConfig) return;
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        const highlightColor = colorConfig.highlight || 'rgba(125, 211, 252, 0.55)';
        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';
        try { range.surroundContents(span); selection.removeAllRanges(); handleInput(); }
        catch (e) { console.warn('Could not wrap selection', e); }
        setToolbarPosition(null);
    };

    const restoreSnapshot = (snapshot) => {
        if (!writingDoc || !snapshot) return;
        setTitle(snapshot.title || '');
        setContentMarkup(snapshot.content || '');
        if (editorRef.current) editorRef.current.innerHTML = markupToHtml(snapshot.content || '');
        updateStatsFromEditor();
        onUpdate(writingDoc.id, { title: snapshot.title || '', content: snapshot.content || '' });
        setShowHistory(false);
    };

    const exportDoc = (format) => {
        if (!writingDoc) return;
        const markup = contentMarkup || '';
        if (format === 'md') {
            downloadContent(`# ${title || ''}\n\n${markupToMarkdown(markup)}`, 'text/markdown', 'md', title);
        } else if (format === 'html') {
            const body = markupToHtml(markup);
            downloadContent(`<!doctype html><html><head><meta charset="utf-8" /><title>${title || ''}</title></head><body>${body}</body></html>`, 'text/html', 'html', title);
        } else {
            downloadContent(`${title ? `${title}\n\n` : ''}${markupToPlain(markup)}`, 'text/plain', 'txt', title);
        }
        setShowActions(false);
    };

    const handleCopy = async () => {
        if (!canCopy) return;
        const plain = markupToPlain(contentMarkup || '');
        const output = title ? `${title}\n\n${plain}` : plain;
        try {
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(output);
            else {
                const ta = document.createElement('textarea');
                ta.value = output; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
            }
            setCopiedAt(Date.now());
        } catch (err) { console.warn('Copy failed:', err); }
    };

    const handleApplyPendingRemote = () => {
        if (!pendingRemoteHtml || !writingDoc) return;
        if (editorRef.current) editorRef.current.innerHTML = pendingRemoteHtml;
        setContentMarkup(writingDoc.content || '');
        updateStatsFromEditor();
        setPendingRemoteHtml(null); setConflictState(null);
        lastSeenRemoteContentRef.current = writingDoc.content || '';
    };

    const handleKeepPendingLocal = () => {
        setPendingRemoteHtml(null);
        if (writingDoc?.content) lastSeenRemoteContentRef.current = writingDoc.content;
    };

    const handleConflictKeepLocal = () => {
        if (!conflictState || !writingDoc) return;
        addSnapshot({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(), title: conflictState.remoteTitle || '',
            content: conflictState.remoteContent || '',
            wordCount: computeWordCount(markupToPlain(conflictState.remoteContent || '')),
        });
        onUpdate(writingDoc.id, { title: title || '', content: contentMarkup || '' });
        setConflictState(null); setPendingRemoteHtml(null);
        lastSeenRemoteContentRef.current = conflictState.remoteContent || '';
    };

    const handleConflictUseRemote = () => {
        if (!conflictState) return;
        const remote = conflictState.remoteContent || '';
        const remoteTitle = conflictState.remoteTitle || '';
        setTitle(remoteTitle); setContentMarkup(remote);
        if (editorRef.current) editorRef.current.innerHTML = markupToHtml(remote);
        updateStatsFromEditor();
        setConflictState(null); setPendingRemoteHtml(null);
        lastSeenRemoteContentRef.current = remote;
    };

    // ---------- Render ----------
    return (
        <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/30" />
                <div className="absolute -top-14 right-20 h-56 w-56 rounded-full bg-sky-200/28 blur-[88px] dark:bg-sky-900/10" />
                <div className="absolute -bottom-16 left-20 h-48 w-48 rounded-full bg-blue-200/22 blur-[82px] dark:bg-blue-900/10" />
            </div>

            {/* Conflict banner */}
            <AnimatePresence>
                {conflictState && (
                    <ConflictBanner
                        conflictPreview={conflictPreview}
                        onUseRemote={handleConflictUseRemote}
                        onKeepLocal={handleConflictKeepLocal}
                        isMobile={isMobile}
                        safeTop={safeTop}
                        t={t}
                    />
                )}
            </AnimatePresence>

            {/* Floating color picker */}
            <AnimatePresence>
                {toolbarPosition && (
                    <FloatingColorPicker
                        position={toolbarPosition}
                        onApplyColor={applyColor}
                        isMobile={isMobile}
                    />
                )}
            </AnimatePresence>

            {/* Main scrollable area */}
            <div
                className="relative z-10 flex-1 overflow-y-auto custom-scrollbar touch-scroll overscroll-y-contain"
                style={{ paddingTop: conflictState ? safeTop + 82 : safeTop + 16 }}
                onClick={(e) => {
                    if (e.target === editorRef.current) return;
                    if (e.target instanceof Element && e.target.closest('button, input, [role="menu"]')) return;
                    editorRef.current?.focus();
                }}
            >
                <div className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-10">
                    {/* Toolbar */}
                    <motion.div
                        className="sticky z-30"
                        style={{ top: isMobile ? 6 : 12 }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{
                            opacity: isToolbarVisible ? 1 : 0,
                            y: isToolbarVisible ? 0 : -8,
                            pointerEvents: isToolbarVisible ? 'auto' : 'none'
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <EditorToolbar
                            isSidebarOpen={isSidebarOpen}
                            onToggleSidebar={onToggleSidebar}
                            statusLabel={statusLabel}
                            statusNeedsAttention={statusNeedsAttention}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            canManualSnapshot={canManualSnapshot}
                            canCopy={canCopy}
                            copiedAt={copiedAt}
                            showActions={showActions}
                            onUndo={() => { if (canUndo) { forceRemoteApplyRef.current = true; onUndo?.(); } }}
                            onRedo={() => { if (canRedo) { forceRemoteApplyRef.current = true; onRedo?.(); } }}
                            onManualSnapshot={handleManualSnapshot}
                            onShowHistory={() => setShowHistory(true)}
                            onCopy={handleCopy}
                            onToggleActions={() => setShowActions((v) => !v)}
                            onExport={exportDoc}
                            onCloseActions={() => setShowActions(false)}
                            isMobile={isMobile}
                            t={t}
                        />
                    </motion.div>

                    {/* Title */}
                    <div className={`${isMobile ? 'mt-8' : 'mt-11'}`}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); editorRef.current?.focus(); }
                            }}
                            className={`w-full border-none bg-transparent font-semibold tracking-tight text-slate-800 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600 ${isMobile ? 'text-2xl' : 'text-3xl leading-tight'
                                }`}
                            placeholder={t('inspiration.untitled')}
                            style={{
                                fontFamily: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif',
                            }}
                        />
                    </div>

                    {/* Status bar */}
                    <div className="mb-6 mt-3">
                        <EditorStatusBar
                            wordCount={wordCount}
                            wordCountLabelKey={wordCountLabelKey}
                            charCount={charCount}
                            readMinutes={readMinutes}
                            lastSavedAt={lastSavedAt}
                            hasPendingRemote={hasPendingRemote}
                            isMobile={isMobile}
                            t={t}
                        />
                    </div>

                    {/* Pending remote banner */}
                    {pendingRemoteHtml && !conflictState && (
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/80 px-4 py-2.5 text-[12px] text-sky-700">
                            <span>{t('inspiration.pendingRemote')}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleApplyPendingRemote}
                                    className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs transition hover:bg-sky-50"
                                >
                                    {t('inspiration.applyRemote')}
                                </button>
                                <button
                                    onClick={handleKeepPendingLocal}
                                    className="rounded-full bg-sky-600 px-3 py-1 text-xs text-white transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                                >
                                    {t('inspiration.keepLocal')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content editor */}
                    <div
                        className={`rounded-3xl bg-white p-6 transition-all md:p-10 dark:bg-slate-900 ${isEditorFocused
                            ? 'shadow-[0_14px_30px_-24px_rgba(14,116,255,0.28)] dark:shadow-none'
                            : 'shadow-none'
                            }`}
                    >
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onFocus={() => {
                                setIsEditorFocused(true);
                            }}
                            onBlur={() => setIsEditorFocused(false)}
                            spellCheck
                            className="min-h-[55vh] w-full text-lg text-slate-700 outline-none caret-sky-500 selection:bg-sky-100/80 empty:before:text-slate-300 dark:text-slate-300 dark:caret-sky-400 dark:selection:bg-sky-900/40 dark:empty:before:text-slate-600"
                            placeholder={t('inspiration.placeholder')}
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.625,
                                fontFamily: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif',
                                letterSpacing: 'normal',
                            }}
                        />
                    </div>
                </div>
            </div>

            {isMobile && <div className="h-safe-bottom" />}

            {/* Version History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <VersionHistoryModal
                        versions={versions}
                        onRestore={restoreSnapshot}
                        onClose={() => setShowHistory(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingEditor;
