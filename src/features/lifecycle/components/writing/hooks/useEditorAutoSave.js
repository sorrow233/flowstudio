import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeWordCount } from '../editorUtils';

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
const SNAPSHOT_MIN_CHANGE = 200;
const MAX_VERSIONS = 50;

export const useEditorAutoSave = ({
    writingDoc,
    title,
    contentMarkup,
    editorRef,
    wordCount,
    onUpdate,
    isDirty,
    setIsDirty,
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);

    const lastSnapshotAtRef = useRef(0);
    const lastSnapshotContentRef = useRef('');
    const savingIndicatorTimeoutRef = useRef(null);

    const versions = useMemo(() => {
        if (!writingDoc?.versions || !Array.isArray(writingDoc.versions)) return [];
        return [...writingDoc.versions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [writingDoc?.versions]);

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
        [addSnapshot, editorRef, title, writingDoc],
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

    const canManualSnapshot = Boolean(writingDoc) && contentMarkup !== (lastSnapshotContentRef.current || '');

    useEffect(() => {
        if (writingDoc?.lastModified) setLastSavedAt(writingDoc.lastModified);
        else if (writingDoc?.timestamp) setLastSavedAt(writingDoc.timestamp);
    }, [writingDoc?.lastModified, writingDoc?.timestamp]);

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

    useEffect(() => {
        if (!isDirty) {
            setIsSaving(false);
            return undefined;
        }

        const timer = setTimeout(() => {
            if (!editorRef.current || !writingDoc || !isDirty) return;

            setIsSaving(true);
            onUpdate(writingDoc.id, { title, content: contentMarkup });
            setIsDirty(false);
            setLastSavedAt(Date.now());
            maybeSnapshot(contentMarkup);

            if (savingIndicatorTimeoutRef.current) clearTimeout(savingIndicatorTimeoutRef.current);
            savingIndicatorTimeoutRef.current = setTimeout(() => setIsSaving(false), 500);
        }, 1000);

        return () => clearTimeout(timer);
    }, [contentMarkup, editorRef, isDirty, maybeSnapshot, onUpdate, setIsDirty, title, writingDoc]);

    useEffect(() => {
        return () => {
            if (savingIndicatorTimeoutRef.current) clearTimeout(savingIndicatorTimeoutRef.current);
        };
    }, []);

    return {
        addSnapshot,
        canManualSnapshot,
        handleManualSnapshot,
        isSaving,
        lastSavedAt,
        setLastSavedAt,
        versions,
    };
};
