import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

// ── Inline Markdown ──────────────────────────────────────────────

/**
 * 解析行内 Markdown 语法，返回 HTML
 * 顺序：转义 HTML → 彩色文本 → 图片 → 行内代码 → 粗斜体 → 粗体 → 斜体 → 删除线
 */
export const parseInlineMarkdown = (text) => {
    if (!text) return '';

    let result = text
        // 1. 转义 HTML 实体
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 2. 彩色文本（自定义格式，优先处理防止被其他规则破坏）
    result = result.replace(/#!([^:]+):([^#]+)#/g, (_, colorId, content) => {
        const colorConfig = COLOR_CONFIG.find((c) => c.id === colorId);
        const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
        const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;
        return `<span class="colored-text relative inline" data-color-id="${colorId}" style="${style}">${content}</span>`;
    });

    // 3. 图片
    result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="md-img" />');

    // 4. 行内代码（在粗体/斜体之前处理，防止代码内容被解析）
    // 先保护行内代码块，用占位符替换
    const codeSegments = [];
    result = result.replace(/`([^`\n]+?)`/g, (_, code) => {
        const index = codeSegments.length;
        codeSegments.push(`<code class="md-inline-code">${code}</code>`);
        return `\x00CODE${index}\x00`;
    });

    // 5. 粗斜体 ***text***
    result = result.replace(/\*{3}([^\n*]+?)\*{3}/g, '<strong><em>$1</em></strong>');

    // 6. 粗体 **text**
    result = result.replace(/\*{2}([^\n*]+?)\*{2}/g, '<strong class="md-bold">$1</strong>');

    // 7. 斜体 *text*（不匹配紧跟数字/字母后的 *，避免乘法等误匹配）
    result = result.replace(/(?<!\w)\*([^\n*]+?)\*(?!\w)/g, '<em class="md-italic">$1</em>');

    // 8. 删除线 ~~text~~
    result = result.replace(/~~([^\n~]+?)~~/g, '<del class="md-del">$1</del>');

    // 还原行内代码占位符
    result = result.replace(/\x00CODE(\d+)\x00/g, (_, idx) => codeSegments[Number(idx)]);

    return result;
};

// ── Block Markdown ───────────────────────────────────────────────

/**
 * 判断是否为分割线
 */
const isHorizontalRule = (line) => /^(?:---+|\*\*\*+|___+)\s*$/.test(line.trim());

/**
 * 判断是否为标题行，返回级别和内容
 */
const parseHeading = (line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) return null;
    return { level: match[1].length, content: match[2] };
};

/**
 * 判断是否为引用行
 */
const parseBlockquote = (line) => {
    const match = line.match(/^>\s?(.*)$/);
    if (!match) return null;
    return match[1];
};

/**
 * 判断是否为无序列表项
 */
const parseUnorderedList = (line) => {
    const match = line.match(/^[-*+]\s+(.+)$/);
    if (!match) return null;
    return match[1];
};

/**
 * 判断是否为有序列表项
 */
const parseOrderedList = (line) => {
    const match = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (!match) return null;
    return { num: match[1], content: match[2] };
};

/**
 * 将自定义 markup 文本解析为 HTML（支持完整 Markdown 语法）
 * 
 * 块级元素解析顺序：代码块 → 分割线 → 标题 → 引用 → 列表 → 普通段落
 * 行内元素由 parseInlineMarkdown 处理
 */
export const markupToHtmlFull = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    const htmlParts = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // ── 空行 ──
        if (trimmed === '') {
            htmlParts.push('<br>');
            i++;
            continue;
        }

        // ── 代码块 ```lang ... ``` ──
        if (trimmed.startsWith('```')) {
            const lang = trimmed.slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            if (i < lines.length) i++; // 跳过结束的 ```

            const escaped = codeLines.join('\n')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const langAttr = lang ? ` data-lang="${lang}"` : '';
            const langLabel = lang ? `<span class="md-code-lang">${lang}</span>` : '';
            htmlParts.push(`<pre class="md-code-block"${langAttr}>${langLabel}<code>${escaped}</code></pre>`);
            continue;
        }

        // ── 分割线 ──
        if (isHorizontalRule(trimmed)) {
            htmlParts.push('<hr class="md-hr" />');
            i++;
            continue;
        }

        // ── 标题 ──
        const heading = parseHeading(trimmed);
        if (heading) {
            const tag = `h${heading.level}`;
            htmlParts.push(`<${tag} class="md-heading md-h${heading.level}">${parseInlineMarkdown(heading.content)}</${tag}>`);
            i++;
            continue;
        }

        // ── 引用块（连续行合并） ──
        const bqContent = parseBlockquote(trimmed);
        if (bqContent !== null) {
            const bqLines = [bqContent];
            i++;
            while (i < lines.length) {
                const nextBq = parseBlockquote(lines[i].trim());
                if (nextBq !== null) {
                    bqLines.push(nextBq);
                    i++;
                } else {
                    break;
                }
            }
            const inner = bqLines.map((l) => parseInlineMarkdown(l)).join('<br>');
            htmlParts.push(`<blockquote class="md-blockquote">${inner}</blockquote>`);
            continue;
        }

        // ── 无序列表（连续项合并） ──
        const ulContent = parseUnorderedList(trimmed);
        if (ulContent) {
            const items = [ulContent];
            i++;
            while (i < lines.length) {
                const nextUl = parseUnorderedList(lines[i].trim());
                if (nextUl) {
                    items.push(nextUl);
                    i++;
                } else {
                    break;
                }
            }
            const lis = items.map((item) => `<li>${parseInlineMarkdown(item)}</li>`).join('');
            htmlParts.push(`<ul class="md-ul">${lis}</ul>`);
            continue;
        }

        // ── 有序列表（连续项合并） ──
        const olContent = parseOrderedList(trimmed);
        if (olContent) {
            const items = [olContent.content];
            i++;
            while (i < lines.length) {
                const nextOl = parseOrderedList(lines[i].trim());
                if (nextOl) {
                    items.push(nextOl.content);
                    i++;
                } else {
                    break;
                }
            }
            const lis = items.map((item) => `<li>${parseInlineMarkdown(item)}</li>`).join('');
            htmlParts.push(`<ol class="md-ol">${lis}</ol>`);
            continue;
        }

        // ── 普通文本行 ──
        htmlParts.push(parseInlineMarkdown(line));
        i++;

        // 如果下一行不是空行且不是块级元素，加 <br>
        if (i < lines.length && lines[i].trim() !== '') {
            const nextTrimmed = lines[i].trim();
            const isNextBlock = nextTrimmed.startsWith('```') ||
                isHorizontalRule(nextTrimmed) ||
                parseHeading(nextTrimmed) ||
                parseBlockquote(nextTrimmed) !== null ||
                parseUnorderedList(nextTrimmed) ||
                parseOrderedList(nextTrimmed);
            if (!isNextBlock) {
                // 连续普通文本行之间不自动加 <br>，等下一次迭代处理
            }
        }
    }

    return htmlParts.join('');
};

