import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import { copyImageToClipboard } from './imageClipboardUtils';

const PREVIEW_IMAGE_LIMIT = 9;

const getCopyStatusText = (copyStatus) => {
    switch (copyStatus) {
        case 'success': return '已复制图片';
        case 'text-only': return '已复制文字';
        case 'error': return '复制失败';
        default: return null;
    }
};

const getPreviewGridClassName = (count) => {
    if (count <= 1) return 'inline-grid max-w-full';
    if (count === 2) return 'grid max-w-[720px] grid-cols-2';
    if (count === 3) return 'grid max-w-[900px] grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)]';
    return 'grid max-w-[900px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
};

const getPreviewTileClassName = (count, index) => {
    const base = 'group/image relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-zoom-in transition-all duration-300 hover:ring-2 hover:ring-pink-300 dark:hover:ring-pink-600 hover:shadow-lg hover:scale-[1.015]';

    if (count <= 1) return `${base} inline-flex max-h-[360px] max-w-full`;

    if (count === 3) {
        return `${base} ${index === 0 ? 'aspect-[16/9]' : 'aspect-[3/4]'}`;
    }

    return `${base} aspect-square`;
};

const InspirationImageGallery = ({ urls = [], textContent = '' }) => {
    const safeUrls = useMemo(
        () => Array.from(new Set(urls.filter(Boolean))),
        [urls]
    );
    const [activeIndex, setActiveIndex] = useState(null);
    const [loadedUrls, setLoadedUrls] = useState(() => new Set());
    const [failedUrls, setFailedUrls] = useState(() => new Set());
    const [copyStatus, setCopyStatus] = useState(null);

    const previewUrls = safeUrls.slice(0, PREVIEW_IMAGE_LIMIT);
    const hiddenCount = Math.max(0, safeUrls.length - previewUrls.length);
    const isOpen = activeIndex !== null;
    const hasMultipleImages = safeUrls.length > 1;
    const activeUrl = isOpen ? safeUrls[activeIndex] : null;

    const close = useCallback(() => {
        setActiveIndex(null);
        setCopyStatus(null);
    }, []);

    const showPrevious = useCallback(() => {
        setActiveIndex((index) => {
            if (index === null) return index;
            return (index - 1 + safeUrls.length) % safeUrls.length;
        });
        setCopyStatus(null);
    }, [safeUrls.length]);

    const showNext = useCallback(() => {
        setActiveIndex((index) => {
            if (index === null) return index;
            return (index + 1) % safeUrls.length;
        });
        setCopyStatus(null);
    }, [safeUrls.length]);

    const handleCopyImage = useCallback(async (event) => {
        event.stopPropagation();
        if (!activeUrl) return;

        setCopyStatus(null);
        const result = await copyImageToClipboard(activeUrl, textContent);
        if (result === true || result === 'html-fallback') {
            setCopyStatus('success');
        } else if (result === 'text-only') {
            setCopyStatus('text-only');
        } else {
            setCopyStatus('error');
        }
        setTimeout(() => setCopyStatus(null), 2000);
    }, [activeUrl, textContent]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                close();
                return;
            }

            if (!hasMultipleImages) return;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPrevious();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [close, hasMultipleImages, isOpen, showNext, showPrevious]);

    if (safeUrls.length === 0) return null;

    const modal = isOpen && activeUrl ? createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            onClick={close}
        >
            <div
                className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center animate-in fade-in zoom-in-95 duration-200"
                onClick={(event) => event.stopPropagation()}
            >
                <img
                    src={activeUrl}
                    alt=""
                    className="max-h-[85vh] max-w-[90vw] select-auto rounded-lg object-contain shadow-2xl"
                    draggable="false"
                />
            </div>

            <button
                type="button"
                className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                onClick={close}
                aria-label="关闭图片预览"
            >
                <X size={22} />
            </button>

            {hasMultipleImages && (
                <>
                    <button
                        type="button"
                        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 md:left-8"
                        onClick={(event) => {
                            event.stopPropagation();
                            showPrevious();
                        }}
                        aria-label="上一张图片"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <button
                        type="button"
                        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 md:right-8"
                        onClick={(event) => {
                            event.stopPropagation();
                            showNext();
                        }}
                        aria-label="下一张图片"
                    >
                        <ChevronRight size={28} />
                    </button>
                </>
            )}

            <div
                className="absolute bottom-6 left-1/2 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white backdrop-blur-sm"
                onClick={(event) => event.stopPropagation()}
            >
                {hasMultipleImages && (
                    <span className="min-w-10 text-center text-sm font-medium tabular-nums text-white/75">
                        {activeIndex + 1}/{safeUrls.length}
                    </span>
                )}

                <button
                    type="button"
                    onClick={handleCopyImage}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-white/12"
                >
                    <Copy size={15} />
                    {textContent ? '复制图片+文字' : '复制图片'}
                </button>

                {copyStatus ? (
                    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${copyStatus === 'error'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-green-500/20 text-green-200'
                    }`}>
                        {getCopyStatusText(copyStatus)}
                    </span>
                ) : (
                    <span className="hidden whitespace-nowrap text-sm text-white/45 md:inline">
                        {hasMultipleImages ? '← / → 切换 · ESC 关闭' : 'ESC 关闭'}
                    </span>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div
                className={`mt-3 gap-2 ${getPreviewGridClassName(previewUrls.length)}`}
                onPointerDown={(event) => event.stopPropagation()}
            >
                {previewUrls.map((url, index) => {
                    const isLoaded = loadedUrls.has(url);
                    const isFailed = failedUrls.has(url);
                    const isOverflowTile = hiddenCount > 0 && index === PREVIEW_IMAGE_LIMIT - 1;

                    if (isFailed) return null;

                    return (
                        <button
                            key={`${url}-${index}`}
                            type="button"
                            className={getPreviewTileClassName(previewUrls.length, index)}
                            onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                setActiveIndex(index);
                            }}
                            aria-label={`打开第 ${index + 1} 张图片`}
                        >
                            <img
                                src={url}
                                alt=""
                                className={`rounded-lg transition-opacity duration-300 ${previewUrls.length === 1 ? 'max-h-[360px] max-w-full object-contain' : 'h-full w-full object-cover'} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => {
                                    setLoadedUrls((current) => new Set(current).add(url));
                                }}
                                onError={() => {
                                    setFailedUrls((current) => new Set(current).add(url));
                                }}
                                loading="lazy"
                                draggable="false"
                            />

                            {!isLoaded && (
                                <span className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            )}

                            {isOverflowTile && (
                                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/55 text-xl font-semibold text-white">
                                    +{hiddenCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {modal}
        </>
    );
};

export { PREVIEW_IMAGE_LIMIT };
export default memo(InspirationImageGallery);
