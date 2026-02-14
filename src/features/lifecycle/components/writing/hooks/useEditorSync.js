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
    }, [
        contentMarkup,
        editorRef,
        setContentMarkup,
        setTitle,
        title,
        updateStatsFromEditor,
        writingDoc,
    ]);

    const requestForceRemoteApply = useCallback(() => {
        forceRemoteApplyRef.current = true;
    }, []);

    const handleApplyPendingRemote = useCallback(() => {
        if (!pendingRemoteHtml || !writingDoc) return;
        if (editorRef.current) editorRef.current.innerHTML = pendingRemoteHtml;
        setContentMarkup(writingDoc.content || '');
        updateStatsFromEditor();
        setPendingRemoteHtml(null);
        setConflictState(null);
        lastSeenRemoteContentRef.current = writingDoc.content || '';
    }, [editorRef, pendingRemoteHtml, setContentMarkup, updateStatsFromEditor, writingDoc]);

    const handleKeepPendingLocal = useCallback(() => {
        setPendingRemoteHtml(null);
        if (writingDoc?.content) lastSeenRemoteContentRef.current = writingDoc.content;
    }, [writingDoc?.content]);

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
        setPendingRemoteHtml(null);
        lastSeenRemoteContentRef.current = conflictState.remoteContent || '';
    }, [addSnapshot, conflictState, contentMarkup, onUpdate, title, writingDoc]);

    const handleConflictUseRemote = useCallback(() => {
        if (!conflictState) return;

        const remote = conflictState.remoteContent || '';
        const remoteTitle = conflictState.remoteTitle || '';
        setTitle(remoteTitle);
        setContentMarkup(remote);
        if (editorRef.current) editorRef.current.innerHTML = markupToHtml(remote);
        updateStatsFromEditor();
        setConflictState(null);
        setPendingRemoteHtml(null);
        lastSeenRemoteContentRef.current = remote;
    }, [conflictState, editorRef, setContentMarkup, setTitle, updateStatsFromEditor]);

    return {
        conflictPreview,
        conflictState,
        handleApplyPendingRemote,
        handleConflictKeepLocal,
        handleConflictUseRemote,
        handleKeepPendingLocal,
        pendingRemoteHtml,
        requestForceRemoteApply,
    };
};
