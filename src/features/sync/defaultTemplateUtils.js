import * as Y from 'yjs';
import { DEFAULT_TEMPLATE, DEFAULT_TEMPLATE_SOURCE } from '../../data/defaultTemplate';

const DEFAULT_TEMPLATE_IDS = new Set(
    (DEFAULT_TEMPLATE.inspirations || [])
        .map((item) => item?.id)
        .filter(Boolean)
);

const readValue = (value) => {
    if (value instanceof Y.Map) {
        return value.toJSON();
    }

    return value;
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const isDefaultTemplateItem = (value) => {
    const item = readValue(value);

    if (!isPlainObject(item)) {
        return false;
    }

    if (item.systemSource === DEFAULT_TEMPLATE_SOURCE) {
        return true;
    }

    return typeof item.id === 'string' && DEFAULT_TEMPLATE_IDS.has(item.id);
};

export const getDefaultTemplateItemIndexes = (doc, arrayName = 'all_projects') => {
    if (!doc) return [];

    const yArray = doc.getArray(arrayName);
    const indexes = [];

    yArray.toArray().forEach((item, index) => {
        if (isDefaultTemplateItem(item)) {
            indexes.push(index);
        }
    });

    return indexes;
};

export const removeDefaultTemplateItems = (doc, arrayName = 'all_projects') => {
    const indexes = getDefaultTemplateItemIndexes(doc, arrayName);

    if (indexes.length === 0) {
        return 0;
    }

    const yArray = doc.getArray(arrayName);
    doc.transact(() => {
        indexes
            .sort((a, b) => b - a)
            .forEach((index) => {
                yArray.delete(index, 1);
            });
    });

    return indexes.length;
};
