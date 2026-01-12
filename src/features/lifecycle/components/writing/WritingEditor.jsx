import React from 'react';
import { motion } from 'framer-motion';

const WritingEditor = ({ content, title }) => {
    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Background decoration - matching the "elegant" prompt */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/10 via-transparent to-blue-50/10 pointer-events-none" />

            {/* Editor Container */}
            <div className="flex-1 max-w-3xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
                <input
                    type="text"
                    defaultValue={title || '一直坚强着，让自己奋斗起来'}
                    className="w-full text-3xl md:text-4xl font-light text-gray-900 dark:text-white bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 mb-8 tracking-tight"
                    placeholder="Title"
                />

                <div
                    className="prose prose-lg dark:prose-invert max-w-none focus:outline-none text-gray-600 dark:text-gray-300 font-light leading-relaxed"
                    contentEditable
                    suppressContentEditableWarning
                    style={{ minHeight: '50vh' }}
                >
                    {/* Placeholder content approximating the image provided */}
                    <p>涌动的人潮中，遥远的天空，不断的看想</p>
                    <p>比起过去写下的言语，去未来的笔记打开</p>
                    <p>不断绊倒自己的，</p>
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-300 dark:text-gray-600 font-mono flex justify-end gap-4">
                <span>32 words</span>
                <span>2 mins read</span>
                <span>Saved</span>
            </div>
        </div>
    );
};

export default WritingEditor;
