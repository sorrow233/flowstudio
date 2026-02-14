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

export const resolveWritingCategoryLabel = (category, t, fallback = '') => {
    if (!category) return fallback;

    const key = DEFAULT_WRITING_CATEGORY_I18N_KEYS[category.id];
    const defaultLabel = DEFAULT_WRITING_CATEGORY_LABELS[category.id];

    if (key && (!category.label || category.label === defaultLabel)) {
        return t(key, defaultLabel);
    }

    return category.label || fallback;
};
