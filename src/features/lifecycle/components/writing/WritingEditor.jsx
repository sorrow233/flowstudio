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
import { clipboardToMarkup, insertMarkupAtCaret } from './pasteUtils';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';
import FloatingColorPicker from './FloatingColorPicker';
import ConflictBanner from './ConflictBanner';
import VersionHistoryModal from './VersionHistoryModal';
import { useEditorAutoSave } from './hooks/useEditorAutoSave';
import { useFloatingToolbar } from './hooks/useFloatingToolbar';
import { useEditorSync } from './hooks/useEditorSync';

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

    const [title, setTitle] = useState('');
    const [contentMarkup, setContentMarkup] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [wordCountLabelKey, setWordCountLabelKey] = useState('inspiration.words');
    const [charCount, setCharCount] = useState(0);
    const [readMinutes, setReadMinutes] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [safeTop, setSafeTop] = useState(0);
    const [copiedAt, setCopiedAt] = useState(null);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    const statsTimeoutRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);

    const updateStatsFromText = useCallback((text) => {
        const words = computeWordCount(text);
        const chars = computeCharCount(text);
        setWordCountLabelKey(detectWordCountLabel(text));
        setWordCount(words);
        setCharCount(chars);
        setReadMinutes(computeReadMinutes(words, chars));
    }, []);

    const updateStatsFromEditor = useCallback(() => {
        if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        statsTimeoutRef.current = setTimeout(() => {
            updateStatsFromText(editorRef.current?.innerText || '');
        }, 250);
    }, [updateStatsFromText]);

    useEffect(() => {
        if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        statsTimeoutRef.current = setTimeout(() => {
            updateStatsFromText(markupToPlain(contentMarkup || ''));
        }, 250);

        return () => {
            if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
        };
    }, [contentMarkup, updateStatsFromText]);

    const {
        addSnapshot,
        canManualSnapshot,
        handleManualSnapshot,
        isSaving,
        lastSavedAt,
        versions,
    } = useEditorAutoSave({
        writingDoc,
        title,
        contentMarkup,
        editorRef,
        wordCount,
        onUpdate,
        isDirty,
        setIsDirty,
    });

    const {
        conflictPreview,
        conflictState,
        handleApplyPendingRemote,
        handleApplyPendingRemoteOnBlur,
        handleConflictKeepLocal,
        handleConflictUseRemote,
        handleKeepPendingLocal,
        pendingRemoteMarkup,
        requestForceRemoteApply,
    } = useEditorSync({
        writingDoc,
        title,
        setTitle,
        isDirty,
        setIsDirty,
        contentMarkup,
        setContentMarkup,
        editorRef,
        updateStatsFromEditor,
        onUpdate,
        addSnapshot,
    });

    const { toolbarPosition, setToolbarPosition } = useFloatingToolbar({
        editorRef,
        isMobile,
        safeTop,
    });

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

        events.forEach((eventName) => window.addEventListener(eventName, handler, { passive: true }));
        resetInactivityTimer();

        return () => {
            events.forEach((eventName) => window.removeEventListener(eventName, handler, { passive: true }));
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

    useEffect(() => {
        if (!copiedAt) return;
        const timer = setTimeout(() => setCopiedAt(null), 1800);
        return () => clearTimeout(timer);
    }, [copiedAt]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowActions(false);
                setShowHistory(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!editorRef.current || document.activeElement !== editorRef.current) return;

            const isMod = event.metaKey || event.ctrlKey;
            if (!isMod) return;

            const key = event.key.toLowerCase();
            if (key === 's') {
                event.preventDefault();
                handleManualSnapshot();
                return;
            }
            if (key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (canUndo) {
                    requestForceRemoteApply();
                    onUndo?.();
                }
                return;
            }
            if ((key === 'z' && event.shiftKey) || key === 'y') {
                event.preventDefault();
                if (canRedo) {
                    requestForceRemoteApply();
                    onRedo?.();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canRedo, canUndo, handleManualSnapshot, onRedo, onUndo, requestForceRemoteApply]);

    const statusLabel = useMemo(() => {
        if (syncStatus === 'offline' || syncStatus === 'disconnected') return t('inspiration.offline');
        if (isSaving || isDirty) return t('inspiration.saving');
        if (syncStatus === 'syncing') return t('inspiration.syncing');
        return t('inspiration.synced');
    }, [isDirty, isSaving, syncStatus, t]);

    const isOffline = syncStatus === 'offline' || syncStatus === 'disconnected';
    const isSyncing = isSaving || isDirty || syncStatus === 'syncing';
    const statusNeedsAttention = isOffline || isSyncing;
    const hasPendingRemote = Boolean(pendingRemoteMarkup);
    const canCopy = Boolean((title || '').trim() || (contentMarkup || '').trim());

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        setContentMarkup(htmlToMarkup(editorRef.current));
        setIsDirty(true);
        updateStatsFromEditor();
    }, [updateStatsFromEditor]);

    const handlePaste = useCallback((event) => {
        event.preventDefault();
        if (!editorRef.current) return;

        const markup = clipboardToMarkup(event.clipboardData);
        if (!markup) return;

        const inserted = insertMarkupAtCaret({
            editorElement: editorRef.current,
            markup,
            markupToHtml,
        });
        if (inserted) handleInput();
    }, [handleInput, markupToHtml]);

    const applyColor = (colorId) => {
        if (typeof window === 'undefined' || !window.getSelection) return;
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const colorConfig = COLOR_CONFIG.find((color) => color.id === colorId);
        if (!colorConfig) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        const highlightColor = colorConfig.highlight || 'rgba(125, 211, 252, 0.55)';
        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';

        try {
            range.surroundContents(span);
            selection.removeAllRanges();
            handleInput();
        } catch (error) {
            console.warn('Could not wrap selection', error);
        }

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

    return (
        <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/30" />
                <div className="absolute -top-14 right-20 h-56 w-56 rounded-full bg-sky-200/28 blur-[88px] dark:bg-sky-900/10" />
                <div className="absolute -bottom-16 left-20 h-48 w-48 rounded-full bg-blue-200/22 blur-[82px] dark:bg-blue-900/10" />
            </div>

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

            <AnimatePresence>
                {toolbarPosition && (
                    <FloatingColorPicker
                        position={toolbarPosition}
                        onApplyColor={applyColor}
                        isMobile={isMobile}
                    />
                )}
            </AnimatePresence>

            <div
                className="relative z-10 flex-1 overflow-y-auto custom-scrollbar touch-scroll overscroll-y-contain"
                style={{ paddingTop: conflictState ? safeTop + 82 : safeTop + 16 }}
                onClick={(event) => {
                    if (event.target === editorRef.current) return;
                    if (event.target instanceof Element && event.target.closest('button, input, [role="menu"]')) return;
                    editorRef.current?.focus();
                }}
            >
                <div className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-10">
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
                            onCloseSidebar={onCloseSidebar}
                            statusLabel={statusLabel}
                            statusNeedsAttention={statusNeedsAttention}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            canManualSnapshot={canManualSnapshot}
                            canCopy={canCopy}
                            copiedAt={copiedAt}
                            showActions={showActions}
                            onUndo={() => {
                                if (!canUndo) return;
                                requestForceRemoteApply();
                                onUndo?.();
                            }}
                            onRedo={() => {
                                if (!canRedo) return;
                                requestForceRemoteApply();
                                onRedo?.();
                            }}
                            onManualSnapshot={handleManualSnapshot}
                            onShowHistory={() => setShowHistory(true)}
                            onCopy={handleCopy}
                            onToggleActions={() => setShowActions((value) => !value)}
                            onExport={exportDoc}
                            onCloseActions={() => setShowActions(false)}
                            isMobile={isMobile}
                            t={t}
                        />
                    </motion.div>

                    <div className={`${isMobile ? 'mt-8' : 'mt-11'}`}>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                                setIsDirty(true);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    editorRef.current?.focus();
                                }
                            }}
                            className={`w-full border-none bg-transparent font-semibold tracking-tight text-slate-800 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600 ${isMobile ? 'text-2xl' : 'text-3xl leading-tight'}`}
                            placeholder={t('inspiration.untitled')}
                            style={{
                                fontFamily: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif',
                            }}
                        />
                    </div>

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

                    <div
                        className={`rounded-3xl bg-white p-6 transition-all md:p-10 dark:bg-slate-900 ${isEditorFocused
                            ? 'shadow-[0_14px_30px_-24px_rgba(14,116,255,0.28)] dark:shadow-none'
                            : 'shadow-none'}`}
                    >
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onPaste={handlePaste}
                            onFocus={() => {
                                setIsEditorFocused(true);
                            }}
                            onBlur={() => {
                                setIsEditorFocused(false);
                                handleApplyPendingRemoteOnBlur();
                            }}
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
