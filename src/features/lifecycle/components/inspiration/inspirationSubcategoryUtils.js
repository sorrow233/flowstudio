export const INSPIRATION_SUBCATEGORY_FILTER_ALL = 'all';
export const INSPIRATION_SUBCATEGORY_UNCATEGORIZED = 'uncategorized';
export const MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY = 20;
export const INSPIRATION_SUBCATEGORY_LABEL_MAX_LENGTH = 24;

export const normalizeInspirationSubcategoryLabel = (value) => (
    String(value || '').replace(/\s+/g, ' ').trim()
);

const normalizeForCompare = (value) => normalizeInspirationSubcategoryLabel(value).toLowerCase();

const createSubcategoryId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `sub_${crypto.randomUUID()}`;
    }

    return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const createInspirationSubcategory = (label) => ({
    id: createSubcategoryId(),
    label: normalizeInspirationSubcategoryLabel(label),
});

export const normalizeInspirationSubcategories = (subcategories = []) => {
    if (!Array.isArray(subcategories)) return [];

    const seenIds = new Set();
    const seenLabels = new Set();
    const output = [];

    subcategories.forEach((item) => {
        const label = normalizeInspirationSubcategoryLabel(item?.label);
        if (!label) return;

        const id = String(item?.id || '').trim() || createSubcategoryId();
        const labelKey = normalizeForCompare(label);
        if (seenIds.has(id) || seenLabels.has(labelKey)) return;

        seenIds.add(id);
        seenLabels.add(labelKey);
        output.push({ id, label });
    });

    return output.slice(0, MAX_INSPIRATION_SUBCATEGORIES_PER_CATEGORY);
};

export const isInspirationSubcategoryDuplicate = (
    subcategories = [],
    candidateLabel = '',
    currentId = null
) => {
    const candidate = normalizeForCompare(candidateLabel);
    if (!candidate) return false;

    return normalizeInspirationSubcategories(subcategories).some((subcategory) => {
        if (currentId && subcategory.id === currentId) return false;
        return normalizeForCompare(subcategory.label) === candidate;
    });
};

export const getIdeaSubcategoryValue = (idea = {}, subcategories = []) => {
    const currentValue = String(idea?.subcategory || '').trim();
    if (!currentValue) return INSPIRATION_SUBCATEGORY_UNCATEGORIZED;

    const validIds = new Set(normalizeInspirationSubcategories(subcategories).map((item) => item.id));
    return validIds.has(currentValue)
        ? currentValue
        : INSPIRATION_SUBCATEGORY_UNCATEGORIZED;
};

export const buildInspirationSubcategoryFilterOptions = (ideas = [], subcategories = []) => {
    const normalizedSubcategories = normalizeInspirationSubcategories(subcategories);
    const counts = new Map();
    let uncategorizedCount = 0;

    normalizedSubcategories.forEach((subcategory) => counts.set(subcategory.id, 0));

    ideas.forEach((idea) => {
        const value = getIdeaSubcategoryValue(idea, normalizedSubcategories);
        if (value === INSPIRATION_SUBCATEGORY_UNCATEGORIZED) {
            uncategorizedCount += 1;
            return;
        }

        counts.set(value, (counts.get(value) || 0) + 1);
    });

    return [
        {
            value: INSPIRATION_SUBCATEGORY_FILTER_ALL,
            label: '全部',
            count: ideas.length,
        },
        {
            value: INSPIRATION_SUBCATEGORY_UNCATEGORIZED,
            label: '未分类',
            count: uncategorizedCount,
        },
        ...normalizedSubcategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.label,
            count: counts.get(subcategory.id) || 0,
        })),
    ];
};
