import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { COLOR_CONFIG } from './InspirationItem';

/**
 * 富文本输入框组件 - 使用 contenteditable 实现真正的富文本编辑
 * 解决 textarea + 预览层方案的光标对齐问题
 */
const RichTextInput = forwardRef(({
    value,
    onChange,
    onKeyDown,
    placeholder,
    className,
    style,
}, ref) => {
    const editorRef = useRef(null);
    const isComposing = useRef(false);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        focus: () => editorRef.current?.focus(),
        // 获取当前选择范围
        getSelection: () => {
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
                return sel.getRangeAt(0);
            }
            return null;
        },
        // 应用颜色到选中文本
        applyColor: (colorId) => {
            const sel = window.getSelection();
            if (!sel.rangeCount || sel.isCollapsed) return false;

            const range = sel.getRangeAt(0);
            if (!editorRef.current?.contains(range.commonAncestorContainer)) return false;

            const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
            if (!colorConfig) return false;

            // 创建带颜色的 span
            const coloredSpan = document.createElement('span');
            coloredSpan.style.color = colorConfig.text || colorConfig.highlight;
            coloredSpan.dataset.colorId = colorId;
            coloredSpan.className = 'colored-text';

            // 包裹选中内容
            try {
                range.surroundContents(coloredSpan);
                sel.removeAllRanges();

                // 将光标移到颜色文字后面
                const newRange = document.createRange();
                newRange.setStartAfter(coloredSpan);
                newRange.collapse(true);
                sel.addRange(newRange);

                // 触发内容改变
                handleInput();
                return true;
            } catch (e) {
                // surroundContents 在跨节点选择时可能失败
                console.warn('Color apply failed:', e);
                return false;
            }
        },
        // 清空内容
        clear: () => {
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
                handleInput();
            }
        },
        // 获取内容元素
        getElement: () => editorRef.current,
    }));

    // 将 HTML 转换为带标记的纯文本 (用于存储)
    const htmlToMarkup = useCallback((element) => {
        if (!element) return '';

        let result = '';
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                result += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    result += '\n';
                } else if (node.classList?.contains('colored-text')) {
                    const colorId = node.dataset.colorId;
                    const innerText = htmlToMarkup(node);
                    result += `#!${colorId}:${innerText}#`;
                } else if (node.tagName === 'DIV') {
                    // DIV 通常表示新行
                    const inner = htmlToMarkup(node);
                    if (result && !result.endsWith('\n')) {
                        result += '\n';
                    }
                    result += inner;
                } else {
                    result += htmlToMarkup(node);
                }
            }
        });
        return result;
    }, []);

    // 将带标记的纯文本转换为 HTML
    const markupToHtml = useCallback((text) => {
        if (!text) return '';

        // 处理颜色标记
        let html = text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/#!([^:]+):([^#]+)#/g, (match, colorId, content) => {
                const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
                const color = colorConfig?.text || colorConfig?.highlight || '#888';
                return `<span class="colored-text" data-color-id="${colorId}" style="color: ${color}">${content}</span>`;
            })
            .replace(/\n/g, '<br>');

        return html;
    }, []);

    // 处理输入事件
    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        const markup = htmlToMarkup(editorRef.current);
        onChange?.(markup);
    }, [htmlToMarkup, onChange]);

    // 同步外部 value 到编辑器
    useEffect(() => {
        if (!editorRef.current) return;

        // 获取当前光标位置
        const sel = window.getSelection();
        const currentPosition = sel.rangeCount > 0 ? {
            node: sel.anchorNode,
            offset: sel.anchorOffset
        } : null;

        // 比较当前内容与新值
        const currentMarkup = htmlToMarkup(editorRef.current);
        if (currentMarkup !== value) {
            editorRef.current.innerHTML = markupToHtml(value || '');
        }
    }, [value, htmlToMarkup, markupToHtml]);

    // 处理粘贴 - 只粘贴纯文本
    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }, []);

    // 处理按键
    const handleKeyDownInternal = useCallback((e) => {
        onKeyDown?.(e);
    }, [onKeyDown]);

    // 处理输入法开始/结束
    const handleCompositionStart = () => { isComposing.current = true; };
    const handleCompositionEnd = () => {
        isComposing.current = false;
        handleInput();
    };

    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className={className}
            style={style}
            onInput={handleInput}
            onKeyDown={handleKeyDownInternal}
            onPaste={handlePaste}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            data-placeholder={placeholder}
            spellCheck="false"
            autoCorrect="off"
        />
    );
});

RichTextInput.displayName = 'RichTextInput';

export default RichTextInput;
