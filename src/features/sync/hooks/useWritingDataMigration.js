import { useEffect } from 'react';
import * as Y from 'yjs';
import { WRITING_CATEGORIES } from '../../../utils/constants';

const toPlainObject = (item) => {
    if (item instanceof Y.Map) return item.toJSON();
    if (item && typeof item === 'object') return item;
    return {};
};

const toValidTimestamp = (...candidates) => {
    for (let index = 0; index < candidates.length; index += 1) {
        const value = Number(candidates[index]);
        if (Number.isFinite(value) && value > 0) return value;
    }
    return Date.now();
};

const readLegacyWritingContent = (map, docId) => {
    if (!map || !docId) return '';
    const value = map.get(docId);
    if (value instanceof Y.Text) return value.toString();
    if (typeof value === 'string') return value;
    return '';
};

const createYMap = (payload = {}) => {
    const yMap = new Y.Map();
    Object.entries(payload).forEach(([key, value]) => {
        yMap.set(key, value);
    });
    return yMap;
};

const pickCategoryStyle = (seed = 0) => {
    if (!Array.isArray(WRITING_CATEGORIES) || WRITING_CATEGORIES.length === 0) {
        return {
            color: 'bg-stone-400',
            dotColor: 'bg-stone-400',
            textColor: 'text-stone-400',
        };
    }

    const normalizedSeed = Math.abs(Number(seed) || 0);
    const preset = WRITING_CATEGORIES[normalizedSeed % WRITING_CATEGORIES.length];
    return {
        color: preset.color,
        dotColor: preset.dotColor,
        textColor: preset.textColor,
    };
};

const normalizeCategoryLabel = (label, fallbackId, fallbackIndex) => {
    const text = String(label || '').trim();
    if (text) return text.slice(0, 24);
    if (fallbackId) return String(fallbackId).slice(0, 24);
    return `分类 ${fallbackIndex + 1}`;
};

export const useWritingDataMigration = (doc, status = 'disconnected') => {
    useEffect(() => {
        if (!doc) return;
        if (status === 'disconnected') return;

        const migrateWritingData = () => {
            doc.transact(() => {
                const yAllProjects = doc.getArray('all_projects');
                const yWritingDocs = doc.getArray('writing_docs');
                const yWritingContent = doc.getMap('writing_content');
                const yWritingFolders = doc.getArray('writing_folders');
                const yWritingCategories = doc.getArray('writing_categories');

                const existingProjectIds = new Set();
                const writingProjectMaps = new Map();

                yAllProjects.toArray().forEach((item) => {
                    const value = toPlainObject(item);
                    if (!value?.id) return;
                    existingProjectIds.add(value.id);
                    if (value.stage === 'writing' && item instanceof Y.Map) {
                        writingProjectMaps.set(value.id, item);
                    }
                });

                const categoryMap = new Map();
                yWritingCategories.toArray().forEach((item) => {
                    const value = toPlainObject(item);
                    if (!value?.id) return;
                    categoryMap.set(value.id, value);
                });

                const ensureCategory = (rawId, rawLabel, seed = 0) => {
                    const id = String(rawId || '').trim();
                    if (!id) return WRITING_CATEGORIES[0]?.id || 'draft';
                    if (categoryMap.has(id)) return id;

                    const style = pickCategoryStyle(seed);
                    const payload = {
                        id,
                        label: normalizeCategoryLabel(rawLabel, id, categoryMap.size),
                        ...style,
                    };

                    yWritingCategories.push([createYMap(payload)]);
                    categoryMap.set(id, payload);
                    return id;
                };

                // 保底写入默认分类，避免“只有自定义分类/空分类”导致文档被筛选隐藏。
                WRITING_CATEGORIES.forEach((category, index) => {
                    ensureCategory(category.id, category.label, index);
                });

                yWritingFolders.toArray().forEach((item, index) => {
                    const folder = toPlainObject(item);
                    const id = folder.id || folder.folderId;
                    const label = folder.label || folder.name || folder.title;
                    ensureCategory(id, label, index + categoryMap.size);
                });

                let backfillIndex = 0;
                writingProjectMaps.forEach((projectMap, projectId) => {
                    const currentCategory = String(projectMap.get('category') || '').trim();
                    const legacyFolderId = projectMap.get('folderId') || projectMap.get('folder_id') || projectMap.get('folder');
                    const legacyCategoryName = projectMap.get('categoryName') || projectMap.get('folderName') || projectMap.get('folderLabel');

                    if (!currentCategory || !categoryMap.has(currentCategory)) {
                        const nextCategory = ensureCategory(
                            currentCategory || legacyFolderId || WRITING_CATEGORIES[0]?.id || 'draft',
                            legacyCategoryName,
                            backfillIndex
                        );
                        projectMap.set('category', nextCategory);
                    }

                    const currentContent = projectMap.get('content');
                    if ((typeof currentContent !== 'string' || currentContent.length === 0) && yWritingContent.has(projectId)) {
                        const migratedContent = readLegacyWritingContent(yWritingContent, projectId);
                        if (migratedContent) projectMap.set('content', migratedContent);
                    }

                    if (!projectMap.get('stage')) {
                        projectMap.set('stage', 'writing');
                    }

                    if (!projectMap.get('lastModified')) {
                        projectMap.set(
                            'lastModified',
                            toValidTimestamp(
                                projectMap.get('updatedAt'),
                                projectMap.get('timestamp'),
                                projectMap.get('createdAt')
                            )
                        );
                    }

                    backfillIndex += 1;
                });

                yWritingDocs.toArray().forEach((item, index) => {
                    const legacyDoc = toPlainObject(item);
                    const id = legacyDoc.id;
                    if (!id || existingProjectIds.has(id)) return;

                    const category = ensureCategory(
                        legacyDoc.category || legacyDoc.folderId || legacyDoc.folder || legacyDoc.folder_id || WRITING_CATEGORIES[0]?.id || 'draft',
                        legacyDoc.categoryName || legacyDoc.folderName || legacyDoc.folderLabel,
                        index + categoryMap.size
                    );

                    const content = typeof legacyDoc.content === 'string'
                        ? legacyDoc.content
                        : readLegacyWritingContent(yWritingContent, id);

                    const timestamp = toValidTimestamp(
                        legacyDoc.timestamp,
                        legacyDoc.updatedAt,
                        legacyDoc.createdAt
                    );

                    const normalizedProject = {
                        ...legacyDoc,
                        id,
                        stage: 'writing',
                        category,
                        content: content || '',
                        timestamp: toValidTimestamp(legacyDoc.timestamp, timestamp),
                        lastModified: toValidTimestamp(legacyDoc.lastModified, legacyDoc.updatedAt, timestamp),
                    };

                    yAllProjects.push([createYMap(normalizedProject)]);
                    existingProjectIds.add(id);
                });

                yWritingContent.forEach((_, key) => {
                    const id = String(key || '').trim();
                    if (!id || existingProjectIds.has(id)) return;

                    const content = readLegacyWritingContent(yWritingContent, id);
                    if (!content) return;

                    const now = Date.now();
                    const normalizedProject = {
                        id,
                        title: '',
                        stage: 'writing',
                        category: WRITING_CATEGORIES[0]?.id || 'draft',
                        content,
                        timestamp: now,
                        lastModified: now,
                    };

                    yAllProjects.push([createYMap(normalizedProject)]);
                    existingProjectIds.add(id);
                });
            });
        };

        migrateWritingData();
    }, [doc, status]);
};

