export const transferHasFileIntent = (transfer) => {
    if (!transfer) return false;

    const types = Array.from(transfer.types || []);
    if (types.includes('Files')) return true;

    return Array.from(transfer.items || []).some((item) => item.kind === 'file');
};

export const transferMayContainImageFile = (transfer) => {
    if (!transfer) return false;

    const items = Array.from(transfer.items || []);
    if (items.some((item) => item.kind === 'file' && item.type.startsWith('image/'))) {
        return true;
    }

    const files = Array.from(transfer.files || []);
    if (files.some((file) => file.type.startsWith('image/'))) return true;

    return transferHasFileIntent(transfer);
};

export const getImageFileFromTransfer = (transfer) => {
    if (!transfer) return null;

    const items = Array.from(transfer.items || []);
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) return file;
        }
    }

    const files = Array.from(transfer.files || []);
    return files.find((file) => file.type.startsWith('image/')) || null;
};
