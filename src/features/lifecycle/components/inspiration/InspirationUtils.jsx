import React from 'react';
import { createPortal } from 'react-dom';
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

// 图片 URL 正则匹配
const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/gi;
const R2_IMAGE_REGEX = /(https:\/\/pub-[a-z0-9]+\.r2\.dev\/[^\s]+)/gi;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// Helper for parsing rich text (with image support)
export const parseRichText = (text) => {
    if (!text) return null;

    // 合并两种正则的匹配结果并去重
    const matches1 = text.match(IMAGE_URL_REGEX) || [];
    const matches2 = text.match(R2_IMAGE_REGEX) || [];
    const imageMatches = [...new Set([...matches1, ...matches2])];

    // 移除图片 URL 后的文本
    let textWithoutImages = text;
    imageMatches.forEach(url => {
        textWithoutImages = textWithoutImages.replace(url, '');
    });
    textWithoutImages = textWithoutImages.trim();

    const parts = textWithoutImages.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]|#![^:]+:[^#]+#)/g);

    const renderTextWithLinks = (part, index) => {
        const segments = part.split(URL_REGEX);

        return segments.map((segment, segIdx) => {
            if (!segment) return null;

            if (/^https?:\/\/\S+$/i.test(segment)) {
                const matched = segment.match(/^(https?:\/\/\S*?)([)。，；;!?]+)?$/i);
                const link = matched?.[1] || segment;
                const trailing = matched?.[2] || '';

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
        return <span key={index}>{renderTextWithLinks(part, index)}</span>;
    });

    // 如果有图片，添加图片元素
    if (imageMatches.length > 0) {
        const imageElements = imageMatches.map((url, idx) => (
            <InspirationImage key={`img-${idx}`} src={url} />
        ));

        return (
            <>
                {textElements}
                {imageElements.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {imageElements}
                    </div>
                )}
            </>
        );
    }

    return textElements;
};

// 灵感图片组件（支持点击放大）
const InspirationImage = ({ src }) => {
    const [isZoomed, setIsZoomed] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // ESC 键关闭
    React.useEffect(() => {
        if (!isZoomed) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsZoomed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isZoomed]);

    if (hasError) return null;

    // Modal 内容 - 使用 Portal 渲染到 body
    const modal = isZoomed ? createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            onClick={() => setIsZoomed(false)}
        >
            {/* 图片容器 */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt=""
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    style={{ margin: 'auto' }}
                />
            </div>

            {/* 关闭按钮 */}
            <button
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                onClick={() => setIsZoomed(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            {/* 提示文字 */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                点击任意位置关闭 · ESC
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {/* 缩略图 */}
            <div
                className={`
                    relative rounded-lg overflow-hidden cursor-zoom-in
                    transition-all duration-300
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    hover:ring-2 hover:ring-pink-300 dark:hover:ring-pink-600
                    hover:shadow-lg hover:scale-[1.02]
                `}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsZoomed(true);
                }}
            >
                <img
                    src={src}
                    alt=""
                    className="max-h-48 max-w-full object-cover rounded-lg"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    loading="lazy"
                />
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg w-32 h-32" />
                )}
            </div>

            {/* Portal Modal */}
            {modal}
        </>
    );
};
