const BLOCK_TAGS = new Set([
    'P',
    'DIV',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'UL',
    'OL',
    'LI',
    'PRE',
    'BLOCKQUOTE',
    'SECTION',
    'ARTICLE',
    'TABLE',
    'TR',
    'TD',
    'TH',
]);

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'SVG']);

const normalizeMarkupText = (input = '') =>
    (input || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/[\t\f\v]+/g, ' ')
        .replace(/[ ]+\n/g, '\n')
        .replace(/\n[ ]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const ensureLineBreak = (chunks) => {
    if (!chunks.length) return;
    if (chunks[chunks.length - 1] !== '\n') chunks.push('\n');
};

const resolveListPrefix = (node) => {
    const parent = node.parentElement;
    if (!parent) return '- ';
    if (parent.tagName === 'OL') {
        const allItems = Array.from(parent.children).filter((child) => child.tagName === 'LI');
        const index = allItems.indexOf(node);
        return `${index + 1}. `;
    }
    return '- ';
};

const extractMarkupFromNode = (node, chunks) => {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
        chunks.push(node.textContent || '');
        return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName;
    if (SKIP_TAGS.has(tag)) return;

    if (node.classList?.contains('colored-text') && node.dataset?.colorId) {
        const colorId = node.dataset.colorId;
        const text = normalizeMarkupText(node.textContent || '');
        if (!text) return;
        chunks.push(`#!${colorId}:${text}#`);
        return;
    }

    if (tag === 'BR') {
        chunks.push('\n');
        return;
    }

    if (tag === 'LI') {
        ensureLineBreak(chunks);
        chunks.push(resolveListPrefix(node));
        Array.from(node.childNodes).forEach((child) => extractMarkupFromNode(child, chunks));
        ensureLineBreak(chunks);
        return;
    }

    if (tag === 'TR') {
        ensureLineBreak(chunks);
        const cells = Array.from(node.children).filter((child) => child.tagName === 'TD' || child.tagName === 'TH');
        cells.forEach((cell, index) => {
            if (index > 0) chunks.push(' | ');
            extractMarkupFromNode(cell, chunks);
        });
        ensureLineBreak(chunks);
        return;
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) ensureLineBreak(chunks);

    Array.from(node.childNodes).forEach((child) => extractMarkupFromNode(child, chunks));

    if (isBlock) ensureLineBreak(chunks);
};

export const clipboardToMarkup = (clipboardData) => {
    if (!clipboardData) return '';

    const html = clipboardData.getData('text/html');
    if (html) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        const chunks = [];
        Array.from(parsed.body.childNodes).forEach((node) => extractMarkupFromNode(node, chunks));
        const normalized = normalizeMarkupText(chunks.join(''));
        if (normalized) return normalized;
    }

    const plainText = clipboardData.getData('text/plain') || '';
    return normalizeMarkupText(plainText);
};

const moveCaretAfter = (node) => {
    const selection = window.getSelection();
    if (!selection || !node) return;

    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};

export const insertMarkupAtCaret = ({ editorElement, markup, markupToHtml }) => {
    if (!editorElement || !markup) return false;

    editorElement.focus();
    const selection = window.getSelection();
    if (!selection) return false;

    let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range || !editorElement.contains(range.commonAncestorContainer)) {
        range = document.createRange();
        range.selectNodeContents(editorElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    const html = markupToHtml(markup);
    const container = document.createElement('div');
    container.innerHTML = html;

    const fragment = document.createDocumentFragment();
    let lastNode = null;
    while (container.firstChild) {
        lastNode = fragment.appendChild(container.firstChild);
    }

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode) moveCaretAfter(lastNode);

    return true;
};

