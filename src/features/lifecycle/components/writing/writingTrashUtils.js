export const TRASH_RETENTION_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isInWritingTrash = (doc) => Boolean(doc?.isDeleted);

export const getDeletedAt = (doc) => {
    const value = Number(doc?.deletedAt);
    return Number.isFinite(value) ? value : 0;
};

export const getTrashExpireAt = (doc) => getDeletedAt(doc) + TRASH_RETENTION_DAYS * DAY_MS;

export const isTrashExpired = (doc, now = Date.now()) => {
    if (!isInWritingTrash(doc)) return false;
    const deletedAt = getDeletedAt(doc);
    if (!deletedAt) return false;
    return now >= deletedAt + TRASH_RETENTION_DAYS * DAY_MS;
};

export const getTrashRemainingDays = (doc, now = Date.now()) => {
    if (!isInWritingTrash(doc)) return TRASH_RETENTION_DAYS;
    const deletedAt = getDeletedAt(doc);
    if (!deletedAt) return TRASH_RETENTION_DAYS;

    const remainingMs = deletedAt + TRASH_RETENTION_DAYS * DAY_MS - now;
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / DAY_MS);
};

