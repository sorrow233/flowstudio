import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'flowstudio_writing_lab_v2_draft';

const EMPTY_DRAFT = {
    title: '',
    content: '',
};

const SAMPLE_DRAFT = {
    title: '写作测试：迭代实验',
    content: `# 写作实验页

这个页面用于快速验证写作模块的交互体验。

## 现在可测试的点

- 标题输入
- 正文编辑
- Markdown 实时预览
- 自动保存和状态提示
`,
};

function parseDraft(raw) {
    if (!raw) return EMPTY_DRAFT;

    try {
        const parsed = JSON.parse(raw);
        return {
            title: typeof parsed.title === 'string' ? parsed.title : '',
            content: typeof parsed.content === 'string' ? parsed.content : '',
        };
    } catch {
        return EMPTY_DRAFT;
    }
}

function loadDraft() {
    if (typeof window === 'undefined') return EMPTY_DRAFT;
    return parseDraft(window.localStorage.getItem(STORAGE_KEY));
}

function persistDraft(draft) {
    if (typeof window === 'undefined') return null;
    const savedAt = Date.now();
    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            title: draft.title,
            content: draft.content,
            savedAt,
        }),
    );
    return savedAt;
}

export function useWritingLabDraft() {
    const [draft, setDraft] = useState(loadDraft);
    const [saveState, setSaveState] = useState('idle');
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const readyRef = useRef(false);

    useEffect(() => {
        readyRef.current = true;
    }, []);

    useEffect(() => {
        if (!readyRef.current) return;
        setSaveState('saving');

        const timer = window.setTimeout(() => {
            try {
                const savedAt = persistDraft(draft);
                if (savedAt) {
                    setLastSavedAt(savedAt);
                    setSaveState('saved');
                    return;
                }
                setSaveState('idle');
            } catch {
                setSaveState('error');
            }
        }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [draft]);

    const updateTitle = useCallback((title) => {
        setDraft((current) => ({ ...current, title }));
    }, []);

    const updateContent = useCallback((content) => {
        setDraft((current) => ({ ...current, content }));
    }, []);

    const saveNow = useCallback(() => {
        try {
            setSaveState('saving');
            const savedAt = persistDraft(draft);
            if (savedAt) {
                setLastSavedAt(savedAt);
                setSaveState('saved');
                return;
            }
            setSaveState('idle');
        } catch {
            setSaveState('error');
        }
    }, [draft]);

    const clearDraft = useCallback(() => {
        setDraft(EMPTY_DRAFT);
        setSaveState('idle');
        setLastSavedAt(null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const fillSample = useCallback(() => {
        setDraft(SAMPLE_DRAFT);
    }, []);

    return {
        draft,
        saveState,
        lastSavedAt,
        updateTitle,
        updateContent,
        saveNow,
        clearDraft,
        fillSample,
    };
}
