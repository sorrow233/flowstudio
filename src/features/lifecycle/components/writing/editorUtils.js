import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

// ---------- Serialization ----------

export const htmlToMarkup = (element) => {
    if (!element) return '';
    let result = '';
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'BR') {
                result += '\n';
            } else if (node.classList?.contains('colored-text')) {
                const colorId = node.dataset.colorId;
                result += `#!${colorId}:${node.textContent}#`;
            } else if (node.tagName === 'IMG') {
                const src = node.getAttribute('src');
                const alt = node.getAttribute('alt') || '';
                // 如果是 loading 状态的占位符（blob URL），我们暂时保留，或者由 handleInput 处理
                // 但为了避免持久化 blob URL，最好是只在 src 非 blob 时保存？
                // 不，用户可能想保存 blob 暂时。
                if (src) {
                    result += `![${alt}](${src})`;
                }
            } else if (node.tagName === 'DIV') {
                const inner = htmlToMarkup(node);
                if (result && !result.endsWith('\n')) result += '\n';
                result += inner;
            } else {
                result += htmlToMarkup(node);
            }
        }
    });
    return result;
};

export const markupToHtml = (text) => {
    if (!text) return '';
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/#!([^:]+):([^#]+)#/g, (_, colorId, content) => {
            const colorConfig = COLOR_CONFIG.find((c) => c.id === colorId);
            const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
            const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;
            return `<span class="colored-text relative inline" data-color-id="${colorId}" style="${style}">${content}</span>`;
        })
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
        .replace(/\n/g, '<br>');
};

export const markupToPlain = (text) => {
    if (!text) return '';
    return text
        .replace(/#!([^:]+):([^#]+)#/g, (_, __, content) => content)
        .replace(/!\[(.*?)\]\((.*?)\)/g, '[图片: $1]');
};

export const markupToMarkdown = (text) => {
    if (!text) return '';
    return text
        .replace(/#!([^:]+):([^#]+)#/g, (_, __, content) => `==${content}==`);
    // 图片语法本身就是 Markdown，无需转换
};

export const stripMarkup = (text = '') =>
    text
        .replace(/#!([^:]+):([^#]+)#/g, '$2')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '') // 移除图片
        .replace(/<[^>]*>?/gm, '')
        .trim();

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
