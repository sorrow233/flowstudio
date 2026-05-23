import React from 'react';
import { INSPIRATION_CATEGORIES } from '../../../../utils/constants';
import { buildCodeBlockTheme, trimCodeBlockFenceContent } from './codeBlockTheme';
import InspirationImageGallery from './InspirationImageGallery';

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
export const getCategoryConfig = (category, categories = INSPIRATION_CATEGORIES) => {
    const source = Array.isArray(categories) && categories.length > 0
        ? categories
        : INSPIRATION_CATEGORIES;

    const cat = source.find(c => c.id === category);
    if (cat) return cat;

    const fallbackNote = source.find(c => c.id === 'note');
    return fallbackNote || source[0] || INSPIRATION_CATEGORIES[0];
};

// 图片 URL 正则匹配（导出供外部使用）
export const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/gi;
export const R2_IMAGE_REGEX = /(https:\/\/pub-[a-z0-9]+\.r2\.dev\/[^\s]+)/gi;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

const removeAllOccurrences = (text, value) => String(text || '').split(value).join('');

const resolveWritingDocTitle = (source, docId) => {
    if (!docId) return null;

    if (source instanceof Map) {
        return source.get(docId) || null;
    }

    if (Array.isArray(source)) {
        const foundProject = source.find(p => p.id === docId);
        return foundProject?.title || null;
    }

    return null;
};

// Helper for parsing rich text (with image support)
export const parseRichText = (text, writingDocTitleSource = [], clipboardText = '', options = {}) => {
    if (!text) return null;
    const codeBlockTheme = buildCodeBlockTheme(options.accentHex);

    // 合并两种正则的匹配结果并去重
    const matches1 = text.match(IMAGE_URL_REGEX) || [];
    const matches2 = text.match(R2_IMAGE_REGEX) || [];
    const imageMatches = [...new Set([...matches1, ...matches2])];

    // 移除图片 URL 后的文本
    let textWithoutImages = text;
    imageMatches.forEach(url => {
        textWithoutImages = removeAllOccurrences(textWithoutImages, url);
    });
    textWithoutImages = textWithoutImages.trim();

    const parts = textWithoutImages.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]|#![^:]+:[^#]+#)/g);

    const renderTextWithLinks = (part, index) => {
        const segments = part.split(URL_REGEX);

        return segments.map((segment, segIdx) => {
            if (!segment) return null;

            if (/^https?:\/\/\S+$/i.test(segment)) {
                const matched = segment.match(/^(https?:\/\/\S*?)([)。，；;!?]+)?$/i);
                const link = matched?.[1] || segment;
                const trailing = matched?.[2] || '';

                // Check if it's an internal writing link
                const isWritingLink = link.includes('/writing/c/') || link.includes('/writing/trash');

                if (isWritingLink) {
                    let docTitle = '写作文档';
                    try {
                        // Extract the docId from the URL structure /writing/c/:category/:docId
                        const parts = link.split('/writing/c/');
                        if (parts.length > 1) {
                            const pathSegments = parts[1].split('/');
                            if (pathSegments.length >= 2) {
                                const docId = pathSegments[1].split('?')[0].split('#')[0]; // clean trailing
                                const resolvedTitle = resolveWritingDocTitle(writingDocTitleSource, docId);
                                if (resolvedTitle) {
                                    docTitle = `写作文档: ${resolvedTitle}`;
                                }
                            }
                        }
                    } catch (err) {
                        console.warn('Failed to parse writing writing link for title lookup', err);
                    }

                    return (
                        <React.Fragment key={`${index}-link-frag-${segIdx}`}>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-[13px] font-medium border border-blue-200/60 dark:border-blue-700/50 hover:bg-blue-100 dark:hover:bg-blue-800/40 hover:shadow-sm transition-all"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                title={link}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                                <span>{docTitle}</span>
                            </a>
                            {trailing ? <span>{trailing}</span> : null}
                        </React.Fragment>
                    );
                }

                return (
                    <React.Fragment key={`${index}-link-frag-${segIdx}`}>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 dark:text-pink-300 underline decoration-pink-300/70 dark:decoration-pink-700/70 hover:text-pink-600 dark:hover:text-pink-200 break-all"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {link}
                        </a>
                        {trailing ? <span>{trailing}</span> : null}
                    </React.Fragment>
                );
            }

            return <span key={`${index}-text-${segIdx}`}>{segment}</span>;
        });
    };

    const textElements = parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const content = trimCodeBlockFenceContent(part);
            return (
                <div key={index} className="my-3 text-[14px] font-medium leading-[2] whitespace-pre-wrap">
                    <span
                        className="box-decoration-clone rounded-[0.95rem] border px-3 py-1.5 font-mono"
                        style={codeBlockTheme.renderedBlockStyle}
                    >
                        {content}
                    </span>
                </div>
            );
        }

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
                <strong key={index} className="rich-inline-bold mx-0.5">
                    {part.slice(2, -2)}
                </strong>
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
        return <span key={index}>{renderTextWithLinks(part, index)}</span>;
    });

    // 如果有图片，添加图片元素
    if (imageMatches.length > 0) {
        return (
            <>
                {textElements}
                <InspirationImageGallery
                    urls={imageMatches}
                    textContent={clipboardText || textWithoutImages}
                />
            </>
        );
    }

    return textElements;
};
