const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'SVG', 'META', 'LINK']);

const normalizeOutput = (value = '') =>
    value
        .replace(/\r\n?/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const normalizeInlineText = (value = '') =>
    value
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const escapeTableCell = (value = '') => normalizeInlineText(value).replace(/\|/g, '\\|');

const serializeChildren = (element, context = {}) => {
    if (!element || !element.childNodes) return '';

    let output = '';
    element.childNodes.forEach((node) => {
        output += serializeNode(node, context);
    });
    return output;
};

const serializeTable = (tableElement, context = {}) => {
    const headRows = Array.from(tableElement.querySelectorAll(':scope > thead > tr'));
    const bodyRows = Array.from(tableElement.querySelectorAll(':scope > tbody > tr'));
    const directRows = Array.from(tableElement.querySelectorAll(':scope > tr'));

    const rows = headRows.length + bodyRows.length > 0
        ? [...headRows, ...bodyRows]
        : directRows;

    if (rows.length === 0) return '';

    const matrix = rows
        .map((row) => Array.from(row.children)
            .filter((cell) => cell.tagName === 'TH' || cell.tagName === 'TD')
            .map((cell) => escapeTableCell(serializeChildren(cell, context))));

    const columnCount = matrix.reduce((max, row) => Math.max(max, row.length), 0);
    if (columnCount === 0) return '';

    matrix.forEach((row) => {
        while (row.length < columnCount) row.push('');
    });

    const header = matrix[0];
    const body = matrix.slice(1);
    const divider = new Array(columnCount).fill('---');

    const lines = [
        `| ${header.join(' | ')} |`,
        `| ${divider.join(' | ')} |`,
        ...body.map((row) => `| ${row.join(' | ')} |`),
    ];

    return `${lines.join('\n')}\n\n`;
};

const serializeList = (listElement, context = {}) => {
    const ordered = listElement.tagName === 'OL';
    const depth = context.listDepth || 0;
    const start = ordered ? Number.parseInt(listElement.getAttribute('start') || '1', 10) || 1 : 1;

    const items = Array.from(listElement.children).filter((child) => child.tagName === 'LI');
    if (items.length === 0) return '';

    const lines = items.map((item, index) => serializeListItem(item, {
        ...context,
        listDepth: depth,
        ordered,
        orderIndex: start + index,
    })).filter(Boolean);

    return `${lines.join('\n')}\n\n`;
};

const serializeListItem = (listItemElement, context = {}) => {
    const depth = context.listDepth || 0;
    const ordered = Boolean(context.ordered);
    const orderIndex = context.orderIndex || 1;

    const indent = '  '.repeat(depth);
    const prefix = ordered ? `${orderIndex}. ` : '- ';

    const checkbox = listItemElement.querySelector(':scope > input.md-task-checkbox, :scope > p > input.md-task-checkbox');
    const taskPrefix = checkbox
        ? checkbox.checked ? '[x] ' : '[ ] '
        : '';

    let textContent = '';
    const nestedLists = [];

    listItemElement.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE && (child.tagName === 'UL' || child.tagName === 'OL')) {
            nestedLists.push(child);
            return;
        }

        if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'INPUT' && child.classList?.contains('md-task-checkbox')) {
            return;
        }

        textContent += serializeNode(child, {
            ...context,
            inListItem: true,
        });
    });

    const normalizedText = normalizeInlineText(textContent);
    const line = `${indent}${prefix}${taskPrefix}${normalizedText}`.trimEnd();

    const nested = nestedLists
        .map((nestedList) => serializeList(nestedList, { ...context, listDepth: depth + 1 }).trim())
        .filter(Boolean)
        .join('\n');

    if (!nested) return line;
    return `${line}\n${nested}`;
};

const serializeCodeBlock = (preElement) => {
    const codeElement = preElement.querySelector('code');
    const dataLang = preElement.getAttribute('data-lang') || '';
    const classLang = codeElement?.className?.match(/language-([\w-]+)/)?.[1] || '';
    const lang = dataLang || classLang;

    const code = (codeElement ? codeElement.textContent : preElement.textContent || '')
        .replace(/\n$/, '');

    return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
};

const serializeBlockquote = (quoteElement, context = {}) => {
    const inner = serializeChildren(quoteElement, context);
    const lines = inner
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) return '';
    return `${lines.map((line) => `> ${line}`).join('\n')}\n\n`;
};

const serializeHeading = (headingElement, context = {}) => {
    const level = Number(headingElement.tagName.replace('H', '')) || 1;
    const content = normalizeInlineText(serializeChildren(headingElement, context));
    return `${'#'.repeat(Math.min(Math.max(level, 1), 6))} ${content}\n\n`;
};

const serializeLink = (anchorElement, context = {}) => {
    const href = anchorElement.getAttribute('href') || '';
    const text = serializeChildren(anchorElement, context).trim() || href;
    if (!href) return text;
    return `[${text}](${href})`;
};

function serializeNode(node, context = {}) {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName;
    if (SKIP_TAGS.has(tag)) return '';

    if (node.classList?.contains('colored-text')) {
        const colorId = node.dataset?.colorId || '';
        const content = serializeChildren(node, context);
        return `#!${colorId}:${content}#`;
    }

    if (tag === 'BR') return '\n';

    if (tag === 'A') {
        return serializeLink(node, context);
    }

    if (tag === 'IMG') {
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || '';
        return src ? `![${alt}](${src})` : '';
    }

    if (tag === 'MARK') {
        return `==${serializeChildren(node, context)}==`;
    }

    if (tag === 'STRONG' || tag === 'B') {
        return `**${serializeChildren(node, context)}**`;
    }

    if (tag === 'EM' || tag === 'I') {
        return `*${serializeChildren(node, context)}*`;
    }

    if (tag === 'DEL' || tag === 'S' || tag === 'STRIKE') {
        return `~~${serializeChildren(node, context)}~~`;
    }

    if (tag === 'CODE' && node.parentElement?.tagName !== 'PRE') {
        return `\`${node.textContent || ''}\``;
    }

    if (tag === 'INPUT' && node.classList?.contains('md-task-checkbox')) {
        return '';
    }

    if (/^H[1-6]$/.test(tag)) {
        return serializeHeading(node, context);
    }

    if (tag === 'PRE') {
        return serializeCodeBlock(node);
    }

    if (tag === 'BLOCKQUOTE') {
        return serializeBlockquote(node, context);
    }

    if (tag === 'UL' || tag === 'OL') {
        return serializeList(node, context);
    }

    if (tag === 'TABLE') {
        return serializeTable(node, context);
    }

    if (tag === 'HR') {
        return '---\n\n';
    }

    if (tag === 'P') {
        const content = serializeChildren(node, { ...context, inParagraph: true });
        if (context.inListItem) return `${content}\n`;
        return `${content}\n\n`;
    }

    if (tag === 'DIV') {
        if (node.classList?.contains('md-empty-line')) return '\n\n';

        const content = serializeChildren(node, context);
        if (context.inListItem) return `${content}\n`;
        return `${content}\n`;
    }

    return serializeChildren(node, context);
}

export const htmlToMarkupFull = (element) => {
    if (!element) return '';
    return normalizeOutput(serializeChildren(element));
};
