import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

const WritingEditor = ({ doc: writingDoc, onUpdate, isSidebarOpen, onToggleSidebar }) => {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state with document prop
    useEffect(() => {
        if (writingDoc) {
            setTitle(writingDoc.title || '');
            if (editorRef.current && writingDoc.content !== editorRef.current.innerHTML) {
                // Convert markup to HTML for display
                editorRef.current.innerHTML = markupToHtml(writingDoc.content || '');
            }
        }
    }, [writingDoc?.id]);

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

        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('selectionchange', handleSelection);
        }

        return () => {
            if (typeof document !== 'undefined' && document.removeEventListener) {
                document.removeEventListener('selectionchange', handleSelection);
            }
        };
    }, []);

    // Apply Color to Selection
    const applyColor = (colorId) => {
        if (typeof window === 'undefined' || !window.getSelection) return;

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
        // The save logic is handled by the useEffect watching title and writingDoc
        // But we can trigger a re-render to update word count if needed, 
        // though setTitle already does that. For innerHTML changes, we might need a dummy state.
        setIsSaving(true);
    }, []);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!editorRef.current) return;
            const currentContentMarkup = htmlToMarkup(editorRef.current);

            if (writingDoc && (title !== (writingDoc.title || '') || currentContentMarkup !== (writingDoc.content || ''))) {
                setIsSaving(true);
                onUpdate(writingDoc.id, { title, content: currentContentMarkup });
                setTimeout(() => setIsSaving(false), 500);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, writingDoc, onUpdate]); // content dependency removed, checking ref directly

    const wordCount = editorRef.current ? (editorRef.current.innerText || '').trim().length : 0; // Simplified count

    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Sidebar Toggle Button - Top Left (Floating) */}
            <div className="absolute top-6 left-6 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleSidebar}
                    className="p-2.5 text-gray-400 hover:text-sky-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm"
                    title={t('inspiration.toggleSidebar')}
                >
                    {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </motion.button>
            </div>

            {/* Floating Toolbar (Selection Based) */}
            <AnimatePresence>
                {toolbarPosition && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        className="fixed z-50 flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 -translate-x-1/2"
                    >
                        {COLOR_CONFIG.map((conf) => (
                            <button
                                key={conf.id}
                                onMouseDown={(e) => { e.preventDefault(); applyColor(conf.id); }}
                                className={`w-5 h-5 rounded-full transition-transform hover:scale-125 hover:rotate-12 ${conf.dot} shadow-sm`}
                                title={conf.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Container - Focused Area */}
            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center" onClick={(e) => {
                // Clicking empty space focuses editor if not clicking title
                if (e.target.tagName !== 'INPUT' && e.target !== editorRef.current) {
                    editorRef.current?.focus();
                }
            }}>
                <div className="w-full max-w-[65ch] px-6 py-16 md:py-24 animate-in fade-in zoom-in-95 duration-500">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                editorRef.current?.focus();
                            }
                        }}
                        className="w-full text-4xl md:text-5xl font-bold text-gray-900 dark:text-white bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-8 tracking-tight shrink-0 leading-tight"
                        placeholder={t('inspiration.untitled')}
                    />

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        className="w-full outline-none text-gray-700 dark:text-gray-300 text-lg md:text-xl font-serif leading-[1.8] min-h-[50vh] empty:before:content-[attr(placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 focus:before:content-none selection:bg-sky-100 dark:selection:bg-sky-900/40"
                        placeholder={t('inspiration.placeholder')}
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    />

                    {/* End of content indicator */}
                    <div className="mt-32 flex flex-col items-center opacity-10">
                        <div className="w-8 h-[1px] bg-sky-500 mb-1" />
                        <div className="w-4 h-[1px] bg-sky-500" />
                    </div>
                    <div className="h-64" />
                </div>
            </div>

            {/* Status Bar - Clean & Informative */}
            <div className="px-6 py-3 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex justify-between items-center bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute bottom-0 w-full z-10">
                <div className="flex gap-4">
                    <span className="tabular-nums">{wordCount} words</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isSaving ? 'bg-amber-400' : 'bg-green-500/50'}`} />
                    <span className="uppercase text-[10px] tracking-wider opacity-80">
                        {isSaving ? 'Saving' : 'Saved'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WritingEditor;
