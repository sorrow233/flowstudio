const STORAGE_KEY = 'flowstudio_writing_lab_public_v1';

const SAMPLE_DRAFT = {
    title: '写作测试：第一轮迭代',
    content: `# Flow Studio 写作测试

这是一个独立的写作测试页，你可以先快速验证交互体验。

## 推荐测试流程

- 输入标题和正文
- 观察右侧统计和保存状态
- 检查 Markdown 预览效果
- 刷新页面确认草稿是否保留
`,
};

const elements = {
    titleInput: document.querySelector('#title-input'),
    contentInput: document.querySelector('#content-input'),
    saveNowBtn: document.querySelector('#save-now-btn'),
    fillSampleBtn: document.querySelector('#fill-sample-btn'),
    clearBtn: document.querySelector('#clear-btn'),
    saveStateDot: document.querySelector('#save-state-dot'),
    saveStateText: document.querySelector('#save-state-text'),
    lastSavedText: document.querySelector('#last-saved-text'),
    wordCount: document.querySelector('#word-count'),
    charCount: document.querySelector('#char-count'),
    paragraphCount: document.querySelector('#paragraph-count'),
    readingMinutes: document.querySelector('#reading-minutes'),
    previewTitle: document.querySelector('#preview-title'),
    previewBody: document.querySelector('#preview-body'),
};

const SAVE_STATUS = {
    idle: { text: '等待编辑', className: 'state-idle' },
    saving: { text: '自动保存中', className: 'state-saving' },
    saved: { text: '已保存', className: 'state-saved' },
    error: { text: '保存失败', className: 'state-error' },
};

let saveTimer = null;
let lastSavedAt = null;
let saveState = 'idle';

function readDraft() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { title: '', content: '' };

    try {
        const parsed = JSON.parse(raw);
        lastSavedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : null;
        return {
            title: typeof parsed.title === 'string' ? parsed.title : '',
            content: typeof parsed.content === 'string' ? parsed.content : '',
        };
    } catch {
        return { title: '', content: '' };
    }
}

function writeDraft(title, content) {
    const savedAt = Date.now();
    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            title,
            content,
            savedAt,
        }),
    );
    lastSavedAt = savedAt;
}

function formatSavedTime(timestamp) {
    if (!timestamp) return '尚未保存';
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function updateSaveView() {
    const stateView = SAVE_STATUS[saveState] || SAVE_STATUS.idle;
    elements.saveStateText.textContent = stateView.text;
    elements.saveStateDot.className = `state-dot ${stateView.className}`;
    elements.lastSavedText.textContent = `最近保存时间：${formatSavedTime(lastSavedAt)}`;
}

function calculateMetrics(content) {
    const raw = typeof content === 'string' ? content : '';
    const trimmed = raw.trim();

    if (!trimmed) {
        return {
            wordCount: 0,
            charCount: 0,
            paragraphCount: 0,
            readingMinutes: 0,
        };
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const charCount = raw.length;
    const paragraphCount = trimmed.split(/\n+/).filter((line) => line.trim().length > 0).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 240));

    return {
        wordCount,
        charCount,
        paragraphCount,
        readingMinutes,
    };
}

function renderMetrics() {
    const metrics = calculateMetrics(elements.contentInput.value);
    elements.wordCount.textContent = String(metrics.wordCount);
    elements.charCount.textContent = String(metrics.charCount);
    elements.paragraphCount.textContent = String(metrics.paragraphCount);
    elements.readingMinutes.textContent = String(metrics.readingMinutes);
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdownToHtml(markdown) {
    const escaped = escapeHtml(markdown || '');
    const lines = escaped.split('\n');
    const html = [];
    let inList = false;
    let inCodeBlock = false;

    const closeList = () => {
        if (inList) {
            html.push('</ul>');
            inList = false;
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();

        if (line.startsWith('```')) {
            closeList();
            html.push(inCodeBlock ? '</code></pre>' : '<pre><code>');
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            html.push(`${line}\n`);
            continue;
        }

        if (!line.trim()) {
            closeList();
            continue;
        }

        if (line.startsWith('- ')) {
            if (!inList) {
                html.push('<ul>');
                inList = true;
            }
            html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
            continue;
        }

        closeList();

        if (line.startsWith('### ')) {
            html.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
            continue;
        }
        if (line.startsWith('> ')) {
            html.push(`<blockquote>${renderInlineMarkdown(line.slice(2))}</blockquote>`);
            continue;
        }

        html.push(`<p>${renderInlineMarkdown(line)}</p>`);
    }

    if (inList) {
        html.push('</ul>');
    }

    if (inCodeBlock) {
        html.push('</code></pre>');
    }

    return html.join('');
}

function renderPreview() {
    const title = elements.titleInput.value.trim();
    const content = elements.contentInput.value;

    elements.previewTitle.textContent = title;
    elements.previewTitle.style.display = title ? 'block' : 'none';

    if (!content.trim()) {
        elements.previewBody.innerHTML =
            '<p class="placeholder">预览区会实时显示 Markdown 渲染结果。</p>';
        return;
    }

    elements.previewBody.innerHTML = markdownToHtml(content);
}

function saveImmediately() {
    try {
        saveState = 'saving';
        updateSaveView();
        writeDraft(elements.titleInput.value, elements.contentInput.value);
        saveState = 'saved';
    } catch {
        saveState = 'error';
    }
    updateSaveView();
}

function scheduleAutoSave() {
    saveState = 'saving';
    updateSaveView();

    if (saveTimer) {
        window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(() => {
        try {
            writeDraft(elements.titleInput.value, elements.contentInput.value);
            saveState = 'saved';
        } catch {
            saveState = 'error';
        }
        updateSaveView();
    }, 450);
}

function handleEditorInput() {
    renderMetrics();
    renderPreview();
    scheduleAutoSave();
}

function fillSample() {
    elements.titleInput.value = SAMPLE_DRAFT.title;
    elements.contentInput.value = SAMPLE_DRAFT.content;
    handleEditorInput();
}

function clearDraft() {
    const confirmed = window.confirm('确定要清空当前草稿吗？');
    if (!confirmed) return;

    elements.titleInput.value = '';
    elements.contentInput.value = '';
    window.localStorage.removeItem(STORAGE_KEY);
    lastSavedAt = null;
    saveState = 'idle';

    renderMetrics();
    renderPreview();
    updateSaveView();
}

function init() {
    const cached = readDraft();
    elements.titleInput.value = cached.title;
    elements.contentInput.value = cached.content;
    saveState = lastSavedAt ? 'saved' : 'idle';

    renderMetrics();
    renderPreview();
    updateSaveView();

    elements.titleInput.addEventListener('input', handleEditorInput);
    elements.contentInput.addEventListener('input', handleEditorInput);
    elements.saveNowBtn.addEventListener('click', saveImmediately);
    elements.fillSampleBtn.addEventListener('click', fillSample);
    elements.clearBtn.addEventListener('click', clearDraft);
}

init();
