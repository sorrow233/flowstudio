
import { htmlToMarkup } from './editorUtils';

const normalizeMarkupText = (input = '') =>
    (input || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/[\t\f\v]+/g, ' ')
        .replace(/[ ]+\n/g, '\n')
        .replace(/\n[ ]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

export const clipboardToMarkup = (clipboardData) => {
    if (!clipboardData) return '';

    const html = clipboardData.getData('text/html');
    if (html) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        // 使用 unified parser 提取
        const markup = htmlToMarkup(parsed.body);
        const normalized = normalizeMarkupText(markup);
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
