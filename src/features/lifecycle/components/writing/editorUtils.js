import {
    markupToHtmlFull,
    htmlToMarkupFull,
    stripAllMarkdown,
    markupToMarkdownFull,
} from './markdownParser';

// ---------- Serialization ----------

export const htmlToMarkup = (element) => htmlToMarkupFull(element);

export const markupToHtml = (text) => markupToHtmlFull(text);

export const markupToPlain = (text) => {
    if (!text) return '';
    return stripAllMarkdown(text);
};

export const markupToMarkdown = (text) => {
    if (!text) return '';
    return markupToMarkdownFull(text);
};

export const stripMarkup = (text = '') => stripAllMarkdown(text);

// ---------- Statistics ----------

export const computeWordCount = (text) => {
    const normalized = (text || '').trim();
    if (!normalized) return 0;
    const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(normalized);
    const hasSpace = /\s/.test(normalized);
    if (hasCjk && !hasSpace) {
        return (normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
    }
    return (normalized.match(/\S+/g) || []).length;
};

export const computeCharCount = (text) => {
    if (!text) return 0;
    return text.replace(/\s/g, '').length;
};

export const computeReadMinutes = (words, chars) => {
    if (!words && !chars) return 0;
    const basis = words > 0 ? words : Math.ceil(chars / 2);
    return Math.max(1, Math.ceil(basis / 200));
};

export const detectWordCountLabel = (text) => {
    const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(text || '');
    const hasSpace = /\s/.test(text || '');
    return hasCjk && !hasSpace ? 'inspiration.characters' : 'inspiration.words';
};

// ---------- Time formatting ----------

export const formatTimestamp = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
};

export const formatTimeShort = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ---------- File helpers ----------

export const sanitizeFileName = (name) => {
    const base = (name || 'untitled').replace(/[\\/:*?"<>|]+/g, '').trim();
    return base || 'untitled';
};

export const downloadContent = (content, type, ext, title) => {
    const filename = `${sanitizeFileName(title)}.${ext}`;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
