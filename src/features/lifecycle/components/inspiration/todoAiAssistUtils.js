import { normalizeIdeaTextForExport } from './categoryTransferUtils';

export const TODO_AI_CLASS_UNCLASSIFIED = 'unclassified';
export const TODO_AI_FILTER_PENDING = 'pending';

export const TODO_AI_CLASS_OPTIONS = [
    { value: 'ai_done', label: 'AI 完成' },
    { value: 'ai_high', label: 'AI 高度辅助' },
    { value: 'ai_mid', label: 'AI 中度辅助' },
    { value: 'self', label: '必须自己去完成' },
];

export const TODO_AI_FILTER_OPTIONS = [
    { value: 'all', label: '全部' },
    { value: TODO_AI_FILTER_PENDING, label: '所有未完成' },
    { value: TODO_AI_CLASS_UNCLASSIFIED, label: '未分类' },
    ...TODO_AI_CLASS_OPTIONS,
];

const TODO_AI_ASSIST_META = {
    [TODO_AI_CLASS_UNCLASSIFIED]: {
        label: '未分类',
        shortLabel: '未分类',
        dotClassName: 'bg-slate-300 dark:bg-slate-500',
    },
    ai_done: {
        label: 'AI 完成',
        shortLabel: 'AI完成',
        dotClassName: 'bg-emerald-300 dark:bg-emerald-400',
    },
    ai_high: {
        label: 'AI 高度辅助',
        shortLabel: 'AI高辅',
        dotClassName: 'bg-sky-300 dark:bg-sky-400',
    },
    ai_mid: {
        label: 'AI 中度辅助',
        shortLabel: 'AI中辅',
        dotClassName: 'bg-indigo-300 dark:bg-indigo-400',
    },
    self: {
        label: '必须自己去完成',
        shortLabel: '自己完成',
        dotClassName: 'bg-amber-300 dark:bg-amber-400',
    },
};

export const getTodoAiAssistClass = (idea = {}) => {
    return idea?.aiAssistClass || TODO_AI_CLASS_UNCLASSIFIED;
};

export const getTodoAiAssistMeta = (value = TODO_AI_CLASS_UNCLASSIFIED) => {
    return TODO_AI_ASSIST_META[value] || TODO_AI_ASSIST_META[TODO_AI_CLASS_UNCLASSIFIED];
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
