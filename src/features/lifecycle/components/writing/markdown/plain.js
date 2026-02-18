import { EMPTY_LINE_TOKEN } from './constants';

const normalize = (value = '') =>
    value
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EMPTY_LINE_TOKEN_RE = new RegExp(escapeRegExp(EMPTY_LINE_TOKEN), 'g');

export const stripAllMarkdown = (text = '') => {
    if (!text) return '';

    const output = text
        .replace(EMPTY_LINE_TOKEN_RE, '\n')
        // 自定义高亮
        .replace(/#!([^:\n#]+):([^\n#]+)#/g, '$2')
        // 代码块
        .replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (_match, _lang, code) => code)
        // 行内代码
        .replace(/`([^`]+?)`/g, '$1')
        // 图片
        .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
        // 链接
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        // 自动链接
        .replace(/<((https?:\/\/|mailto:)[^>]+)>/g, '$1')
        // 任务列表标记
        .replace(/^(\s*[-*+]\s+)\[(?: |x|X)\]\s+/gm, '$1')
        .replace(/^(\s*\d+[.)]\s+)\[(?: |x|X)\]\s+/gm, '$1')
        // 表格分隔行
        .replace(/^\|?\s*[:-]+\s*(\|\s*[:-]+\s*)+\|?\s*$/gm, '')
        // 表格竖线
        .replace(/^\|(.+)\|$/gm, '$1')
        .replace(/\s*\|\s*/g, ' ')
        .replace(/\\\|/g, '|')
        // 标题、引用、列表前缀
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+[.)]\s+/gm, '')
        // 分割线
        .replace(/^(?:---+|\*\*\*+|___+)\s*$/gm, '')
        // mark / emphasis
        .replace(/==([^=]+)==/g, '$1')
        .replace(/\*\*\*([^*]+?)\*\*\*/g, '$1')
        .replace(/___([^_]+?)___/g, '$1')
        .replace(/\*\*([^*]+?)\*\*/g, '$1')
        .replace(/__([^_]+?)__/g, '$1')
        .replace(/(?<!\w)\*([^\n*]+?)\*(?!\w)/g, '$1')
        .replace(/(?<!\w)_([^\n_]+?)_(?!\w)/g, '$1')
        .replace(/~~([^~]+?)~~/g, '$1')
        // HTML 标签
        .replace(/<[^>]*>/g, '');

    return normalize(output);
};

export const markupToMarkdownFull = (text = '') => {
    if (!text) return '';

    return normalize(
        text
            .replace(EMPTY_LINE_TOKEN_RE, '\n')
            .replace(/#!([^:\n#]+):([^\n#]+)#/g, (_match, _colorId, content) => `==${content}==`),
    );
};
