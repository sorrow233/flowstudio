import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';
import {
    computeWordCount,
    computeCharCount,
    computeReadMinutes,
    detectWordCountLabel,
    downloadContent,
} from './editorUtils';
import {
    htmlToMarkupFull as htmlToMarkup,
    markupToHtmlFull as markupToHtml,
    stripAllMarkdown as markupToPlain,
    markupToMarkdownFull as markupToMarkdown,
} from './markdownParser';
import { buildMarkdownSnippet } from './markdown/quickActions';
import WritingImageOverlay from './WritingImageOverlay';
import { clipboardToMarkup, insertMarkupAtCaret } from './pasteUtils';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';
import FloatingColorPicker from './FloatingColorPicker';
import ConflictBanner from './ConflictBanner';
import VersionHistoryModal from './VersionHistoryModal';
import WritingTypographyPanel from './WritingTypographyPanel';
import { useEditorAutoSave } from './hooks/useEditorAutoSave';
import { useFloatingToolbar } from './hooks/useFloatingToolbar';
import { useEditorSync } from './hooks/useEditorSync';
import { useImageUpload } from './hooks/useImageUpload';
import { useWritingTypography } from './hooks/useWritingTypography';
import './writingEditorTypography.css';

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
    const [showMarkdownMenu, setShowMarkdownMenu] = useState(false);
    const [showTypographyPanel, setShowTypographyPanel] = useState(false);
    const [safeTop, setSafeTop] = useState(0);
    const [copiedAt, setCopiedAt] = useState(null);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const statsTimeoutRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);
    const selectionRangeRef = useRef(null);
    const { uploadImage } = useImageUpload();
    const {
        typography,
        fontOptions,
        fieldLimits,
        editorStyleVars,
        fontStack,
        setTypographyField,
        resetTypography,
    } = useWritingTypography();

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
            if (!showActions && !showHistory && !showMarkdownMenu && !showTypographyPanel) {
                setIsToolbarVisible(false);
            }
        }, 2000);
    }, [isMobile, showActions, showHistory, showMarkdownMenu, showTypographyPanel]);

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

        if (showActions || showHistory || showMarkdownMenu || showTypographyPanel) {
            setIsToolbarVisible(true);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        } else {
            resetInactivityTimer();
        }
    }, [isMobile, showActions, showHistory, showMarkdownMenu, showTypographyPanel, resetInactivityTimer]);

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
                setShowMarkdownMenu(false);
                setShowTypographyPanel(false);
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

    const cacheEditorSelection = useCallback(() => {
        if (typeof window === 'undefined' || !editorRef.current) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editorRef.current.contains(range.commonAncestorContainer)) return;
        selectionRangeRef.current = range.cloneRange();
    }, []);

    const restoreCachedSelection = useCallback(() => {
        if (typeof window === 'undefined' || !editorRef.current) return false;
        const selection = window.getSelection();
        const range = selectionRangeRef.current;
        if (!selection || !range) return false;
        if (!editorRef.current.contains(range.commonAncestorContainer)) return false;
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
    }, []);

    const getEditorSelectedText = useCallback(() => {
        if (typeof window === 'undefined' || !editorRef.current) return '';
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return '';
        const range = selection.getRangeAt(0);
        if (!editorRef.current.contains(range.commonAncestorContainer)) return '';
        return selection.toString() || '';
    }, []);

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        setContentMarkup(htmlToMarkup(editorRef.current));
        setIsDirty(true);
        updateStatsFromEditor();
    }, [updateStatsFromEditor]);

    const normalizeEditorMarkdownView = useCallback(() => {
        if (!editorRef.current) return;

        const latestMarkup = htmlToMarkup(editorRef.current);
        const normalizedHtml = markupToHtml(latestMarkup);

        if (editorRef.current.innerHTML !== normalizedHtml) {
            editorRef.current.innerHTML = normalizedHtml;
        }

        setContentMarkup(latestMarkup);
        updateStatsFromEditor();
    }, [updateStatsFromEditor]);

    const handleInsertMarkdown = useCallback((actionId) => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        restoreCachedSelection();

        const selectedText = getEditorSelectedText();
        const snippet = buildMarkdownSnippet(actionId, selectedText);
        if (!snippet) return;

        const inserted = insertMarkupAtCaret({
            editorElement: editorRef.current,
            markup: snippet,
            markupToHtml,
        });

        if (!inserted) return;
        handleInput();
        cacheEditorSelection();
        setShowMarkdownMenu(false);
    }, [cacheEditorSelection, getEditorSelectedText, handleInput, markupToHtml, restoreCachedSelection]);

    // ---------- Image selection / deletion ----------
    const handleEditorClick = useCallback((event) => {
        const target = event.target;
        if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedImage(target);
            cacheEditorSelection();
            return;
        }
        // 点击非图片区域时取消选中
        if (selectedImage && target !== selectedImage) {
            setSelectedImage(null);
        }
        cacheEditorSelection();
    }, [cacheEditorSelection, selectedImage]);

    // 处理删除图片的逻辑
    const handleDeleteImage = useCallback(() => {
        if (!selectedImage || !editorRef.current?.contains(selectedImage)) {
            setSelectedImage(null);
            return;
        }
        selectedImage.remove();
        setSelectedImage(null);
        // 触发 input 更新 markup
        if (editorRef.current) {
            setContentMarkup(htmlToMarkup(editorRef.current));
            setIsDirty(true);
            updateStatsFromEditor();
        }
        // 保持聚焦
        editorRef.current?.focus();
    }, [selectedImage, updateStatsFromEditor]);

    // 处理键盘事件（特别是删除图片）
    const handleEditorKeyDown = useCallback((event) => {
        if (selectedImage && (event.key === 'Backspace' || event.key === 'Delete')) {
            event.preventDefault();
            event.stopPropagation();
            handleDeleteImage();
        }
    }, [selectedImage, handleDeleteImage]);


    // 图片被删除后（如外部操作），检查是否仍在 DOM 内
    useEffect(() => {
        if (selectedImage && !editorRef.current?.contains(selectedImage)) {
            setSelectedImage(null);
        }
    }, [contentMarkup, selectedImage]);

    const handleImageUpload = useCallback(async (file) => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempId = `uploading-${Date.now()}`;
        const blobUrl = URL.createObjectURL(file);

        const img = document.createElement('img');
        img.src = blobUrl;
        img.alt = 'Uploading...';
        img.className = 'max-w-full rounded-lg my-2 opacity-50 blur-sm transition-all';
        img.dataset.tempId = tempId;

        range.insertNode(img);
        range.setStartAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);

        handleInput();

        try {
            const url = await uploadImage(file);
            const targetImg = editorRef.current.querySelector(`img[data-temp-id="${tempId}"]`);
            if (targetImg) {
                targetImg.src = url;
                targetImg.alt = 'Image';
                targetImg.classList.remove('opacity-50', 'blur-sm');
                targetImg.removeAttribute('data-temp-id');
                handleInput();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const targetImg = editorRef.current.querySelector(`img[data-temp-id="${tempId}"]`);
            if (targetImg) {
                targetImg.remove();
                handleInput();
            }
            alert(error.message || t('common.uploadFailed', '上传失败'));
        } finally {
            URL.revokeObjectURL(blobUrl);
        }
    }, [handleInput, uploadImage, t]);

    const handlePaste = useCallback((event) => {
        // Handle images first
        if (event.clipboardData.files.length > 0) {
            const file = event.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                event.preventDefault();
                handleImageUpload(file);
                return;
            }
        }

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
    }, [handleInput, markupToHtml, handleImageUpload]);

    const createHighlightElement = useCallback((colorId) => {
        const colorConfig = COLOR_CONFIG.find((color) => color.id === colorId);
        const highlightColor = colorConfig?.highlight || 'rgba(125, 211, 252, 0.55)';
        const span = document.createElement('span');
        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';
        return span;
    }, []);

    const unwrapColoredSpan = useCallback((node) => {
        if (!node?.parentNode) return;
        const parent = node.parentNode;
        while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
    }, []);

    const stripColoredSpansInFragment = useCallback((fragment) => {
        if (!fragment || typeof fragment.querySelectorAll !== 'function') return false;
        const coloredSpans = Array.from(fragment.querySelectorAll('span.colored-text'));
        if (coloredSpans.length === 0) return false;
        for (let index = coloredSpans.length - 1; index >= 0; index -= 1) {
            unwrapColoredSpan(coloredSpans[index]);
        }
        return true;
    }, [unwrapColoredSpan]);

    const clearColor = useCallback(() => {
        if (typeof window === 'undefined' || !window.getSelection || !editorRef.current) return;
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (!editorRef.current.contains(range.commonAncestorContainer)) return;

        // 光标在高亮内时，直接清掉当前高亮包裹
        if (range.collapsed) {
            const anchorElement = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
                ? selection.anchorNode
                : selection.anchorNode?.parentElement;
            const coloredNode = anchorElement?.closest?.('span.colored-text');
            if (!coloredNode || !editorRef.current.contains(coloredNode)) return;
            unwrapColoredSpan(coloredNode);
            handleInput();
            setToolbarPosition(null);
            return;
        }

        const fragment = range.extractContents();
        const removed = stripColoredSpansInFragment(fragment);
        range.insertNode(fragment);
        if (!removed) return;

        selection.removeAllRanges();
        handleInput();
        setToolbarPosition(null);
    }, [handleInput, setToolbarPosition, stripColoredSpansInFragment, unwrapColoredSpan]);

    const applyColor = useCallback((colorId) => {
        if (typeof window === 'undefined' || !window.getSelection) return;
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (range.collapsed) return;
        if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

        const fragment = range.extractContents();
        stripColoredSpansInFragment(fragment);

        const hasVisibleText = (fragment.textContent || '').trim().length > 0;
        if (!hasVisibleText) {
            range.insertNode(fragment);
            return;
        }

        const span = createHighlightElement(colorId);
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();
        setToolbarPosition(null);
        handleInput();
    }, [createHighlightElement, handleInput, setToolbarPosition, stripColoredSpansInFragment]);

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
                        onClearColor={clearColor}
                        isMobile={isMobile}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <div
                className="relative z-10 flex-1 overflow-y-auto custom-scrollbar touch-scroll overscroll-y-contain"
                style={{ paddingTop: conflictState ? safeTop + 82 : safeTop + 16 }}
                onClick={(event) => {
                    if (event.target === editorRef.current) return;
                    if (event.target instanceof Element && event.target.closest('button, input, select, [role="menu"]')) return;
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
                            showMarkdownMenu={showMarkdownMenu}
                            showTypographyPanel={showTypographyPanel}
                            showActions={showActions}
                            onToggleMarkdownMenu={() => {
                                setShowActions(false);
                                setShowTypographyPanel(false);
                                setShowMarkdownMenu((value) => !value);
                            }}
                            onInsertMarkdown={handleInsertMarkdown}
                            onCloseMarkdownMenu={() => setShowMarkdownMenu(false)}
                            onPrepareMarkdownInsert={cacheEditorSelection}
                            onToggleTypography={() => {
                                setShowActions(false);
                                setShowMarkdownMenu(false);
                                setShowTypographyPanel((value) => !value);
                            }}
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
                            onShowHistory={() => {
                                setShowMarkdownMenu(false);
                                setShowTypographyPanel(false);
                                setShowHistory(true);
                            }}
                            onCopy={handleCopy}
                            onToggleActions={() => {
                                setShowMarkdownMenu(false);
                                setShowTypographyPanel(false);
                                setShowActions((value) => !value);
                            }}
                            onExport={exportDoc}
                            onCloseActions={() => setShowActions(false)}
                            isMobile={isMobile}
                            t={t}
                        />
                    </motion.div>

                    <AnimatePresence>
                        {showTypographyPanel && (
                            <WritingTypographyPanel
                                typography={typography}
                                fontOptions={fontOptions}
                                fieldLimits={fieldLimits}
                                onValueChange={setTypographyField}
                                onReset={resetTypography}
                                onClose={() => setShowTypographyPanel(false)}
                                isMobile={isMobile}
                                t={t}
                            />
                        )}
                    </AnimatePresence>

                    <div
                        className={`writing-typography-root rounded-3xl bg-white p-6 transition-all md:p-10 dark:bg-slate-900 ${isEditorFocused
                            ? 'shadow-[0_14px_30px_-24px_rgba(14,116,255,0.28)] dark:shadow-none'
                            : 'shadow-none'}`}
                        style={{
                            marginTop: isMobile ? 32 : 44,
                            ...editorStyleVars,
                        }}
                    >
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
                                fontFamily: fontStack,
                            }}
                        />

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

                        <div className="relative">
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={handleInput}
                                onPaste={handlePaste}
                                onClick={handleEditorClick}
                                onKeyDown={handleEditorKeyDown}
                                onMouseUp={cacheEditorSelection}
                                onKeyUp={cacheEditorSelection}
                                onFocus={() => {
                                    setIsEditorFocused(true);
                                }}
                                onBlur={() => {
                                    setIsEditorFocused(false);
                                    handleApplyPendingRemoteOnBlur();
                                    normalizeEditorMarkdownView();
                                }}
                                spellCheck
                                className="writing-editor-content min-h-[55vh] w-full text-slate-700 outline-none caret-sky-500 selection:bg-sky-100/80 empty:before:text-slate-300 dark:text-slate-300 dark:caret-sky-400 dark:selection:bg-sky-900/40 dark:empty:before:text-slate-600"
                                placeholder={t('inspiration.placeholder')}
                            />

                            <AnimatePresence>
                                {selectedImage && (
                                    <WritingImageOverlay
                                        selectedImage={selectedImage}
                                        editorRef={editorRef}
                                        onDelete={handleDeleteImage}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
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
