import MarkdownIt from 'markdown-it';
import markdownItMark from 'markdown-it-mark';
import { COLOR_CONFIG } from '../../inspiration/InspirationUtils';
import { EMPTY_LINE_TOKEN } from './constants';

const COLOR_MARKUP_RE = /^#!([^:\n#]+):([^\n#]+)#/;

const escapeAttr = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const appendClass = (token, className) => {
    if (!token || !className) return;
    const existing = token.attrGet('class');
    token.attrSet('class', existing ? `${existing} ${className}` : className);
};

const applyColorMarkupPlugin = (md) => {
    md.inline.ruler.before('emphasis', 'flowstudio_color_markup', (state, silent) => {
        const slice = state.src.slice(state.pos);
        const match = slice.match(COLOR_MARKUP_RE);
        if (!match) return false;

        if (!silent) {
            const token = state.push('flowstudio_color_markup', 'span', 0);
            token.meta = {
                colorId: match[1]?.trim() || '',
                content: match[2] || '',
            };
        }

        state.pos += match[0].length;
        return true;
    });

    md.renderer.rules.flowstudio_color_markup = (tokens, index) => {
        const meta = tokens[index]?.meta || {};
        const colorId = meta.colorId || '';
        const content = md.utils.escapeHtml(meta.content || '');

        const colorConfig = COLOR_CONFIG.find((item) => item.id === colorId);
        const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
        const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;

        return `<span class="colored-text relative inline align-baseline" data-color-id="${escapeAttr(colorId)}" style="${style}">${content}</span>`;
    };
};

const applyTaskListPlugin = (md) => {
    const TASK_ITEM_RE = /^\[( |x|X)\]\s+/;

    md.core.ruler.after('inline', 'flowstudio_task_list', (state) => {
        const { tokens } = state;

        for (let index = 2; index < tokens.length; index += 1) {
            const inlineToken = tokens[index];
            const paragraphOpen = tokens[index - 1];
            const listItemOpen = tokens[index - 2];

            if (inlineToken?.type !== 'inline') continue;
            if (paragraphOpen?.type !== 'paragraph_open') continue;
            if (listItemOpen?.type !== 'list_item_open') continue;

            const raw = inlineToken.content || '';
            const markerMatch = raw.match(TASK_ITEM_RE);
            if (!markerMatch) continue;

            const checked = markerMatch[1].toLowerCase() === 'x';
            inlineToken.content = raw.replace(TASK_ITEM_RE, '');

            if (Array.isArray(inlineToken.children) && inlineToken.children.length > 0) {
                let stripped = false;
                for (const child of inlineToken.children) {
                    if (child.type !== 'text' || stripped) continue;
                    const nextContent = child.content.replace(TASK_ITEM_RE, '');
                    if (nextContent !== child.content) {
                        child.content = nextContent;
                        stripped = true;
                    }
                }

                const checkboxToken = new state.Token('html_inline', '', 0);
                checkboxToken.content = `<input class="md-task-checkbox" type="checkbox" disabled${checked ? ' checked' : ''} />`;

                const spaceToken = new state.Token('text', '', 0);
                spaceToken.content = ' ';

                inlineToken.children.unshift(spaceToken);
                inlineToken.children.unshift(checkboxToken);
            }

            listItemOpen.meta = {
                ...(listItemOpen.meta || {}),
                task: true,
                checked,
            };

            for (let parent = index - 3; parent >= 0; parent -= 1) {
                const candidate = tokens[parent];
                if (!candidate) continue;
                const isList = candidate.type === 'bullet_list_open' || candidate.type === 'ordered_list_open';
                if (!isList) continue;
                if (candidate.level !== listItemOpen.level - 1) continue;

                candidate.meta = {
                    ...(candidate.meta || {}),
                    hasTaskItems: true,
                };
                break;
            }
        }
    });
};

const HEADING_CLASSES = {
    h1: 'md-heading md-h1',
    h2: 'md-heading md-h2',
    h3: 'md-heading md-h3',
    h4: 'md-heading md-h4',
    h5: 'md-heading md-h5',
    h6: 'md-heading md-h6',
};

const createMarkdownRenderer = () => {
    const md = new MarkdownIt({
        html: false,
        linkify: true,
        breaks: true,
        typographer: true,
    });

    md.use(markdownItMark);
    applyColorMarkupPlugin(md);
    applyTaskListPlugin(md);

    md.renderer.rules.paragraph_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-paragraph');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.heading_open = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, HEADING_CLASSES[token.tag] || 'md-heading');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.blockquote_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-blockquote');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.bullet_list_open = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, token.meta?.hasTaskItems ? 'md-task-list' : 'md-ul');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.ordered_list_open = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, token.meta?.hasTaskItems ? 'md-task-list md-ol-task' : 'md-ol');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.list_item_open = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, token.meta?.task ? 'md-li md-task-item' : 'md-li');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.hr = () => '<hr class="md-hr" />';

    md.renderer.rules.link_open = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, 'md-link');

        const href = token.attrGet('href') || '';
        const isExternal = /^(https?:)?\/\//i.test(href);
        if (isExternal) {
            token.attrSet('target', '_blank');
            token.attrSet('rel', 'noopener noreferrer nofollow');
        }

        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.image = (tokens, index, options, _env, self) => {
        const token = tokens[index];
        appendClass(token, 'md-img');
        token.attrSet('loading', 'lazy');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.table_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-table');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.thead_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-thead');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.tbody_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-tbody');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.tr_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-tr');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.th_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-th');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.td_open = (tokens, index, options, _env, self) => {
        appendClass(tokens[index], 'md-td');
        return self.renderToken(tokens, index, options);
    };

    md.renderer.rules.fence = (tokens, index) => {
        const token = tokens[index];
        const info = (token.info || '').trim();
        const lang = info.split(/\s+/)[0] || '';
        const langLabel = lang
            ? `<div class="md-code-lang">${md.utils.escapeHtml(lang.toUpperCase())}</div>`
            : '';
        const escapedCode = md.utils.escapeHtml(token.content || '');

        return `<pre class="md-code-block" data-lang="${escapeAttr(lang)}">${langLabel}<code>${escapedCode}</code></pre>`;
    };

    md.renderer.rules.code_block = (tokens, index) => {
        const escapedCode = md.utils.escapeHtml(tokens[index].content || '');
        return `<pre class="md-code-block"><code>${escapedCode}</code></pre>`;
    };

    md.renderer.rules.code_inline = (tokens, index) => {
        const escaped = md.utils.escapeHtml(tokens[index].content || '');
        return `<code class="md-inline-code">${escaped}</code>`;
    };

    md.renderer.rules.mark_open = () => '<mark class="md-mark">';
    md.renderer.rules.mark_close = () => '</mark>';

    return md;
};

const markdownRenderer = createMarkdownRenderer();

export const markupToHtmlFull = (text) => {
    if (!text) return '';
    const rendered = markdownRenderer.render(text);
    const emptyLineParagraphPattern = new RegExp(`<p>${escapeRegExp(EMPTY_LINE_TOKEN)}<\\/p>`, 'g');
    return rendered.replace(emptyLineParagraphPattern, '<div class="md-empty-line"><br /></div>');
};
