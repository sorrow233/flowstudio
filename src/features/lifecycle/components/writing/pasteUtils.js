
import { htmlToMarkup } from './editorUtils';

const normalizeMarkupText = (input = '') =>
    (input || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/[\t\f\v]+/g, ' ')
        .replace(/[ ]+\n/g, '\n')
        .replace(/\n[ ]+/g, '\n')
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

const isMeaningfulNode = (node) => {
    if (!node) return false;
    if (node.nodeType === Node.TEXT_NODE) return Boolean((node.textContent || '').trim());
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    return true;
};

const unwrapSingleParagraphIfNeeded = (container, unwrapSingleParagraph) => {
    if (!unwrapSingleParagraph || !container) return container;

    const meaningfulChildren = Array.from(container.childNodes).filter(isMeaningfulNode);
    if (meaningfulChildren.length !== 1) return container;

    const onlyNode = meaningfulChildren[0];
    if (!(onlyNode instanceof HTMLElement)) return container;
    if (onlyNode.tagName !== 'P') return container;

    const unwrappedContainer = document.createElement('div');
    while (onlyNode.firstChild) {
        unwrappedContainer.appendChild(onlyNode.firstChild);
    }
    return unwrappedContainer;
};

export const insertMarkupAtCaret = ({
    editorElement,
    markup,
    markupToHtml,
    unwrapSingleParagraph = false,
}) => {
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
    const sourceContainer = unwrapSingleParagraphIfNeeded(container, unwrapSingleParagraph);

    const fragment = document.createDocumentFragment();
    let lastNode = null;
    while (sourceContainer.firstChild) {
        lastNode = fragment.appendChild(sourceContainer.firstChild);
    }

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode) moveCaretAfter(lastNode);

    return true;
};
