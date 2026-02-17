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
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 2. 彩色文本（自定义格式，优先处理防止被其他规则破坏）
    result = result.replace(/#!([^:]+):([^#]+)#/g, (_, colorId, content) => {
        const colorConfig = COLOR_CONFIG.find((c) => c.id === colorId);
        const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
        const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;
        return `<span class="colored-text relative inline-block rounded-md px-1 align-baseline break-inside-avoid" data-color-id="${colorId}" style="${style}">${content}</span>`;
    });

    // 3. 图片
    result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="md-img inline-block max-w-full h-auto rounded-lg my-2 shadow-sm hover:shadow-md transition-shadow" />');

    // 4. 行内代码（在粗体/斜体之前处理，防止代码内容被解析）
    // 先保护行内代码块，用占位符替换
    const codeSegments = [];
    result = result.replace(/`([^`\n]+?)`/g, (_, code) => {
        const index = codeSegments.length;
        codeSegments.push(`<code class="md-inline-code bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-slate-200/50 dark:bg-slate-800 dark:text-pink-400 dark:border-slate-700 mx-0.5 break-all">${code}</code>`);
        return `\x00CODE${index}\x00`;
    });

    // 5. 粗斜体 ***text***
    result = result.replace(/\*{3}([^\n*]+?)\*{3}/g, '<strong class="md-bold-italic font-bold italic text-slate-900 dark:text-slate-100">$1</strong>');

    // 6. 粗体 **text**
    result = result.replace(/\*{2}([^\n*]+?)\*{2}/g, '<strong class="md-bold font-bold text-slate-900 dark:text-slate-100">$1</strong>');

    // 7. 斜体 *text*（不匹配紧跟数字/字母后的 *，避免乘法等误匹配）
    result = result.replace(/(?<!\w)\*([^\n*]+?)\*(?!\w)/g, '<em class="md-italic italic text-slate-800 dark:text-slate-200">$1</em>');

    // 8. 删除线 ~~text~~
    result = result.replace(/~~([^\n~]+?)~~/g, '<del class="md-del decoration-slate-400 decoration-2 opacity-70">$1</del>');

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
            htmlParts.push('<div class="h-6"><br></div>'); // 使用带高度的 div 避免折叠
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

            const langLabel = lang ? `<div class="absolute right-3 top-2 text-xs text-slate-400 font-mono select-none pointer-events-none opacity-60">${lang.toUpperCase()}</div>` : '';

            htmlParts.push(`
                <pre class="md-code-block relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 my-4 overflow-x-auto group font-mono text-sm leading-relaxed shadow-sm">
                    ${langLabel}
                    <code class="block min-w-full">${escaped}</code>
                </pre>
            `);
            continue;
        }

        // ── 分割线 ──
        if (isHorizontalRule(trimmed)) {
            htmlParts.push('<hr class="md-hr my-8 border-t-2 border-slate-100 dark:border-slate-800" />');
            i++;
            continue;
        }

        // ── 标题 ──
        const heading = parseHeading(trimmed);
        if (heading) {
            const tag = `h${heading.level}`;
            const sizeClasses = {
                1: 'text-4xl font-bold mt-10 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50 tracking-tight text-slate-900 dark:text-slate-50',
                2: 'text-3xl font-bold mt-10 mb-5 tracking-tight text-slate-800 dark:text-slate-100',
                3: 'text-2xl font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-100',
                4: 'text-xl font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-200',
                5: 'text-lg font-semibold mt-6 mb-2 text-slate-700 dark:text-slate-300',
                6: 'text-base font-semibold mt-6 mb-2 uppercase tracking-wide text-slate-500 dark:text-slate-400',
            }[heading.level];

            htmlParts.push(`<${tag} class="md-heading md-h${heading.level} ${sizeClasses} break-words leading-tight">${parseInlineMarkdown(heading.content)}</${tag}>`);
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
            htmlParts.push(`
                <blockquote class="md-blockquote my-6 border-l-4 border-sky-400 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-900/10 pl-5 pr-4 py-3 rounded-r-lg text-slate-600 dark:text-slate-300 italic leading-relaxed quote-icon">
                    ${inner}
                </blockquote>
            `);
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
            const lis = items.map((item) => `<li class="relative pl-2 mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300"><span class="absolute left-[-1.25em] top-[0.6em] w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full flex-shrink-0 mt-2"></span>${parseInlineMarkdown(item)}</li>`).join('');
            htmlParts.push(`<ul class="md-ul list-none pl-6 my-4 space-y-1">${lis}</ul>`);
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
            let startNum = parseInt(olContent.num, 10);
            const lis = items.map((item, idx) => `<li class="relative pl-2 mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300"><span class="absolute left-[-1.5em] text-slate-400 dark:text-slate-500 font-medium tabular-nums select-none text-right w-[1.2em] inline-block mr-2">${startNum + idx}.</span>${parseInlineMarkdown(item)}</li>`).join('');
            htmlParts.push(`<ol class="md-ol list-none pl-8 my-4 space-y-1" start="${startNum}">${lis}</ol>`);
            continue;
        }

        // ── 普通文本行 ──
        // 关键逻辑：普通文本行也包裹在 DIV 中，以确保换行符正确
        // 并且如果文本行为空，需插入 BR 撑开
        const parsedLine = parseInlineMarkdown(line);
        htmlParts.push(`<div class="md-paragraph min-h-[1.5em] break-words">${parsedLine || '<br>'}</div>`);
        i++;
    }

    return htmlParts.join('');
};

// ── HTML → Markup (反向转换) ─────────────────────────────────────

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'SVG', 'META', 'LINK']);

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
        if (SKIP_TAGS.has(tag)) return;

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
            // 忽略 base64 图片，防止存入过大内容导致同步失败，仅允许 HTTP/HTTPS 或相对路径
            // 但如果用户粘贴的是 base64，也许应该先上传？这里暂且只转换
            if (src) result += `![${alt}](${src})`;
            return;
        }

        // 标题 H1-H6
        if (/^H[1-6]$/.test(tag)) {
            const level = Number(tag[1]);
            const inner = htmlToMarkupFull(node);
            if (result && !result.endsWith('\n')) result += '\n';
            // 确保标题前有两行换行（如果在中间），或至少一行
            if (result && !result.endsWith('\n\n')) result += '\n';
            result += `${'#'.repeat(level)} ${inner}\n`;
            return;
        }

        // 代码块 PRE > CODE (或直接 PRE)
        if (tag === 'PRE') {
            const codeEl = node.querySelector('code');
            const lang = node.dataset?.lang || '';
            // 优先取 code 元素内容，如果没有则取 pre 内容
            const code = codeEl ? codeEl.textContent : node.textContent;
            if (result && !result.endsWith('\n')) result += '\n';
            // 确保代码块前后有换行
            if (result && !result.endsWith('\n\n')) result += '\n';
            result += `\`\`\`${lang}\n${code}\n\`\`\`\n`;
            return;
        }

        // 引用块
        if (tag === 'BLOCKQUOTE') {
            const inner = htmlToMarkupFull(node);
            const lines = inner.split('\n').filter((l) => l.trim() !== ''); // 过滤空行，避免引用块断裂
            if (result && !result.endsWith('\n')) result += '\n';
            if (result && !result.endsWith('\n\n')) result += '\n';
            result += lines.map((l) => `> ${l}`).join('\n') + '\n';
            return;
        }

        // 无序列表
        if (tag === 'UL') {
            if (result && !result.endsWith('\n')) result += '\n';
            node.querySelectorAll(':scope > li').forEach((li) => {
                const liContent = htmlToMarkupFull(li).trim();
                if (liContent) result += `- ${liContent}\n`;
            });
            return;
        }

        // 有序列表
        if (tag === 'OL') {
            if (result && !result.endsWith('\n')) result += '\n';
            let num = 1;
            const start = parseInt(node.getAttribute('start') || '1', 10);
            if (!isNaN(start)) num = start;

            node.querySelectorAll(':scope > li').forEach((li) => {
                const liContent = htmlToMarkupFull(li).trim();
                if (liContent) {
                    result += `${num}. ${liContent}\n`;
                    num++;
                }
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

        // DIV和P都作为新一行处理
        if (tag === 'DIV' || tag === 'P') {
            const inner = htmlToMarkupFull(node);
            // 某些时候 div 只是包裹行内元素，不一定代表换行，但在编辑器上下文中通常代表块
            if (result && !result.endsWith('\n')) result += '\n';
            result += inner;
            // 块结束后加换行
            // if (!result.endsWith('\n')) result += '\n'; 
            // 实际上编辑器里的 div 只是分开行，不需要额外的空行，不然会变成双倍行距
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
