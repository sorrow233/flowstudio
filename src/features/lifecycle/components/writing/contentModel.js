import {
    htmlToMarkupFull as htmlToMarkup,
    markupToHtmlFull as markupToHtml,
    stripAllMarkdown as markupToPlain,
} from './markdownParser';

export const resolveWritingDocHtml = (writingDoc) => {
    const html = typeof writingDoc?.contentHtml === 'string' ? writingDoc.contentHtml : '';
    if (html.trim()) return html;
    return markupToHtml(typeof writingDoc?.content === 'string' ? writingDoc.content : '');
};

export const resolveMarkupFromHtmlString = (html = '') => {
    if (!html) return '';
    if (typeof document === 'undefined') return '';
    const container = document.createElement('div');
    container.innerHTML = html;
    return htmlToMarkup(container);
};

export const resolveWritingDocMarkup = (writingDoc) => {
    const html = typeof writingDoc?.contentHtml === 'string' ? writingDoc.contentHtml : '';
    if (html.trim()) {
        const fromHtml = resolveMarkupFromHtmlString(html);
        if (fromHtml) return fromHtml;
    }
    return typeof writingDoc?.content === 'string' ? writingDoc.content : '';
};

export const getWritingDocPlainText = (writingDoc) => markupToPlain(resolveWritingDocMarkup(writingDoc));

export const buildWritingDocUpdatePayload = ({
    title = '',
    content = '',
    editorElement,
}) => ({
    title,
    content,
    contentHtml: editorElement?.innerHTML || '',
});
