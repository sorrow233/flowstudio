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
        badgeClassName: 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70',
    },
    ai_done: {
        label: 'AI 完成',
        badgeClassName: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/55',
    },
    ai_high: {
        label: 'AI 高度辅助',
        badgeClassName: 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/55',
    },
    ai_mid: {
        label: 'AI 中度辅助',
        badgeClassName: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/55',
    },
    self: {
        label: '必须自己去完成',
        badgeClassName: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/55',
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
