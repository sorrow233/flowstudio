import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { COLOR_CONFIG } from '../inspiration/InspirationUtils';

const WritingEditor = ({ doc: writingDoc, onUpdate, isSidebarOpen, onToggleSidebar, isMobile }) => {
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
                editorRef.current.innerHTML = markupToHtml(writingDoc.content || '');
            }
        }
    }, [writingDoc?.id]);

    // Handle Text Selection for Floating Toolbar
    useEffect(() => {
        const handleSelection = () => {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
                // Adjust for mobile to prevent keyboard overlap or obscured view
                const offset = isMobile ? 80 : 60;
                setToolbarPosition({
                    top: rect.top - offset,
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
    }, [isMobile]);

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

        span.style.background = `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`;
        span.style.padding = '0 0.15em';
        span.dataset.colorId = colorId;
        span.className = 'colored-text relative inline';

        try {
            range.surroundContents(span);
            selection.removeAllRanges();
            handleInput();
        } catch (e) {
            console.warn("Could not wrap selection, likely crossing node boundaries.", e);
        }
        setToolbarPosition(null);
    };


    // Serialization Helpers
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

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        setIsSaving(true);
    }, []);

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
    }, [title, writingDoc, onUpdate]);

    const wordCount = editorRef.current ? (editorRef.current.innerText || '').trim().length : 0;

    return (
        <div className="flex-1 h-full flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-md relative z-10">
            {/* Sidebar Toggle Button - Responsive positioning */}
            <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 left-6'} z-30`}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleSidebar}
                    className={`
                        p-2.5 text-gray-400 hover:text-sky-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl transition-all shadow-sm hover:shadow-md
                        ${isMobile ? 'ring-2 ring-sky-100 dark:ring-sky-900/30' : ''}
                    `}
                    title={t('inspiration.toggleSidebar')}
                >
                    {isSidebarOpen ? <PanelLeftClose size={isMobile ? 20 : 18} /> : <PanelLeftOpen size={isMobile ? 20 : 18} />}
                </motion.button>
            </div>

            {/* Floating Toolbar - Touch Optimized */}
            <AnimatePresence>
                {toolbarPosition && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        className={`fixed z-50 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 dark:border-gray-700/50 -translate-x-1/2 ${isMobile ? 'p-3 gap-3' : 'p-2'}`}
                    >
                        {COLOR_CONFIG.map((conf) => (
                            <button
                                key={conf.id}
                                onMouseDown={(e) => { e.preventDefault(); applyColor(conf.id); }}
                                className={`${isMobile ? 'w-7 h-7' : 'w-5 h-5'} rounded-full transition-all hover:scale-125 hover:rotate-12 ${conf.dot} shadow-sm border border-white/20 dark:border-transparent`}
                                title={conf.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Container - Focused Area */}
            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center" onClick={(e) => {
                if (e.target.tagName !== 'INPUT' && e.target !== editorRef.current) {
                    editorRef.current?.focus();
                }
            }}>
                <div className={`w-full max-w-[65ch] ${isMobile ? 'px-6 py-12' : 'px-8 py-24'} animate-in fade-in zoom-in-95 duration-700 ease-out`}>
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
                        className={`
                            w-full font-bold bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-8 tracking-tight shrink-0 leading-tight transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 focus:drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]
                            ${isMobile ? 'text-3xl' : 'text-5xl'}
                        `}
                        placeholder={t('inspiration.untitled')}
                    />

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        className={`
                            w-full outline-none text-gray-700 dark:text-gray-200 font-serif leading-[1.8] min-h-[50vh] empty:before:content-[attr(placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 focus:before:content-none selection:bg-sky-100/50 dark:selection:bg-sky-500/30 transition-all duration-300
                            ${isMobile ? 'text-lg' : 'text-xl'}
                        `}
                        placeholder={t('inspiration.placeholder')}
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', outline: 'none' }}
                    />

                    {/* End of content indicator */}
                    <div className="mt-32 flex flex-col items-center opacity-20">
                        <div className="w-2 h-2 rounded-full bg-sky-400 mb-4" />
                        <div className="w-1 h-1 rounded-full bg-sky-300" />
                    </div>
                </div>
            </div>

            {/* Status Bar - Responsive Padding */}
            <div className={`px-6 py-3 text-[11px] text-gray-400/80 dark:text-gray-500/80 font-medium flex justify-between items-center bg-white/0 absolute bottom-0 w-full z-10 pointer-events-none ${isMobile ? 'px-4 mb-2' : 'px-6'}`}>
                <div className="flex gap-4">
                    <span className="tabular-nums font-mono opacity-50 hover:opacity-100 transition-opacity cursor-default pointer-events-auto">{wordCount} words</span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-green-500/40'}`} />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={isSaving ? 'saving' : 'saved'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="uppercase text-[9px] tracking-widest opacity-60"
                        >
                            {isSaving ? 'Syncing...' : 'Synced'}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
            {/* Safe Area Spacer for iOS bottom bar */}
            {isMobile && <div className="h-safe-bottom" />}
        </div>
    );
};

export default WritingEditor;
