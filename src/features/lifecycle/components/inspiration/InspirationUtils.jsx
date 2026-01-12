import React from 'react';
import { INSPIRATION_CATEGORIES } from '../../../../utils/constants';

// Refined Color Configuration for "Crayon Highlighter" look
export const COLOR_CONFIG = [
    {
        id: 'pale-pink',
        dot: 'bg-[#F9DFDF]',
        highlight: 'rgba(249, 223, 223, 0.4)',
        glow: 'group-hover:ring-[#F9DFDF]/30 group-hover:shadow-[0_0_20px_rgba(249,223,223,0.3)]',
        border: 'hover:border-[#F9DFDF] dark:hover:border-[#F9DFDF]/50'
    },
    {
        id: 'light-red',
        dot: 'bg-[#FFA4A4]',
        highlight: 'rgba(255, 164, 164, 0.4)',
        glow: 'group-hover:ring-[#FFA4A4]/30 group-hover:shadow-[0_0_20px_rgba(255,164,164,0.3)]',
        border: 'hover:border-[#FFA4A4] dark:hover:border-[#FFA4A4]/50'
    },
    {
        id: 'salmon',
        dot: 'bg-[#FF8F8F]',
        highlight: 'rgba(255, 143, 143, 0.4)',
        glow: 'group-hover:ring-[#FF8F8F]/30 group-hover:shadow-[0_0_20px_rgba(255,143,143,0.3)]',
        border: 'hover:border-[#FF8F8F] dark:hover:border-[#FF8F8F]/50'
    },
    {
        id: 'violet',
        dot: 'bg-violet-400',
        highlight: 'rgba(167, 139, 250, 0.35)',
        glow: 'group-hover:ring-violet-400/30 group-hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]',
        border: 'hover:border-violet-300 dark:hover:border-violet-700/50'
    },
    {
        id: 'pale-green',
        dot: 'bg-[#D9E9CF]',
        highlight: 'rgba(217, 233, 207, 0.4)',
        glow: 'group-hover:ring-[#D9E9CF]/30 group-hover:shadow-[0_0_20px_rgba(217,233,207,0.3)]',
        border: 'hover:border-[#D9E9CF] dark:hover:border-[#D9E9CF]/50'
    },
    {
        id: 'sky-blue',
        dot: 'bg-[#A5D8FF]',
        highlight: 'rgba(165, 216, 255, 0.4)',
        glow: 'group-hover:ring-[#A5D8FF]/30 group-hover:shadow-[0_0_20px_rgba(165,216,255,0.3)]',
        border: 'hover:border-[#A5D8FF] dark:hover:border-[#A5D8FF]/50'
    },
];

export const getColorConfig = (index) => COLOR_CONFIG[index % COLOR_CONFIG.length];

// 根据分类获取颜色配置
export const getCategoryConfig = (category) => {
    const cat = INSPIRATION_CATEGORIES.find(c => c.id === category);
    return cat || INSPIRATION_CATEGORIES[0]; // 默认返回「随记」
};

// Helper for parsing rich text
export const parseRichText = (text) => {
    if (!text) return null;

    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]|#![^:]+:[^#]+#)/g);

    return parts.map((part, index) => {
        if (part.startsWith('#!') && part.endsWith('#')) {
            const match = part.match(/#!([^:]+):([^#]+)#/);
            if (match) {
                const [, colorId, content] = match;
                const colorConfig = COLOR_CONFIG.find(c => c.id === colorId) || COLOR_CONFIG[0];
                const highlightColor = colorConfig.highlight || 'rgba(167, 139, 250, 0.5)';
                return (
                    <span
                        key={index}
                        className="relative inline text-gray-800 dark:text-gray-100"
                        style={{
                            background: `radial-gradient(ellipse 100% 40% at center 80%, ${highlightColor} 0%, ${highlightColor} 70%, transparent 100%)`,
                            padding: '0 0.15em',
                        }}
                    >
                        {content}
                    </span>
                );
            }
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="bg-pink-50/50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded text-[13px] font-mono text-pink-600 dark:text-pink-400 mx-0.5 border border-pink-100/50 dark:border-pink-800/30">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <span key={index} className="font-bold text-gray-900 dark:text-gray-100 mx-0.5">
                    {part.slice(2, -2)}
                </span>
            );
        }
        if (part.startsWith('[') && part.endsWith(']')) {
            const tagName = part.slice(1, -1);
            return (
                <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 mx-1 first:ml-0 bg-pink-100/50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 rounded-[6px] text-[0.9em] font-normal align-baseline border border-pink-200/50 dark:border-pink-500/30 shadow-[0_1px_2px_rgba(244,114,182,0.1)] select-none transform translate-y-[-1px]"
                >
                    <span className="opacity-50 mr-0.5">#</span>
                    {tagName}
                </span>
            );
        }
        return <span key={index}>{part}</span>;
    });
};