// ── HTML → Markup (反向转换) ─────────────────────────────────────

/**
 * 从 DOM 元素提取自定义 markup（支持 Markdown 格式元素）
 */
export const htmlToMarkupFull = (element) => {
    if (!element) return '';
    let result = '';

    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent;
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName;

        // BR → 换行
        if (tag === 'BR') {
            result += '\n';
            return;
        }

        // 彩色文本
        if (node.classList?.contains('colored-text')) {
            const colorId = node.dataset.colorId;
            result += `#!${colorId}:${node.textContent}#`;
            return;
        }

        // 图片
        if (tag === 'IMG') {
            const src = node.getAttribute('src');
            const alt = node.getAttribute('alt') || '';
            if (src) result += `![${alt}](${src})`;
            return;
        }

        // 标题 H1-H6
        if (/^H[1-6]$/.test(tag)) {
            const level = Number(tag[1]);
            const inner = htmlToMarkupFull(node);
            if (result && !result.endsWith('\n')) result += '\n';
            result += `${'#'.repeat(level)} ${inner}\n`;
            return;
        }

        // 代码块 PRE > CODE
        if (tag === 'PRE') {
            const codeEl = node.querySelector('code');
            const lang = node.dataset?.lang || '';
            const code = codeEl ? codeEl.textContent : node.textContent;
            if (result && !result.endsWith('\n')) result += '\n';
            result += `\`\`\`${lang}\n${code}\n\`\`\`\n`;
            return;
        }

        // 引用块
        if (tag === 'BLOCKQUOTE') {
            const inner = htmlToMarkupFull(node);
            const lines = inner.split('\n').filter((l) => l !== '');
            if (result && !result.endsWith('\n')) result += '\n';
            result += lines.map((l) => `> ${l}`).join('\n') + '\n';
            return;
        }

        // 无序列表
        if (tag === 'UL') {
            if (result && !result.endsWith('\n')) result += '\n';
            node.querySelectorAll(':scope > li').forEach((li) => {
                result += `- ${htmlToMarkupFull(li).trim()}\n`;
            });
            return;
        }

        // 有序列表
        if (tag === 'OL') {
            if (result && !result.endsWith('\n')) result += '\n';
            let num = 1;
            node.querySelectorAll(':scope > li').forEach((li) => {
                result += `${num}. ${htmlToMarkupFull(li).trim()}\n`;
                num++;
            });
            return;
        }

        // 分割线
        if (tag === 'HR') {
            if (result && !result.endsWith('\n')) result += '\n';
            result += '---\n';
            return;
        }

        // 粗体
        if (tag === 'STRONG' || tag === 'B') {
            result += `**${htmlToMarkupFull(node)}**`;
            return;
        }

        // 斜体
        if (tag === 'EM' || tag === 'I') {
            result += `*${htmlToMarkupFull(node)}*`;
            return;
        }

        // 删除线
        if (tag === 'DEL' || tag === 'S' || tag === 'STRIKE') {
            result += `~~${htmlToMarkupFull(node)}~~`;
            return;
        }

        // 行内代码
        if (tag === 'CODE' && node.parentElement?.tagName !== 'PRE') {
            result += `\`${node.textContent}\``;
            return;
        }

        // DIV → 含换行的递归
        if (tag === 'DIV') {
            const inner = htmlToMarkupFull(node);
            if (result && !result.endsWith('\n')) result += '\n';
            result += inner;
            return;
        }

        // 其他标签递归处理
        result += htmlToMarkupFull(node);
    });

    return result;
};

