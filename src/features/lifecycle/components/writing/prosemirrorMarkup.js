import { Fragment, Slice } from 'prosemirror-model';

const MARKUP_COLOR_PATTERN = /#!([^:]+):([^#]+)#/g;

const parseInlineText = (schema, text) => {
    if (!text) return [];
    const segments = [];
    let cursor = 0;
    let match = MARKUP_COLOR_PATTERN.exec(text);

    while (match) {
        const [raw, colorId, content] = match;
        const index = match.index;

        if (index > cursor) {
            segments.push(schema.text(text.slice(cursor, index)));
        }

        if (content) {
            const highlightMark = schema.marks.highlight.create({ colorId });
            segments.push(schema.text(content, [highlightMark]));
        } else {
            segments.push(schema.text(raw));
        }

        cursor = index + raw.length;
        match = MARKUP_COLOR_PATTERN.exec(text);
    }

    if (cursor < text.length) {
        segments.push(schema.text(text.slice(cursor)));
    }

    MARKUP_COLOR_PATTERN.lastIndex = 0;
    return segments;
};

export const markupToDoc = (schema, markup = '') => {
    const lines = (markup || '').replace(/\r\n/g, '\n').split('\n');
    const paragraphs = lines.map((line) =>
        schema.nodes.paragraph.create(null, parseInlineText(schema, line)),
    );
    return schema.nodes.doc.create(null, paragraphs.length > 0 ? paragraphs : [schema.nodes.paragraph.create()]);
};

const inlineNodesToMarkup = (node) => {
    let text = '';
    node.forEach((child) => {
        if (child.type.name === 'text') {
            const content = child.text || '';
            const highlightMark = child.marks.find((mark) => mark.type.name === 'highlight');
            if (highlightMark) {
                const colorId = highlightMark.attrs.colorId || 'sky';
                text += `#!${colorId}:${content}#`;
            } else {
                text += content;
            }
            return;
        }
        if (child.type.name === 'hard_break') {
            text += '\n';
        }
    });
    return text;
};

export const docToMarkup = (doc) => {
    if (!doc) return '';
    const lines = [];
    doc.forEach((block) => {
        if (block.type.name !== 'paragraph') return;
        lines.push(inlineNodesToMarkup(block));
    });
    return lines.join('\n');
};

export const docToPlainText = (doc) => {
    if (!doc) return '';
    return doc.textBetween(0, doc.content.size, '\n', '\n');
};

export const textToPasteSlice = (schema, text = '') => {
    const normalized = (text || '').replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');

    if (lines.length <= 1) {
        const inlineNodes = parseInlineText(schema, normalized);
        return new Slice(Fragment.fromArray(inlineNodes), 0, 0);
    }

    const paragraphs = lines.map((line) =>
        schema.nodes.paragraph.create(null, parseInlineText(schema, line)),
    );
    return new Slice(Fragment.fromArray(paragraphs), 0, 0);
};

