export const MARKDOWN_QUICK_ACTIONS = [
    { id: 'h1', label: 'H1', preview: '# 标题', group: 'block' },
    { id: 'h2', label: 'H2', preview: '## 小节', group: 'block' },
    { id: 'quote', label: '引用', preview: '> 引用内容', group: 'block' },
    { id: 'task', label: '任务', preview: '- [ ] 待办', group: 'block' },
    { id: 'code', label: '代码', preview: '```lang', group: 'block' },
    { id: 'table', label: '表格', preview: '| 列1 | 列2 |', group: 'block' },
    { id: 'bold', label: '粗体', preview: '**文本**', group: 'inline' },
    { id: 'italic', label: '斜体', preview: '*文本*', group: 'inline' },
    { id: 'link', label: '链接', preview: '[文本](url)', group: 'inline' },
    { id: 'mark', label: '标记', preview: '==文本==', group: 'inline' },
];

const normalizeInline = (value = '') =>
    value
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .trim();

const normalizeLines = (value = '') =>
    value
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

const wrapBlock = (content = '') => `\n${content}\n`;

export const buildMarkdownSnippet = (actionId, selectedText = '') => {
    const inlineText = normalizeInline(selectedText);
    const lines = normalizeLines(selectedText);
    const hasSelection = lines.length > 0;

    switch (actionId) {
    case 'h1':
        return wrapBlock(`# ${inlineText || '标题'}`);
    case 'h2':
        return wrapBlock(`## ${inlineText || '小节标题'}`);
    case 'quote': {
        const source = hasSelection ? lines : ['引用内容'];
        return wrapBlock(source.map((line) => `> ${line}`).join('\n'));
    }
    case 'task': {
        const source = hasSelection ? lines : ['待办事项'];
        return wrapBlock(source.map((line) => `- [ ] ${line}`).join('\n'));
    }
    case 'code': {
        const codeContent = selectedText.replace(/\r\n?/g, '\n').trim();
        const normalizedCode = codeContent ? `${codeContent}\n` : '\n';
        return `\n\`\`\`text\n${normalizedCode}\`\`\`\n`;
    }
    case 'table':
        return '\n| 列1 | 列2 |\n| --- | --- |\n| 内容1 | 内容2 |\n';
    case 'bold':
        return `**${inlineText || '加粗文本'}**`;
    case 'italic':
        return `*${inlineText || '斜体文本'}*`;
    case 'link':
        return `[${inlineText || '链接文本'}](https://example.com)`;
    case 'mark':
        return `==${inlineText || '重点内容'}==`;
    default:
        return '';
    }
};
