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

    const compact = normalized.replace(/\s/g, '');
    const cjkChars = (compact.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
    const hasCjk = cjkChars > 0;
    const cjkRatio = hasCjk ? cjkChars / Math.max(1, compact.length) : 0;

    // CJK 主导内容统一按“字符”统计，即使用户插入了空格分段也不切换为“词”。
    if (hasCjk && cjkRatio >= 0.35) {
        return compact.length;
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
    const normalized = (text || '').trim();
    if (!normalized) return 'inspiration.words';

    const compact = normalized.replace(/\s/g, '');
    const cjkChars = (compact.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
    const hasCjk = cjkChars > 0;
    const cjkRatio = hasCjk ? cjkChars / Math.max(1, compact.length) : 0;

    return hasCjk && cjkRatio >= 0.35 ? 'inspiration.characters' : 'inspiration.words';
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
