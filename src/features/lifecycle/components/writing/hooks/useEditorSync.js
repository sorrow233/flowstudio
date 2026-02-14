import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeWordCount, htmlToMarkup, markupToHtml, markupToPlain } from '../editorUtils';

const normalizeMarkupForSync = (value = '') =>
    (value || '')
        .replace(/\r\n/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/\n+$/g, '');

export const useEditorSync = ({
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
}) => {
    const [pendingRemoteMarkup, setPendingRemoteMarkup] = useState(null);
    const [conflictState, setConflictState] = useState(null);

    const lastSeenRemoteContentRef = useRef('');
    const forceRemoteApplyRef = useRef(false);

    const conflictPreview = useMemo(() => {
        if (!conflictState?.remoteContent) return '';
        const cleaned = markupToPlain(conflictState.remoteContent).replace(/\s+/g, ' ').trim();
        return cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned;
    }, [conflictState?.remoteContent]);

    const applyRemoteContent = useCallback((remoteMarkup = '', remoteTitle = '', options = {}) => {
        const { dirtyOverride } = options;
        if (editorRef.current) {
            const html = markupToHtml(remoteMarkup);
            if (editorRef.current.innerHTML !== html) {
                editorRef.current.innerHTML = html;
            }
        }
        setContentMarkup(remoteMarkup);
        updateStatsFromEditor();
        setPendingRemoteMarkup(null);
        setConflictState(null);
        if (typeof dirtyOverride === 'boolean') {
            setIsDirty(dirtyOverride);
        } else {
            setIsDirty((title || '') !== (remoteTitle || ''));
        }
    }, [editorRef, setContentMarkup, setIsDirty, title, updateStatsFromEditor]);

    useEffect(() => {
        if (!writingDoc) return;

        const prevRemoteContentRaw = lastSeenRemoteContentRef.current;
        const prevRemoteContent = normalizeMarkupForSync(prevRemoteContentRaw);
        const remoteTitle = writingDoc.title || '';
        if (!isDirty && remoteTitle !== title) setTitle(remoteTitle);

        const remoteContentRaw = writingDoc.content || '';
        const remoteContent = normalizeMarkupForSync(remoteContentRaw);
        const liveLocalMarkupRaw = editorRef.current ? htmlToMarkup(editorRef.current) : contentMarkup;
        const liveLocalMarkup = normalizeMarkupForSync(liveLocalMarkupRaw);

        const remoteChanged = remoteContent !== prevRemoteContent;
        const remoteMatchesLocal = remoteContent === liveLocalMarkup;
        const localDirtySinceLastRemote = liveLocalMarkup !== prevRemoteContent;
        const isFocused = typeof document !== 'undefined' && document.activeElement === editorRef.current;

        if (editorRef.current) {
            const remoteHtml = markupToHtml(remoteContentRaw);
            const remoteDomDiffers = remoteHtml !== editorRef.current.innerHTML;
            const shouldForceApply = forceRemoteApplyRef.current;
            if (shouldForceApply) forceRemoteApplyRef.current = false;

            const shouldApplyImmediately = shouldForceApply || !isFocused;
            if (remoteDomDiffers && shouldApplyImmediately) {
                applyRemoteContent(remoteContentRaw, remoteTitle);
            } else if (!remoteChanged) {
                // 聚焦编辑期间的 DOM 结构差异（如 <div>/<br>）不应触发远端提示
            } else if (localDirtySinceLastRemote && !remoteMatchesLocal) {
                setConflictState({ remoteContent, remoteTitle, timestamp: Date.now() });
                setPendingRemoteMarkup(null);
            } else if (!remoteMatchesLocal) {
                setPendingRemoteMarkup(remoteContentRaw);
                setConflictState(null);
            } else {
                setPendingRemoteMarkup(null);
                setConflictState(null);
            }
        }

        if (remoteMatchesLocal && normalizeMarkupForSync(contentMarkup) !== liveLocalMarkup) {
            setContentMarkup(liveLocalMarkupRaw);
        }

        lastSeenRemoteContentRef.current = remoteContentRaw;
    }, [
        applyRemoteContent,
        contentMarkup,
        editorRef,
        isDirty,
        setContentMarkup,
        setTitle,
        title,
        writingDoc,
    ]);

    const requestForceRemoteApply = useCallback(() => {
        forceRemoteApplyRef.current = true;
    }, []);

    const handleApplyPendingRemote = useCallback(() => {
        if (!pendingRemoteMarkup || !writingDoc) return;
        applyRemoteContent(pendingRemoteMarkup, writingDoc.title || '');
        lastSeenRemoteContentRef.current = pendingRemoteMarkup;
    }, [applyRemoteContent, pendingRemoteMarkup, writingDoc]);

    const handleKeepPendingLocal = useCallback(() => {
        setPendingRemoteMarkup(null);
        if (writingDoc?.content) lastSeenRemoteContentRef.current = writingDoc.content;
    }, [writingDoc?.content]);

    const handleApplyPendingRemoteOnBlur = useCallback(() => {
        if (!pendingRemoteMarkup || !writingDoc || conflictState) return;
        applyRemoteContent(pendingRemoteMarkup, writingDoc.title || '');
        lastSeenRemoteContentRef.current = pendingRemoteMarkup;
    }, [applyRemoteContent, conflictState, pendingRemoteMarkup, writingDoc]);

    const handleConflictKeepLocal = useCallback(() => {
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
    }, [addSnapshot, conflictState, contentMarkup, onUpdate, title, writingDoc]);

    const handleConflictUseRemote = useCallback(() => {
        if (!conflictState) return;

        const remote = conflictState.remoteContent || '';
        const remoteTitle = conflictState.remoteTitle || '';
        setTitle(remoteTitle);
        applyRemoteContent(remote, remoteTitle, { dirtyOverride: false });
        lastSeenRemoteContentRef.current = remote;
    }, [applyRemoteContent, conflictState, setTitle]);

    return {
        conflictPreview,
        conflictState,
        handleApplyPendingRemote,
        handleApplyPendingRemoteOnBlur,
        handleConflictKeepLocal,
        handleConflictUseRemote,
        handleKeepPendingLocal,
        pendingRemoteMarkup,
        requestForceRemoteApply,
    };
};
