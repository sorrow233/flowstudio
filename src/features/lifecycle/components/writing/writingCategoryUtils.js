export const DEFAULT_WRITING_CATEGORY_LABELS = {
    draft: 'Draft',
    plot: 'Plot',
    character: 'Character',
    world: 'World',
    final: 'Final',
};

export const DEFAULT_WRITING_CATEGORY_I18N_KEYS = {
    draft: 'writing.categoryDraft',
    plot: 'writing.categoryPlot',
    character: 'writing.categoryCharacter',
    world: 'writing.categoryWorld',
    final: 'writing.categoryFinal',
};

export const MAX_WRITING_CATEGORIES = 10;

export const resolveWritingCategoryLabel = (category, t, fallback = '') => {
    if (!category) return fallback;

    const key = DEFAULT_WRITING_CATEGORY_I18N_KEYS[category.id];
    const defaultLabel = DEFAULT_WRITING_CATEGORY_LABELS[category.id];

    if (key && (!category.label || category.label === defaultLabel)) {
        return t(key, defaultLabel);
    }

    return category.label || fallback;
};

export const WRITING_CATEGORY_COLORS = [
    {
        id: 'stone',
        color: 'bg-stone-400',
        dotColor: 'bg-stone-400',
        textColor: 'text-stone-400',
        buttonClass: 'bg-stone-100 text-stone-600 hover:bg-stone-200',
        darkButtonClass: 'dark:bg-stone-900/30 dark:text-stone-400 dark:hover:bg-stone-900/50'
    },
    {
        id: 'blue',
        color: 'bg-blue-400',
        dotColor: 'bg-blue-400',
        textColor: 'text-blue-400',
        buttonClass: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
        darkButtonClass: 'dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
    },
    {
        id: 'amber',
        color: 'bg-amber-400',
        dotColor: 'bg-amber-400',
        textColor: 'text-amber-400',
        buttonClass: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
        darkButtonClass: 'dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
    },
    {
        id: 'emerald',
        color: 'bg-emerald-400',
        dotColor: 'bg-emerald-400',
        textColor: 'text-emerald-400',
        buttonClass: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
        darkButtonClass: 'dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
    },
    {
        id: 'rose',
        color: 'bg-rose-400',
        dotColor: 'bg-rose-400',
        textColor: 'text-rose-400',
        buttonClass: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
        darkButtonClass: 'dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50'
    },
    {
        id: 'violet',
        color: 'bg-violet-400',
        dotColor: 'bg-violet-400',
        textColor: 'text-violet-400',
        buttonClass: 'bg-violet-100 text-violet-600 hover:bg-violet-200',
        darkButtonClass: 'dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50'
    },
    {
        id: 'cyan',
        color: 'bg-cyan-400',
        dotColor: 'bg-cyan-400',
        textColor: 'text-cyan-400',
        buttonClass: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
        darkButtonClass: 'dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50'
    },
    {
        id: 'orange',
        color: 'bg-orange-400',
        dotColor: 'bg-orange-400',
        textColor: 'text-orange-400',
        buttonClass: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
        darkButtonClass: 'dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
    },
    {
        id: 'teal',
        color: 'bg-teal-400',
        dotColor: 'bg-teal-400',
        textColor: 'text-teal-400',
        buttonClass: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
        darkButtonClass: 'dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50'
    },
    {
        id: 'indigo',
        color: 'bg-indigo-400',
        dotColor: 'bg-indigo-400',
        textColor: 'text-indigo-400',
        buttonClass: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
        darkButtonClass: 'dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
    },
];

export const isDefaultWritingCategoryId = (categoryId) => Boolean(DEFAULT_WRITING_CATEGORY_LABELS[categoryId]);

export const getDefaultWritingCategoryLabel = (categoryId) => DEFAULT_WRITING_CATEGORY_LABELS[categoryId] || '';

export const findWritingCategoryPreset = (category) => {
    if (!category) return null;
    return WRITING_CATEGORY_COLORS.find((preset) => (
        preset.color === category.color || preset.dotColor === category.dotColor
    )) || null;
};

export const pickWritingCategoryStyle = (preset) => {
    if (!preset) return {};
    return {
        color: preset.color,
        dotColor: preset.dotColor,
        textColor: preset.textColor,
        buttonClass: preset.buttonClass,
        darkButtonClass: preset.darkButtonClass,
    };
};
