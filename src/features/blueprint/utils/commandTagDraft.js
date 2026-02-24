const normalizeTagLabel = (label = '') => label.trim().toLowerCase();

const upsertTagByLabel = (tags, label, value) => {
    const normalizedLabel = normalizeTagLabel(label);
    const existingIndex = tags.findIndex(
        (tag) => normalizeTagLabel(tag.label) === normalizedLabel
    );

    if (existingIndex === -1) {
        return null;
    }

    const updatedTags = [...tags];
    updatedTags[existingIndex] = {
        ...updatedTags[existingIndex],
        label,
        value
    };
    return updatedTags;
};

export const resolveTagsForSubmit = ({
    commandType,
    tags = [],
    draftTag,
    editingTagId,
    fallbackContent = '',
    createId
}) => {
    if (commandType !== 'utility') {
        return tags;
    }

    const draftLabel = draftTag?.label?.trim();
    if (!draftLabel) {
        return tags;
    }

    const draftValue = draftTag?.value?.trim() || fallbackContent;

    if (editingTagId) {
        return tags.map((tag) =>
            tag.id === editingTagId
                ? { ...tag, label: draftLabel, value: draftValue }
                : tag
        );
    }

    const updatedByLabel = upsertTagByLabel(tags, draftLabel, draftValue);
    if (updatedByLabel) {
        return updatedByLabel;
    }

    return [
        ...tags,
        {
            id: createId(),
            label: draftLabel,
            value: draftValue
        }
    ];
};
