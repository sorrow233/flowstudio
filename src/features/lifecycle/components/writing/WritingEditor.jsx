import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';
import {
    markupToHtml,
    markupToPlain,
    markupToMarkdown,
    computeWordCount,
    computeCharCount,
    computeReadMinutes,
    detectWordCountLabel,
    downloadContent,
} from './editorUtils';
import { writingSchema } from './prosemirrorSchema';
import { docToMarkup, markupToDoc, textToPasteSlice } from './prosemirrorMarkup';
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

const createEditorState = (markup = '') =>
    EditorState.create({
        schema: writingSchema,
        doc: markupToDoc(writingSchema, markup),
    });

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
    const editorViewRef = useRef(null);

    // ---------- Local state ----------
    const [title, setTitle] = useState('');
    const [contentMarkup, setContentMarkup] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [wordCountLabelKey, setWordCountLabelKey] = useState('inspiration.words');
    const [charCount, setCharCount] = useState(0);
    const [readMinutes, setReadMinutes] = useState(0);
    const [pendingRemoteMarkup, setPendingRemoteMarkup] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [conflictState, setConflictState] = useState(null);
    const [safeTop, setSafeTop] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [copiedAt, setCopiedAt] = useState(null);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    const lastSnapshotAtRef = useRef(0);
    const lastSnapshotContentRef = useRef('');
    const lastSeenRemoteContentRef = useRef('');
    const forceRemoteApplyRef = useRef(false);
    const statsTimeoutRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);
    const selectionFrameRef = useRef(null);

    const replaceEditorMarkup = useCallback((nextMarkup = '') => {
        const view = editorViewRef.current;
        if (!view) return;
        view.updateState(createEditorState(nextMarkup));
    }, []);

    const getEditorMarkup = useCallback(() => {
        const view = editorViewRef.current;
        if (!view) return contentMarkup;
        return docToMarkup(view.state.doc);
    }, [contentMarkup]);

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

        events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
        resetInactivityTimer();

        return () => {
            events.forEach((e) => window.removeEventListener(e, handler, { passive: true }));
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
    useEffect(() => {
        if (!writingDoc) {
            setIsDirty(false);
            return;
        }
        setIsDirty(title !== (writingDoc.title || '') || contentMarkup !== (writingDoc.content || ''));
    }, [title, contentMarkup, writingDoc?.id, writingDoc?.title, writingDoc?.content]);

    const statusLabel = useMemo(() => {
        if (syncStatus === 'offline' || syncStatus === 'disconnected') return t('inspiration.offline');
        if (isSaving || isDirty) return t('inspiration.saving');
        if (syncStatus === 'syncing') return t('inspiration.syncing');
        return t('inspiration.synced');
    }, [isDirty, isSaving, syncStatus, t]);

    const isOffline = syncStatus === 'offline' || syncStatus === 'disconnected';
    const isSyncing = isSaving || isDirty || syncStatus === 'syncing';
    const statusNeedsAttention = isOffline || isSyncing;

    const versions = useMemo(() => {
        if (!writingDoc?.versions || !Array.isArray(writingDoc.versions)) return [];
        return [...writingDoc.versions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [writingDoc?.versions]);

    const canManualSnapshot = Boolean(writingDoc) && contentMarkup !== (lastSnapshotContentRef.current || '');
    const hasPendingRemote = Boolean(pendingRemoteMarkup);
    const canCopy = Boolean((title || '').trim() || (contentMarkup || '').trim());

    const conflictPreview = useMemo(() => {
        if (!conflictState?.remoteContent) return '';
        const cleaned = markupToPlain(conflictState.remoteContent).replace(/\s+/g, ' ').trim();
        return cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned;
    }, [conflictState?.remoteContent]);

    // ---------- Stat helpers ----------
    const updateStatsFromMarkup = useCallback((markup = '') => {
        const text = markupToPlain(markup || '');
        const words = computeWordCount(text);
        const chars = computeCharCount(text);
        setWordCountLabelKey(detectWordCountLabel(text));
        setWordCount(words);
        setCharCount(chars);
        setReadMinutes(computeReadMinutes(words, chars));
    }, []);

    useEffect(() => {
        return () => {
            if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        statsTimeoutRef.current = setTimeout(() => {
            updateStatsFromMarkup(contentMarkup);
        }, 250);
        return () => {
            if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        };
    }, [contentMarkup, updateStatsFromMarkup]);

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
                wordCount: computeWordCount(markupToPlain(markup || '')),
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

    // Create ProseMirror editor view
    useEffect(() => {
        if (!editorRef.current || !writingDoc) return;

        const initialMarkup = writingDoc.content || '';
        let view;

        view = new EditorView(editorRef.current, {
            state: createEditorState(initialMarkup),
            dispatchTransaction: (transaction) => {
                const nextState = view.state.apply(transaction);
                view.updateState(nextState);
                if (transaction.docChanged) {
                    setContentMarkup(docToMarkup(nextState.doc));
                    setIsSaving(true);
                }
            },
            attributes: {
                class: 'min-h-[55vh] w-full outline-none caret-sky-500 selection:bg-sky-100/80 dark:caret-sky-400 dark:selection:bg-sky-900/40',
                spellcheck: 'true',
            },
            handleDOMEvents: {
                paste: (innerView, event) => {
                    const text = event.clipboardData?.getData('text/plain');
                    if (typeof text !== 'string') return false;
                    event.preventDefault();
                    const slice = textToPasteSlice(innerView.state.schema, text);
                    innerView.dispatch(innerView.state.tr.replaceSelection(slice).scrollIntoView());
                    return true;
                },
                focus: () => {
                    setIsEditorFocused(true);
                    return false;
                },
                blur: () => {
                    setIsEditorFocused(false);
                    return false;
                },
            },
        });

        editorViewRef.current = view;
        setContentMarkup(initialMarkup);
        setToolbarPosition(null);

        return () => {
            setToolbarPosition(null);
            editorViewRef.current?.destroy();
            editorViewRef.current = null;
        };
    }, [writingDoc?.id]);

    // Safe top inset
    useEffect(() => {
        const update = () => {
            const safeInset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top'));
            const normalizedSafeTop = Number.isFinite(safeInset) ? Math.max(0, safeInset) : 0;

            if (typeof window !== 'undefined' && window.visualViewport) {
                const viewport = window.visualViewport;
                const keyboardLikelyOpen = viewport.height < window.innerHeight - 120;
                if (keyboardLikelyOpen) {
                    setSafeTop(0);
                    return;
                }
            }

            setSafeTop(Math.min(normalizedSafeTop, 56));
        };
        update();
        window.addEventListener('resize', update);
        window.visualViewport?.addEventListener('resize', update);
        return () => {
            window.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('resize', update);
        };
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
        const liveLocalMarkupRaw = getEditorMarkup();
        const liveLocalMarkup = normalizeMarkupForSync(liveLocalMarkupRaw);
        const localStateMarkup = normalizeMarkupForSync(contentMarkup);
        const remoteChanged = remoteContent !== prevRemoteContent;
        const remoteMatchesLocal = remoteContent === liveLocalMarkup;
        const localDirtySinceLastRemote = liveLocalMarkup !== prevRemoteContent;
        const editorHasFocus = editorViewRef.current?.hasFocus() || false;

        if (remoteContent !== liveLocalMarkup) {
            const shouldForceApply = forceRemoteApplyRef.current;
            if (shouldForceApply) forceRemoteApplyRef.current = false;
            const shouldApplyImmediately = shouldForceApply || !editorHasFocus || (remoteChanged && !localDirtySinceLastRemote);

            if (shouldApplyImmediately) {
                replaceEditorMarkup(remoteContentRaw);
                setContentMarkup(remoteContentRaw);
                setPendingRemoteMarkup(null);
                setConflictState(null);
            } else if (!remoteChanged) {
                // 忽略仅由本地 DOM 归一化带来的差异
            } else if (localDirtySinceLastRemote && !remoteMatchesLocal) {
                setConflictState({ remoteContent, remoteTitle: writingDoc.title || '', timestamp: Date.now() });
                setPendingRemoteMarkup(null);
            } else if (!remoteMatchesLocal) {
                setPendingRemoteMarkup(remoteContentRaw);
                setConflictState(null);
            } else {
                setPendingRemoteMarkup(null);
                setConflictState(null);
            }
        }

        if (remoteContent !== localStateMarkup) {
            if (!editorHasFocus) setContentMarkup(remoteContentRaw);
            else if (remoteMatchesLocal) setContentMarkup(liveLocalMarkupRaw);
        }
        lastSeenRemoteContentRef.current = remoteContentRaw;
    }, [
        writingDoc?.id,
        writingDoc?.content,
        writingDoc?.title,
        contentMarkup,
        title,
        getEditorMarkup,
        replaceEditorMarkup,
    ]);

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
        const h = (e) => {
            if (e.key === 'Escape') {
                setShowActions(false);
                setShowHistory(false);
            }
        };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);

    // Auto-save debounced
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!writingDoc) return;
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
        const updateToolbarFromSelection = () => {
            if (typeof window === 'undefined') return;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            if (!editorRef.current) {
                setToolbarPosition(null);
                return;
            }
            const selectionInsideEditor = (
                (selection.anchorNode && editorRef.current.contains(selection.anchorNode))
                || (selection.focusNode && editorRef.current.contains(selection.focusNode))
                || editorRef.current.contains(range.commonAncestorContainer)
            );
            if (!selectionInsideEditor) {
                setToolbarPosition(null);
                return;
            }

            const rect = range.getBoundingClientRect();
            if (!rect || (rect.width === 0 && rect.height === 0)) {
                setToolbarPosition(null);
                return;
            }

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
        };

        const handleSelection = () => {
            if (typeof window === 'undefined') return;
            if (selectionFrameRef.current !== null) return;
            selectionFrameRef.current = window.requestAnimationFrame(() => {
                selectionFrameRef.current = null;
                updateToolbarFromSelection();
            });
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => {
            document.removeEventListener('selectionchange', handleSelection);
            if (typeof window !== 'undefined' && selectionFrameRef.current !== null) {
                window.cancelAnimationFrame(selectionFrameRef.current);
                selectionFrameRef.current = null;
            }
        };
    }, [isMobile, safeTop]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const view = editorViewRef.current;
            if (!view || !view.hasFocus()) return;
            const isMod = e.metaKey || e.ctrlKey;
            if (!isMod) return;
            const key = e.key.toLowerCase();
            if (key === 's') {
                e.preventDefault();
                handleManualSnapshot();
                return;
            }
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) {
                    forceRemoteApplyRef.current = true;
                    onUndo?.();
                }
                return;
            }
            if ((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                if (canRedo) {
                    forceRemoteApplyRef.current = true;
                    onRedo?.();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleManualSnapshot, canUndo, canRedo, onUndo, onRedo]);

    // ---------- Handlers ----------
    const applyColor = (colorId) => {
        const view = editorViewRef.current;
        if (!view) return;

        const colorConfig = COLOR_CONFIG.find((c) => c.id === colorId);
        if (!colorConfig) return;

        const { from, to, empty } = view.state.selection;
        if (empty) return;

        const markType = view.state.schema.marks.highlight;
        if (!markType) return;

        const tr = view.state.tr
            .removeMark(from, to, markType)
            .addMark(from, to, markType.create({ colorId }))
            .scrollIntoView();

        view.dispatch(tr);
        view.focus();
        setToolbarPosition(null);
    };

    const restoreSnapshot = (snapshot) => {
        if (!writingDoc || !snapshot) return;
        const snapshotTitle = snapshot.title || '';
        const snapshotContent = snapshot.content || '';
        setTitle(snapshotTitle);
        setContentMarkup(snapshotContent);
        replaceEditorMarkup(snapshotContent);
        onUpdate(writingDoc.id, { title: snapshotTitle, content: snapshotContent });
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
                ta.value = output;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            setCopiedAt(Date.now());
        } catch (err) {
            console.warn('Copy failed:', err);
        }
    };

    const handleApplyPendingRemote = () => {
        if (!pendingRemoteMarkup || !writingDoc) return;
        replaceEditorMarkup(pendingRemoteMarkup);
        setContentMarkup(pendingRemoteMarkup);
        setPendingRemoteMarkup(null);
        setConflictState(null);
        lastSeenRemoteContentRef.current = pendingRemoteMarkup;
    };

    const handleKeepPendingLocal = () => {
        setPendingRemoteMarkup(null);
        if (writingDoc?.content) lastSeenRemoteContentRef.current = writingDoc.content;
    };

    const handleConflictKeepLocal = () => {
        if (!conflictState || !writingDoc) return;
        addSnapshot({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            title: conflictState.remoteTitle || '',
            content: conflictState.remoteContent || '',
            wordCount: computeWordCount(markupToPlain(conflictState.remoteContent || '')),
        });
        onUpdate(writingDoc.id, { title: title || '', content: contentMarkup || '' });
        setConflictState(null);
        setPendingRemoteMarkup(null);
        lastSeenRemoteContentRef.current = conflictState.remoteContent || '';
    };

    const handleConflictUseRemote = () => {
        if (!conflictState) return;
        const remote = conflictState.remoteContent || '';
        const remoteTitle = conflictState.remoteTitle || '';
        setTitle(remoteTitle);
        setContentMarkup(remote);
        replaceEditorMarkup(remote);
        setConflictState(null);
        setPendingRemoteMarkup(null);
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
                    if (e.target instanceof Element && e.target.closest('button, input, [role="menu"]')) return;
                    editorViewRef.current?.focus();
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
                            pointerEvents: isToolbarVisible ? 'auto' : 'none',
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
                            onUndo={() => {
                                if (canUndo) {
                                    forceRemoteApplyRef.current = true;
                                    onUndo?.();
                                }
                            }}
                            onRedo={() => {
                                if (canRedo) {
                                    forceRemoteApplyRef.current = true;
                                    onRedo?.();
                                }
                            }}
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
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    editorViewRef.current?.focus();
                                }
                            }}
                            className={`w-full border-none bg-transparent font-semibold tracking-tight text-slate-800 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600 ${isMobile ? 'text-2xl' : 'text-3xl leading-tight'}`}
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
                    {pendingRemoteMarkup && !conflictState && (
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
                            : 'shadow-none'}`}
                    >
                        <div className="writing-editor-prosemirror">
                            <div ref={editorRef} aria-label={t('inspiration.placeholder')} />
                        </div>
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
