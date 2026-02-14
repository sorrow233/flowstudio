import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'flow-studio-writing-beta-v3-draft';

const safeParseDraft = (raw) => {
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            title: typeof parsed.title === 'string' ? parsed.title : '',
            content: typeof parsed.content === 'string' ? parsed.content : '',
            savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : null,
        };
    } catch {
        return null;
    }
};

const buildMetrics = (content) => {
    const trimmed = content.trim();
    const charCount = trimmed.length;
    const paragraphCount = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    const readingMinutes = charCount === 0 ? 0 : Math.max(1, Math.ceil(charCount / 500));
    return { charCount, paragraphCount, readingMinutes };
};

export const useWritingBetaV3Draft = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [saveState, setSaveState] = useState('idle');
    const initializedRef = useRef(false);

    useEffect(() => {
        const cached = safeParseDraft(localStorage.getItem(STORAGE_KEY));
        if (cached) {
            setTitle(cached.title);
            setContent(cached.content);
            setLastSavedAt(cached.savedAt ? new Date(cached.savedAt) : null);
            setSaveState(cached.savedAt ? 'saved' : 'idle');
        }
        initializedRef.current = true;
    }, []);

    useEffect(() => {
        if (!initializedRef.current) return;

        setSaveState('saving');
        const timer = window.setTimeout(() => {
            try {
                const savedAt = Date.now();
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        title,
                        content,
                        savedAt,
                    }),
                );
                setLastSavedAt(new Date(savedAt));
                setSaveState('saved');
            } catch {
                setSaveState('error');
            }
        }, 600);

        return () => window.clearTimeout(timer);
    }, [title, content]);

    const metrics = useMemo(() => buildMetrics(content), [content]);

    const clearDraft = () => {
        setTitle('');
        setContent('');
        setLastSavedAt(null);
        setSaveState('idle');
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        title,
        content,
        setTitle,
        setContent,
        metrics,
        lastSavedAt,
        saveState,
        clearDraft,
    };
};
