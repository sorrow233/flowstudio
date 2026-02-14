import { Schema } from 'prosemirror-model';

export const writingSchema = new Schema({
    nodes: {
        doc: { content: 'block+' },
        paragraph: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'p' }],
            toDOM: () => ['p', 0],
        },
        text: { group: 'inline' },
        hard_break: {
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }],
            toDOM: () => ['br'],
        },
    },
    marks: {
        highlight: {
            attrs: { colorId: { default: 'sky' } },
            parseDOM: [
                {
                    tag: 'span.colored-text[data-color-id]',
                    getAttrs: (dom) => ({
                        colorId: dom.getAttribute('data-color-id') || 'sky',
                    }),
                },
                {
                    tag: 'mark[data-color-id]',
                    getAttrs: (dom) => ({
                        colorId: dom.getAttribute('data-color-id') || 'sky',
                    }),
                },
            ],
            toDOM: (mark) => [
                'mark',
                {
                    class: 'writing-highlight colored-text',
                    'data-color-id': mark.attrs.colorId || 'sky',
                },
                0,
            ],
        },
    },
});

