import { WRITING_CATEGORY_COLORS, findWritingCategoryPreset } from './writingCategoryUtils';

export const CATEGORY_LABEL_MAX_LENGTH = 24;

export const normalizeWritingCategoryLabel = (value = '') => value.replace(/\s+/g, ' ').trim();

const normalizeForCompare = (value = '') => normalizeWritingCategoryLabel(value).toLocaleLowerCase();

export const isWritingCategoryLabelDuplicate = (categories = [], candidateLabel = '', currentId = null) => {
    const candidate = normalizeForCompare(candidateLabel);
    if (!candidate) return false;

    return categories.some((category) => {
        if (!category?.id || category.id === currentId) return false;
        return normalizeForCompare(category.label || '') === candidate;
    });
};

export const getSuggestedWritingColorPreset = (categories = []) => {
    if (WRITING_CATEGORY_COLORS.length === 0) return null;

    const usedPresetIds = new Set(
        categories
            .map((category) => findWritingCategoryPreset(category)?.id)
            .filter(Boolean)
    );

    return WRITING_CATEGORY_COLORS.find((preset) => !usedPresetIds.has(preset.id))
        || WRITING_CATEGORY_COLORS[categories.length % WRITING_CATEGORY_COLORS.length]
        || WRITING_CATEGORY_COLORS[0];
};

export const getNextWritingColorPreset = (category) => {
    if (WRITING_CATEGORY_COLORS.length === 0) return null;

    const currentPreset = findWritingCategoryPreset(category);
    if (!currentPreset) return WRITING_CATEGORY_COLORS[0];

    const currentIndex = WRITING_CATEGORY_COLORS.findIndex((preset) => preset.id === currentPreset.id);
    if (currentIndex < 0) return WRITING_CATEGORY_COLORS[0];

    return WRITING_CATEGORY_COLORS[(currentIndex + 1) % WRITING_CATEGORY_COLORS.length];
};

export const getCategoryDocsCount = (categoryId, categoryDocCountMap = {}) => Number(categoryDocCountMap?.[categoryId] || 0);

export const getTotalCategoryDocs = (categoryDocCountMap = {}) => (
    Object.values(categoryDocCountMap || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
);
