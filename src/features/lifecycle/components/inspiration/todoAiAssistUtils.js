import { normalizeIdeaTextForExport } from './categoryTransferUtils';

export const TODO_AI_CLASS_UNCLASSIFIED = 'unclassified';
export const TODO_CONFLICT_CLASS_UNCLASSIFIED = 'conflict_unclassified';
export const TODO_AI_FILTER_PENDING = 'pending';

export const TODO_AI_CLASS_OPTIONS = [
    { value: 'ai_done', label: 'AI完成' },
    { value: 'ai_involved', label: 'AI介入' },
    { value: 'user_done', label: '自己完成' },
];

export const TODO_AI_FILTER_OPTIONS = [
    { value: 'all', label: '全部' },
    { value: TODO_AI_FILTER_PENDING, label: '所有未完成' },
    { value: TODO_AI_CLASS_UNCLASSIFIED, label: '未分类' },
    ...TODO_AI_CLASS_OPTIONS,
];

export const TODO_CONFLICT_CLASS_OPTIONS = [
    { value: 'major_conflict', label: '主要矛盾' },
    { value: 'minor_conflict', label: '次要矛盾' },
];

export const TODO_CONFLICT_FILTER_OPTIONS = [
    ...TODO_CONFLICT_CLASS_OPTIONS,
];

const TODO_AI_ASSIST_META = {
    [TODO_AI_CLASS_UNCLASSIFIED]: {
        label: '未分类',
        shortLabel: '未分类',
        dotClassName: 'bg-slate-300 dark:bg-slate-500',
    },
    ai_done: {
        label: 'AI完成',
        shortLabel: 'AI完成',
        dotClassName: 'bg-emerald-300 dark:bg-emerald-400',
    },
    ai_involved: {
        label: 'AI介入',
        shortLabel: 'AI介入',
        dotClassName: 'bg-sky-300 dark:bg-sky-400',
    },
    user_done: {
        label: '自己完成',
        shortLabel: '自己完成',
        dotClassName: 'bg-amber-300 dark:bg-amber-400',
    },
};

const TODO_CONFLICT_META = {
    [TODO_CONFLICT_CLASS_UNCLASSIFIED]: {
        label: '矛盾未分',
        shortLabel: '矛盾未分',
        dotClassName: 'bg-slate-300 dark:bg-slate-500',
    },
    major_conflict: {
        label: '主要矛盾',
        shortLabel: '主矛盾',
        dotClassName: 'bg-rose-300 dark:bg-rose-400',
    },
    minor_conflict: {
        label: '次要矛盾',
        shortLabel: '次矛盾',
        dotClassName: 'bg-violet-300 dark:bg-violet-400',
    },
};

export const normalizeTodoAiAssistClass = (value = TODO_AI_CLASS_UNCLASSIFIED) => {
    if (value === 'ai_high' || value === 'ai_mid') return 'ai_involved';
    if (value === 'self') return 'user_done';
    if (Object.hasOwn(TODO_AI_ASSIST_META, value)) return value;
    return TODO_AI_CLASS_UNCLASSIFIED;
};

export const normalizeTodoConflictClass = (value = TODO_CONFLICT_CLASS_UNCLASSIFIED, fallbackValue) => {
    const rawValue = value || fallbackValue || TODO_CONFLICT_CLASS_UNCLASSIFIED;
    if (rawValue === TODO_AI_CLASS_UNCLASSIFIED) return TODO_CONFLICT_CLASS_UNCLASSIFIED;
    if (rawValue === 'major_conflict' || rawValue === 'minor_conflict') return rawValue;
    return TODO_CONFLICT_CLASS_UNCLASSIFIED;
};

export const getTodoAiAssistClass = (idea = {}) => {
    return normalizeTodoAiAssistClass(idea?.aiAssistClass);
};

export const getTodoConflictClass = (idea = {}) => {
    return normalizeTodoConflictClass(idea?.conflictClass, idea?.aiAssistClass);
};

export const getTodoAiAssistMeta = (value = TODO_AI_CLASS_UNCLASSIFIED) => {
    const normalizedValue = normalizeTodoAiAssistClass(value);
    return TODO_AI_ASSIST_META[normalizedValue] || TODO_AI_ASSIST_META[TODO_AI_CLASS_UNCLASSIFIED];
};

export const getTodoConflictMeta = (value = TODO_CONFLICT_CLASS_UNCLASSIFIED) => {
    const normalizedValue = normalizeTodoConflictClass(value);
    return TODO_CONFLICT_META[normalizedValue] || TODO_CONFLICT_META[TODO_CONFLICT_CLASS_UNCLASSIFIED];
};

export const buildTodoAiClassClipboardText = (ideas = [], classValue = TODO_AI_CLASS_UNCLASSIFIED) => {
    const meta = getTodoAiAssistMeta(classValue);
    const lines = ideas
        .filter((idea) => !idea?.completed && getTodoAiAssistClass(idea) === classValue)
        .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0))
        .map((idea, index) => {
            const content = normalizeIdeaTextForExport(idea?.content || '');
            return `${index + 1}. ${content || '（空）'}`;
        });

    if (lines.length === 0) return '';

    return `${meta.label}（未完成）\n${lines.join('\n')}`;
};

export const buildTodoConflictClassClipboardText = (ideas = [], classValue = TODO_CONFLICT_CLASS_UNCLASSIFIED) => {
    const meta = getTodoConflictMeta(classValue);
    const lines = ideas
        .filter((idea) => !idea?.completed && getTodoConflictClass(idea) === classValue)
        .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0))
        .map((idea, index) => {
            const content = normalizeIdeaTextForExport(idea?.content || '');
            return `${index + 1}. ${content || '（空）'}`;
        });

    if (lines.length === 0) return '';

    return `${meta.label}（未完成）\n${lines.join('\n')}`;
};
