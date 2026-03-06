import {
    htmlToMarkupFull as htmlToMarkup,
    markupToHtmlFull as markupToHtml,
} from './markdownParser';

export const resolveWritingDocHtml = (writingDoc) => {
    const html = typeof writingDoc?.contentHtml === 'string' ? writingDoc.contentHtml : '';
    if (html.trim()) return html;
    return markupToHtml(typeof writingDoc?.content === 'string' ? writingDoc.content : '');
};

export const resolveMarkupFromHtmlString = (html = '') => {
    if (!html) return '';
    const container = document.createElement('div');
    container.innerHTML = html;
    return htmlToMarkup(container);
};

export const buildWritingDocUpdatePayload = ({
    title = '',
    content = '',
    editorElement,
}) => ({
    title,
    content,
    contentHtml: editorElement?.innerHTML || '',
});
