import * as Y from 'yjs';
import { INSPIRATION_CATEGORIES } from '../../../src/utils/constants.js';
import { httpError } from './http.js';

const CATEGORY_ARRAY_NAME = 'inspiration_categories';
const PROJECT_ARRAY_NAME = 'all_projects';
const MAX_CATEGORIES = 30;
const MAX_LABEL_LENGTH = 24;
const MAX_SUBCATEGORIES = 20;
const PROTECTED_CATEGORY_IDS = new Set(['todo']);

const COLOR_PRESETS = [
    { id: 'pink', color: 'bg-pink-400', dotColor: 'bg-pink-400', textColor: 'text-pink-400' },
    { id: 'blue', color: 'bg-blue-400', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
    { id: 'violet', color: 'bg-violet-400', dotColor: 'bg-violet-400', textColor: 'text-violet-400' },
    { id: 'emerald', color: 'bg-emerald-400', dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { id: 'amber', color: 'bg-amber-400', dotColor: 'bg-amber-400', textColor: 'text-amber-400' },
    { id: 'rose', color: 'bg-rose-400', dotColor: 'bg-rose-400', textColor: 'text-rose-400' },
    { id: 'cyan', color: 'bg-cyan-400', dotColor: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { id: 'orange', color: 'bg-orange-400', dotColor: 'bg-orange-400', textColor: 'text-orange-400' },
    { id: 'teal', color: 'bg-teal-400', dotColor: 'bg-teal-400', textColor: 'text-teal-400' },
    { id: 'indigo', color: 'bg-indigo-400', dotColor: 'bg-indigo-400', textColor: 'text-indigo-400' },
];

function normalizeLabel(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeCompare(value) {
    return normalizeLabel(value).toLowerCase();
}

function normalizeId(value) {
    return String(value || '').trim();
}

function createCategoryId(label) {
    const slug = normalizeLabel(label)
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24);
    const suffix = crypto.randomUUID().slice(0, 8);
    return `cat_${slug || 'custom'}_${suffix}`;
}

function createSubcategoryId() {
    return `sub_${crypto.randomUUID()}`;
}

function getCategoryArray(yDoc) {
    return yDoc.getArray(CATEGORY_ARRAY_NAME);
}

function getProjectArray(yDoc) {
    return yDoc.getArray(PROJECT_ARRAY_NAME);
}

function readYValue(value) {
    if (value instanceof Y.Map) return value.toJSON();
    if (value && typeof value === 'object') return value;
    return {};
}

function getRawCategories(yDoc) {
    const array = getCategoryArray(yDoc);
    const categories = array.toArray().map(readYValue).filter((category) => category?.id);
    return categories.length > 0 ? categories : INSPIRATION_CATEGORIES;
}

function ensureCategoryArraySeeded(yDoc) {
    const array = getCategoryArray(yDoc);
    if (array.length > 0) return;

    yDoc.transact(() => {
        if (array.length > 0) return;
        INSPIRATION_CATEGORIES.forEach((category) => {
            const yMap = new Y.Map();
            Object.entries(category).forEach(([key, value]) => yMap.set(key, value));
            array.push([yMap]);
        });
    }, 'flow-ai-api');
}

function getPreset(input = {}) {
    if (input.colorPreset) {
        const preset = COLOR_PRESETS.find((item) => item.id === input.colorPreset);
        if (!preset) {
            throw httpError(`Invalid colorPreset: ${input.colorPreset}.`, 400, 'invalid_color_preset');
        }
        return preset;
    }

    if (input.color || input.dotColor || input.textColor) {
        const color = String(input.color || input.dotColor || 'bg-gray-400');
        return {
            id: 'custom',
            color,
            dotColor: String(input.dotColor || color),
            textColor: String(input.textColor || 'text-gray-400'),
        };
    }

    return COLOR_PRESETS[0];
}

function normalizeSubcategories(subcategories = []) {
    if (!Array.isArray(subcategories)) return [];

    const seenIds = new Set();
    const seenLabels = new Set();
    const output = [];

    subcategories.forEach((item) => {
        const label = normalizeLabel(item?.label);
        if (!label) return;

        const id = normalizeId(item?.id) || createSubcategoryId();
        const labelKey = normalizeCompare(label);
        if (seenIds.has(id) || seenLabels.has(labelKey)) return;

        seenIds.add(id);
        seenLabels.add(labelKey);
        output.push({ id, label });
    });

    return output.slice(0, MAX_SUBCATEGORIES);
}

function findCategoryMapById(yDoc, id) {
    const categoryId = normalizeId(id);
    if (!categoryId) return null;

    const array = getCategoryArray(yDoc);
    for (let index = 0; index < array.length; index += 1) {
        const item = array.get(index);
        const json = readYValue(item);
        if (json.id === categoryId && item instanceof Y.Map) {
            return { item, index };
        }
    }

    return null;
}

function buildCategoryCounts(yDoc) {
    const counts = new Map();
    const projects = getProjectArray(yDoc).toArray();

    projects.forEach((item) => {
        const project = readYValue(item);
        if ((project.stage || 'inspiration') !== 'inspiration') return;

        const categoryId = project.category || 'note';
        const current = counts.get(categoryId) || {
            total: 0,
            completed: 0,
            pending: 0,
            subcategories: {},
        };

        current.total += 1;
        if (project.completed === true || project.completed === 1 || project.completed === 'true') {
            current.completed += 1;
        } else {
            current.pending += 1;
        }

        const subcategory = normalizeId(project.subcategory);
        if (subcategory) {
            current.subcategories[subcategory] = (current.subcategories[subcategory] || 0) + 1;
        }

        counts.set(categoryId, current);
    });

    return counts;
}

function formatCategory(category, countsMap) {
    const itemCounts = countsMap.get(category.id) || {
        total: 0,
        completed: 0,
        pending: 0,
        subcategories: {},
    };

    return {
        id: category.id,
        label: category.label || category.id,
        color: category.color || 'bg-gray-400',
        dotColor: category.dotColor || category.color || 'bg-gray-400',
        textColor: category.textColor || 'text-gray-400',
        subcategories: normalizeSubcategories(category.subcategories),
        protected: PROTECTED_CATEGORY_IDS.has(category.id),
        counts: itemCounts,
    };
}

function assertLabelAvailable(yDoc, label, currentId = '') {
    const labelKey = normalizeCompare(label);
    if (!labelKey) {
        throw httpError('Category label is required.', 400, 'missing_category_label');
    }

    if (label.length > MAX_LABEL_LENGTH) {
        throw httpError(`Category label must be ${MAX_LABEL_LENGTH} characters or fewer.`, 400, 'category_label_too_long');
    }

    const duplicate = getRawCategories(yDoc).some((category) => (
        category.id !== currentId && normalizeCompare(category.label) === labelKey
    ));

    if (duplicate) {
        throw httpError(`Category label already exists: ${label}.`, 400, 'duplicate_category_label');
    }
}

function assertCategoryExists(yDoc, categoryId, code = 'category_not_found') {
    const id = normalizeId(categoryId);
    const exists = getRawCategories(yDoc).some((category) => category.id === id);
    if (!exists) {
        throw httpError(`Category ${id} was not found.`, 404, code);
    }
    return id;
}

export function getAllowedCategoryColorPresets() {
    return COLOR_PRESETS.map((preset) => preset.id);
}

export function listCategories(yDoc) {
    const countsMap = buildCategoryCounts(yDoc);
    return getRawCategories(yDoc).map((category) => formatCategory(category, countsMap));
}

export function addCategory(yDoc, input = {}) {
    ensureCategoryArraySeeded(yDoc);

    const categories = getRawCategories(yDoc);
    if (categories.length >= MAX_CATEGORIES) {
        throw httpError(`At most ${MAX_CATEGORIES} categories are allowed.`, 400, 'category_limit_reached');
    }

    const label = normalizeLabel(input.label);
    assertLabelAvailable(yDoc, label);

    const id = normalizeId(input.id) || createCategoryId(label);
    if (!/^[a-zA-Z0-9_\-\u4e00-\u9fa5]{1,80}$/.test(id)) {
        throw httpError('Invalid category id.', 400, 'invalid_category_id');
    }

    if (categories.some((category) => category.id === id)) {
        throw httpError(`Category id already exists: ${id}.`, 400, 'duplicate_category_id');
    }

    const preset = getPreset(input);
    const category = {
        id,
        label,
        color: preset.color,
        dotColor: preset.dotColor,
        textColor: preset.textColor,
        subcategories: normalizeSubcategories(input.subcategories),
    };

    const yMap = new Y.Map();
    Object.entries(category).forEach(([key, value]) => yMap.set(key, value));

    yDoc.transact(() => {
        getCategoryArray(yDoc).push([yMap]);
    }, 'flow-ai-api');

    return formatCategory(category, buildCategoryCounts(yDoc));
}

export function updateCategory(yDoc, id, input = {}) {
    ensureCategoryArraySeeded(yDoc);
    const categoryId = assertCategoryExists(yDoc, id);
    const match = findCategoryMapById(yDoc, categoryId);
    if (!match) {
        throw httpError(`Category ${categoryId} cannot be edited until categories are initialized.`, 404, 'category_not_initialized');
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(input, 'label')) {
        const label = normalizeLabel(input.label);
        assertLabelAvailable(yDoc, label, categoryId);
        updates.label = label;
    }

    if (
        Object.prototype.hasOwnProperty.call(input, 'colorPreset') ||
        Object.prototype.hasOwnProperty.call(input, 'color') ||
        Object.prototype.hasOwnProperty.call(input, 'dotColor') ||
        Object.prototype.hasOwnProperty.call(input, 'textColor')
    ) {
        const preset = getPreset(input);
        updates.color = preset.color;
        updates.dotColor = preset.dotColor;
        updates.textColor = preset.textColor;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'subcategories')) {
        updates.subcategories = normalizeSubcategories(input.subcategories);
    }

    if (Object.keys(updates).length === 0) {
        throw httpError('No supported category fields to update.', 400, 'empty_category_updates');
    }

    yDoc.transact(() => {
        Object.entries(updates).forEach(([key, value]) => match.item.set(key, value));
    }, 'flow-ai-api');

    return formatCategory(match.item.toJSON(), buildCategoryCounts(yDoc));
}

export function deleteCategory(yDoc, id, options = {}) {
    ensureCategoryArraySeeded(yDoc);
    const categoryId = assertCategoryExists(yDoc, id);

    if (PROTECTED_CATEGORY_IDS.has(categoryId)) {
        throw httpError(`Category ${categoryId} is protected and cannot be deleted.`, 400, 'protected_category');
    }

    const moveItemsTo = assertCategoryExists(yDoc, options.moveItemsTo, 'target_category_not_found');
    if (moveItemsTo === categoryId) {
        throw httpError('moveItemsTo must be different from the deleted category.', 400, 'invalid_move_target');
    }

    const match = findCategoryMapById(yDoc, categoryId);
    if (!match) {
        throw httpError(`Category ${categoryId} cannot be deleted until categories are initialized.`, 404, 'category_not_initialized');
    }

    let movedItems = 0;
    const projects = getProjectArray(yDoc);

    yDoc.transact(() => {
        for (let index = 0; index < projects.length; index += 1) {
            const item = projects.get(index);
            if (!(item instanceof Y.Map)) continue;

            const project = item.toJSON();
            if ((project.stage || 'inspiration') !== 'inspiration') continue;
            if ((project.category || 'note') !== categoryId) continue;

            item.set('category', moveItemsTo);
            item.set('subcategory', null);
            movedItems += 1;
        }

        getCategoryArray(yDoc).delete(match.index, 1);
    }, 'flow-ai-api');

    return {
        deletedCategoryId: categoryId,
        movedItemsTo: moveItemsTo,
        movedItems,
    };
}

export function transferCategoryItems(yDoc, input = {}) {
    const fromCategoryId = assertCategoryExists(yDoc, input.fromCategoryId, 'source_category_not_found');
    const toCategoryId = assertCategoryExists(yDoc, input.toCategoryId, 'target_category_not_found');
    const fromSubcategory = normalizeId(input.fromSubcategory);
    const toSubcategory = input.toSubcategory === undefined ? undefined : normalizeId(input.toSubcategory);

    if (fromCategoryId === toCategoryId && toSubcategory === undefined) {
        throw httpError('Transfer target must change category or subcategory.', 400, 'invalid_transfer_target');
    }

    let movedItems = 0;
    const projects = getProjectArray(yDoc);

    yDoc.transact(() => {
        for (let index = 0; index < projects.length; index += 1) {
            const item = projects.get(index);
            if (!(item instanceof Y.Map)) continue;

            const project = item.toJSON();
            if ((project.stage || 'inspiration') !== 'inspiration') continue;
            if ((project.category || 'note') !== fromCategoryId) continue;
            if (fromSubcategory && normalizeId(project.subcategory) !== fromSubcategory) continue;

            item.set('category', toCategoryId);
            if (toSubcategory !== undefined) {
                item.set('subcategory', toSubcategory || null);
            }
            movedItems += 1;
        }
    }, 'flow-ai-api');

    return {
        fromCategoryId,
        toCategoryId,
        fromSubcategory: fromSubcategory || null,
        toSubcategory: toSubcategory === undefined ? null : toSubcategory || null,
        movedItems,
    };
}
