import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const WritingEditor = ({ document, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state with document prop when document ID changes
    useEffect(() => {
        if (document) {
            setTitle(document.title || '');
            setContent(document.content || '');
        }
    }, [document?.id]); // Only reset when ID changes, not on every update to avoid cursor jumps

    // Debounce save function
    useEffect(() => {
        const timer = setTimeout(() => {
            if (document && (title !== (document.title || '') || content !== (document.content || ''))) {
                setIsSaving(true);
                onUpdate(document.id, { title, content });
                setTimeout(() => setIsSaving(false), 500);
            }
        }, 1000); // Auto-save after 1 second of inactivity

        return () => clearTimeout(timer);
    }, [title, content, document, onUpdate]);

    const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
    // Simple character count for CJK
    const charCount = content.replace(/\s/g, '').length;

    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/10 via-transparent to-blue-50/10 pointer-events-none" />

            {/* Editor Container */}
            <div className="flex-1 max-w-3xl mx-auto w-full p-8 md:p-12 overflow-hidden flex flex-col">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-3xl md:text-4xl font-light text-gray-900 dark:text-white bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-8 tracking-tight shrink-0"
                    placeholder="未命名文档"
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 resize-none bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 text-lg font-light leading-relaxed custom-scrollbar placeholder-gray-200 dark:placeholder-gray-800"
                    placeholder="开始你的创作..."
                    spellCheck="false"
                />
            </div>

            {/* Status Bar */}
            <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600 font-mono flex justify-end gap-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <span>{charCount} 字符</span>
                <span>{wordCount} 词</span>
                <span className={`transition-opacity duration-300 ${isSaving ? 'opacity-100 text-pink-500' : 'opacity-0'}`}>
                    保存中...
                </span>
                {!isSaving && <span className="text-gray-300 dark:text-gray-700">已保存</span>}
            </div>
        </div>
    );
};

export default WritingEditor;