// ── 辅助：Markdown 转纯文本 ──────────────────────────────────────

/**
 * 去除所有 Markdown 格式标记，仅留纯文本
 */
export const stripAllMarkdown = (text = '') =>
    text
        // 彩色文本
        .replace(/#!([^:]+):([^#]+)#/g, '$2')
        // 图片
        .replace(/!\[(.*?)\]\((.*?)\)/g, '[图片: $1]')
        // 代码块
        .replace(/```[\s\S]*?```/g, (match) => {
            const inner = match.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
            return inner;
        })
        // 行内代码
        .replace(/`([^`]+?)`/g, '$1')
        // 粗斜体
        .replace(/\*{3}([^*]+?)\*{3}/g, '$1')
        // 粗体
        .replace(/\*{2}([^*]+?)\*{2}/g, '$1')
        // 斜体
        .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '$1')
        // 删除线
        .replace(/~~([^~]+?)~~/g, '$1')
        // 标题
        .replace(/^#{1,6}\s+/gm, '')
        // 引用
        .replace(/^>\s?/gm, '')
        // 无序列表
        .replace(/^[-*+]\s+/gm, '')
        // 有序列表
        .replace(/^\d+[.)]\s+/gm, '')
        // 分割线
        .replace(/^(?:---+|\*\*\*+|___+)\s*$/gm, '')
        // HTML 标签
        .replace(/<[^>]*>?/gm, '')
        .trim();

/**
 * markup → Markdown（保留 Markdown 语法，只转换自定义格式）
 */
export const markupToMarkdownFull = (text) => {
    if (!text) return '';
    return text
        .replace(/#!([^:]+):([^#]+)#/g, (_, __, content) => `==${content}==`);
};
