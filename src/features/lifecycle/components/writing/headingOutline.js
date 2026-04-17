const HEADING_SELECTOR = 'h1.md-heading, h2.md-heading, h3.md-heading, h4.md-heading, h5.md-heading, h6.md-heading';

const normalizeHeadingText = (value = '') =>
    String(value || '')
        .replace(/\s+/g, ' ')
        .trim();

const slugifyHeadingText = (value = '') => {
    const normalized = normalizeHeadingText(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return normalized || 'section';
};

export const syncEditorHeadingOutline = (editorElement) => {
    if (!editorElement) return [];

    const seen = new Map();

    return Array.from(editorElement.querySelectorAll(HEADING_SELECTOR))
        .map((element, index) => {
            const text = normalizeHeadingText(element.textContent || '');
            if (!text) return null;

            const level = Number.parseInt(element.tagName.replace('H', ''), 10) || 1;
            const baseSlug = slugifyHeadingText(text);
            const slugCount = seen.get(baseSlug) || 0;
            seen.set(baseSlug, slugCount + 1);

            const id = slugCount === 0
                ? `writing-heading-${baseSlug}`
                : `writing-heading-${baseSlug}-${slugCount + 1}`;

            element.id = id;

            return {
                id,
                text,
                level: Math.min(Math.max(level, 1), 6),
                order: index,
            };
        })
        .filter(Boolean);
};
