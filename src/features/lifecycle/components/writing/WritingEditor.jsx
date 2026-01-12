import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

const WritingEditor = ({ document, onUpdate }) => {
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state with document prop
    useEffect(() => {
        if (document) {
            setTitle(document.title || '');
            if (editorRef.current && document.content !== editorRef.current.innerHTML) {
                // Convert markup to HTML for display
                editorRef.current.innerHTML = markupToHtml(document.content || '');
            }
        }
    }, [document?.id]);

    // Handle Text Selection for Floating Toolbar
    useEffect(() => {
        const handleSelection = () => {
            // Safety check
            if (typeof window === 'undefined' || typeof document === 'undefined') return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Only show if selection is within the editor
            if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
                setToolbarPosition({
                    top: rect.top - 50, // Position above selection
                    left: rect.left + rect.width / 2
                });
            } else {
                setToolbarPosition(null);
            }
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('selectionchange', handleSelection);
        }

        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('selectionchange', handleSelection);
            }
        };
    }, []);

    // Apply Color to Selection
    const applyColor = (colorId) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
        if (!colorConfig) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        const highlightColor = colorConfig.highlight || 'rgba(167, 139, 250, 0.5)';

        // Apply radial gradient background
        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';

        try {
            range.surroundContents(span);
            // collapse selection after applying
            selection.removeAllRanges();
            handleInput(); // Trigger save
        } catch (e) {
            console.warn("Could not wrap selection, likely crossing node boundaries.", e);
        }
        setToolbarPosition(null);
    };


    // Serialization Helpers (copied and adapted from RichTextInput)
    const htmlToMarkup = (element) => {
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
                    result += `#!${colorId}:${node.textContent}#`;
                } else if (node.tagName === 'DIV') {
                    const inner = htmlToMarkup(node);
                    if (result && !result.endsWith('\n')) result += '\n';
                    result += inner;
                } else {
                    result += htmlToMarkup(node);
                }
            }
        });
        return result;
    };

    const markupToHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/#!([^:]+):([^#]+)#/g, (match, colorId, content) => {
                const colorConfig = COLOR_CONFIG.find(c => c.id === colorId);
                const highlightColor = colorConfig?.highlight || 'rgba(167, 139, 250, 0.5)';
                const style = `background: radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%); padding: 0 0.15em;`;
                return `<span class="colored-text relative inline" data-color-id="${colorId}" style="${style}">${content}</span>`;
            })
            .replace(/\n/g, '<br>');
    };

    // Input Handler for Auto-Save logic
    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        const newContent = htmlToMarkup(editorRef.current);

        setIsSaving(true);
        // Debounce handled by parent or here? Let's implement simple debounce here for now
        // But for consistency with previous step, let's just optimize the onUpdate call

        // Actually, let's perform update immediately but let UI show "saving" for a bit
        // For better performance, we should debounce the actual sync call
    }, []);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!editorRef.current) return;
            const currentContentMarkup = htmlToMarkup(editorRef.current);

            if (document && (title !== (document.title || '') || currentContentMarkup !== (document.content || ''))) {
                setIsSaving(true);
                onUpdate(document.id, { title, content: currentContentMarkup });
                setTimeout(() => setIsSaving(false), 500);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, document, onUpdate]); // content dependency removed, checking ref directly

    const wordCount = editorRef.current ? (editorRef.current.innerText || '').trim().length : 0; // Simplified count

    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/10 via-transparent to-blue-50/10 pointer-events-none" />

            {/* Floating Toolbar */}
            <AnimatePresence>
                {toolbarPosition && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        className="fixed z-50 flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 -translate-x-1/2"
                    >
                        {COLOR_CONFIG.map((conf) => (
                            <button
                                key={conf.id}
                                onMouseDown={(e) => { e.preventDefault(); applyColor(conf.id); }} // onMouseDown prevents losing selection focus
                                className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${conf.dot}`}
                                title={conf.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Container */}
            <div className="flex-1 w-full max-w-4xl mx-auto p-12 overflow-hidden flex flex-col">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl md:text-5xl font-light text-gray-900 dark:text-white bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-10 tracking-tight shrink-0"
                    placeholder="未命名文档"
                />

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    className="flex-1 w-full outline-none text-gray-600 dark:text-gray-300 text-lg md:text-xl font-light leading-relaxed custom-scrollbar empty:before:content-[attr(placeholder)] empty:before:text-gray-300"
                    placeholder="开始你的创作..."
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
            </div>

            {/* Status Bar */}
            <div className="px-8 py-3 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600 font-mono flex justify-end gap-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <span>{wordCount} characters</span>
                <span className={`transition-opacity duration-300 ${isSaving ? 'opacity-100 text-pink-500' : 'opacity-0'}`}>
                    Saving...
                </span>
                {!isSaving && <span className="text-gray-300 dark:text-gray-700">Saved</span>}
            </div>
        </div>
    );
};

export default WritingEditor;
