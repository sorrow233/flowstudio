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

const WRITING_CATEGORY_TOOL_TONE_MAP = {
    stone: {
        iconButtonClass: 'border-stone-200/80 bg-white/90 text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700/60 dark:bg-slate-800/85 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-900/20',
        iconButtonActiveClass: 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:border-stone-600/70 dark:bg-stone-900/35 dark:text-stone-200 dark:hover:bg-stone-900/50',
        searchIconClass: 'text-stone-400',
        searchInputFocusClass: 'focus:border-stone-400 dark:focus:border-stone-500',
    },
    blue: {
        iconButtonClass: 'border-blue-200/80 bg-white/90 text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700/60 dark:bg-slate-800/85 dark:text-blue-300 dark:hover:border-blue-600 dark:hover:bg-blue-900/20',
        iconButtonActiveClass: 'border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:border-blue-600/70 dark:bg-blue-900/35 dark:text-blue-200 dark:hover:bg-blue-900/50',
        searchIconClass: 'text-blue-400',
        searchInputFocusClass: 'focus:border-blue-400 dark:focus:border-blue-500',
    },
    amber: {
        iconButtonClass: 'border-amber-200/80 bg-white/90 text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-700/60 dark:bg-slate-800/85 dark:text-amber-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/20',
        iconButtonActiveClass: 'border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-600/70 dark:bg-amber-900/35 dark:text-amber-200 dark:hover:bg-amber-900/50',
        searchIconClass: 'text-amber-400',
        searchInputFocusClass: 'focus:border-amber-400 dark:focus:border-amber-500',
    },
    emerald: {
        iconButtonClass: 'border-emerald-200/80 bg-white/90 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700/60 dark:bg-slate-800/85 dark:text-emerald-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20',
        iconButtonActiveClass: 'border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-600/70 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50',
        searchIconClass: 'text-emerald-400',
        searchInputFocusClass: 'focus:border-emerald-400 dark:focus:border-emerald-500',
    },
    rose: {
        iconButtonClass: 'border-rose-200/80 bg-white/90 text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-700/60 dark:bg-slate-800/85 dark:text-rose-300 dark:hover:border-rose-600 dark:hover:bg-rose-900/20',
        iconButtonActiveClass: 'border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:border-rose-600/70 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50',
        searchIconClass: 'text-rose-400',
        searchInputFocusClass: 'focus:border-rose-400 dark:focus:border-rose-500',
    },
    violet: {
        iconButtonClass: 'border-violet-200/80 bg-white/90 text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-700/60 dark:bg-slate-800/85 dark:text-violet-300 dark:hover:border-violet-600 dark:hover:bg-violet-900/20',
        iconButtonActiveClass: 'border-violet-300 bg-violet-100 text-violet-700 hover:bg-violet-200 dark:border-violet-600/70 dark:bg-violet-900/35 dark:text-violet-200 dark:hover:bg-violet-900/50',
        searchIconClass: 'text-violet-400',
        searchInputFocusClass: 'focus:border-violet-400 dark:focus:border-violet-500',
    },
    cyan: {
        iconButtonClass: 'border-cyan-200/80 bg-white/90 text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 dark:border-cyan-700/60 dark:bg-slate-800/85 dark:text-cyan-300 dark:hover:border-cyan-600 dark:hover:bg-cyan-900/20',
        iconButtonActiveClass: 'border-cyan-300 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:border-cyan-600/70 dark:bg-cyan-900/35 dark:text-cyan-200 dark:hover:bg-cyan-900/50',
        searchIconClass: 'text-cyan-400',
        searchInputFocusClass: 'focus:border-cyan-400 dark:focus:border-cyan-500',
    },
    orange: {
        iconButtonClass: 'border-orange-200/80 bg-white/90 text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700/60 dark:bg-slate-800/85 dark:text-orange-300 dark:hover:border-orange-600 dark:hover:bg-orange-900/20',
        iconButtonActiveClass: 'border-orange-300 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:border-orange-600/70 dark:bg-orange-900/35 dark:text-orange-200 dark:hover:bg-orange-900/50',
        searchIconClass: 'text-orange-400',
        searchInputFocusClass: 'focus:border-orange-400 dark:focus:border-orange-500',
    },
    teal: {
        iconButtonClass: 'border-teal-200/80 bg-white/90 text-teal-600 hover:border-teal-300 hover:bg-teal-50 dark:border-teal-700/60 dark:bg-slate-800/85 dark:text-teal-300 dark:hover:border-teal-600 dark:hover:bg-teal-900/20',
        iconButtonActiveClass: 'border-teal-300 bg-teal-100 text-teal-700 hover:bg-teal-200 dark:border-teal-600/70 dark:bg-teal-900/35 dark:text-teal-200 dark:hover:bg-teal-900/50',
        searchIconClass: 'text-teal-400',
        searchInputFocusClass: 'focus:border-teal-400 dark:focus:border-teal-500',
    },
    indigo: {
        iconButtonClass: 'border-indigo-200/80 bg-white/90 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-700/60 dark:bg-slate-800/85 dark:text-indigo-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20',
        iconButtonActiveClass: 'border-indigo-300 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:border-indigo-600/70 dark:bg-indigo-900/35 dark:text-indigo-200 dark:hover:bg-indigo-900/50',
        searchIconClass: 'text-indigo-400',
        searchInputFocusClass: 'focus:border-indigo-400 dark:focus:border-indigo-500',
    },
};

const WRITING_CATEGORY_TOOL_TONE_FALLBACK = {
    iconButtonClass: 'border-sky-200/80 bg-white/90 text-sky-600 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-700/60 dark:bg-slate-800/85 dark:text-sky-300 dark:hover:border-sky-600 dark:hover:bg-sky-900/20',
    iconButtonActiveClass: 'border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200 dark:border-sky-600/70 dark:bg-sky-900/35 dark:text-sky-200 dark:hover:bg-sky-900/50',
    searchIconClass: 'text-sky-400',
    searchInputFocusClass: 'focus:border-sky-400 dark:focus:border-sky-500',
};

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

export const getWritingCategoryToolTone = (preset) => {
    if (!preset?.id) return WRITING_CATEGORY_TOOL_TONE_FALLBACK;
    return WRITING_CATEGORY_TOOL_TONE_MAP[preset.id] || WRITING_CATEGORY_TOOL_TONE_FALLBACK;
};
