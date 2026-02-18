export const resolveCreatedTimestamp = (docItem) => Number(docItem?.timestamp || 0);

export const normalizeManualOrder = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const sortWritingDocuments = (documents = [], options = {}) => {
    const { categoryId = null, useManualOrder = false } = options;

    return [...documents].sort((leftDoc, rightDoc) => {
        if (useManualOrder && categoryId) {
            const leftOrder = leftDoc?.manualOrderCategory === categoryId ? normalizeManualOrder(leftDoc?.manualOrder) : null;
            const rightOrder = rightDoc?.manualOrderCategory === categoryId ? normalizeManualOrder(rightDoc?.manualOrder) : null;

            if (leftOrder !== null && rightOrder !== null) return leftOrder - rightOrder;
            if (leftOrder !== null) return -1;
            if (rightOrder !== null) return 1;
        }

        return resolveCreatedTimestamp(rightDoc) - resolveCreatedTimestamp(leftDoc);
    });
};

export const hasCategoryManualOrder = (documents = [], categoryId = null) => {
    if (!categoryId) return false;
    return documents.some((docItem) =>
        docItem?.manualOrderCategory === categoryId
        && normalizeManualOrder(docItem?.manualOrder) !== null
    );
};
