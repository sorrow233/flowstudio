import { isInWritingTrash } from '../components/writing/writingTrashUtils.js';

export const isWritingProject = (project) => project?.stage === 'writing';

const appendActiveWritingDoc = (docs, seenIds, doc) => {
    if (!doc?.id || seenIds.has(doc.id)) return;

    seenIds.add(doc.id);
    if (!isInWritingTrash(doc)) {
        docs.push(doc);
    }
};

export const getActiveWritingDocs = (allProjects = [], writingDocs = []) => {
    const docs = [];
    const seenIds = new Set();

    (Array.isArray(allProjects) ? allProjects : [])
        .filter(isWritingProject)
        .forEach((project) => appendActiveWritingDoc(docs, seenIds, project));

    (Array.isArray(writingDocs) ? writingDocs : [])
        .forEach((doc) => appendActiveWritingDoc(docs, seenIds, doc));

    return docs;
};

export const countActiveWritingDocs = (allProjects = [], writingDocs = []) =>
    getActiveWritingDocs(allProjects, writingDocs).length;
