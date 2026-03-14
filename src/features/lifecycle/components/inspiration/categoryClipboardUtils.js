import { normalizeIdeaTextForExport } from './categoryTransferUtils';

const EMPTY_PLACEHOLDER = '（空）';

const sanitizeMultilineText = (value = '') => {
    return String(value)
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' / ');
};

export const formatIdeaSnapshotTimestamp = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    if (Number.isNaN(date.getTime())) {
        return '未知时间';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const buildCategoryClipboardText = ({
    categoryLabel = '当前分类',
    ideas = [],
}) => {
    const sortedIdeas = [...ideas].sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));

    const headerLines = [
        `分类：${categoryLabel}`,
        `数量：${sortedIdeas.length}`,
    ];

    if (sortedIdeas.length === 0) {
        return `${headerLines.join('\n')}\n\n暂无内容`;
    }

    const ideaBlocks = sortedIdeas.map((idea, index) => {
        const content = normalizeIdeaTextForExport(idea?.content || '') || EMPTY_PLACEHOLDER;
        const status = idea?.completed ? '[已完成]' : '[未完成]';
        const timestamp = formatIdeaSnapshotTimestamp(idea?.timestamp);
        const note = sanitizeMultilineText(idea?.note || '');
        const lines = [
            `${index + 1}. ${status} ${timestamp} ${content}`.trim(),
        ];

        if (note) {
            lines.push(`留言：${note}`);
        }

        return lines.join('\n');
    });

    return `${headerLines.join('\n')}\n\n${ideaBlocks.join('\n\n')}`;
};
