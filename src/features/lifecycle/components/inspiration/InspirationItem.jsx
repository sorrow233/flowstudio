import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../../i18n';

// Refined Color Configuration for "Elegant and Faint" look
export const COLOR_CONFIG = [
    {
        id: 'emerald',
        dot: 'bg-emerald-400',
        glow: 'group-hover:ring-emerald-500/10 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]',
        border: 'hover:border-emerald-200 dark:hover:border-emerald-800/50'
    },
    {
        id: 'amber',
        dot: 'bg-amber-400',
        glow: 'group-hover:ring-amber-500/10 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]',
        border: 'hover:border-amber-200 dark:hover:border-amber-800/50'
    },
    {
        id: 'violet',
        dot: 'bg-violet-400',
        glow: 'group-hover:ring-violet-500/10 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]',
        border: 'hover:border-violet-200 dark:hover:border-violet-800/50'
    },
    {
        id: 'blue',
        dot: 'bg-blue-400',
        glow: 'group-hover:ring-blue-500/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]',
        border: 'hover:border-blue-200 dark:hover:border-blue-800/50'
    },
    {
        id: 'rose',
        dot: 'bg-rose-400',
        glow: 'group-hover:ring-rose-500/10 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.05)]',
        border: 'hover:border-rose-200 dark:hover:border-rose-800/50'
    },
    {
        id: 'lime',
        dot: 'bg-lime-400',
        glow: 'group-hover:ring-lime-500/10 group-hover:shadow-[0_0_20px_rgba(132,204,22,0.05)]',
        border: 'hover:border-lime-200 dark:hover:border-lime-800/50'
    },
];

export const getColorConfig = (index) => COLOR_CONFIG[index % COLOR_CONFIG.length];

// Helper for parsing rich text (moved out to be reused/static)
export const parseRichText = (text) => {
    // Guard: Handle null/undefined/empty
    if (!text) return null;

    // Split by delimiters: **...**, `...`, [ ... ]
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\])/g);

    return parts.map((part, index) => {
        // Inline Code: `...`
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="bg-blue-50/50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded text-[13px] font-mono text-blue-600 dark:text-blue-400 mx-0.5 border border-blue-100/50 dark:border-blue-800/30">
                    {part.slice(1, -1)}
                </code>
            );
        }
        // Bold: **...**
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <span key={index} className="font-bold text-gray-900 dark:text-gray-100 mx-0.5">
                    {part.slice(2, -2)}
                </span>
            );
        }
        // Tag: [...]
        if (part.startsWith('[') && part.endsWith(']')) {
            const tagName = part.slice(1, -1);
            return (
                <span
                    key={index}
                    className="inline-block px-2 py-0.5 mx-1 first:ml-0 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[11px] font-medium align-middle border border-blue-100/50 dark:border-blue-800/30 shadow-sm transform -translate-y-0.5"
                >
                    {tagName}
                </span>
            );
        }
        // Plain text
        return <span key={index}>{part}</span>;
    });
};

const InspirationItem = ({ idea, onRemove, onCopy, onUpdateColor, onToggleComplete, copiedId }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const { t } = useTranslation();

    const config = getColorConfig(idea.colorIndex || 0);
    const isCompleted = idea.completed || false;

    // Handle double click to toggle completion (persisted)
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onToggleComplete(idea.id, !isCompleted);
    };

    return (
        <div className="relative">
            {/* Swipe Background (Delete Action) */}
            <div
                className={`absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6 -z-10 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
            >
                <Trash2 className="text-white" size={20} />
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ right: 0.05, left: 0.5 }}
                onDragStart={() => setIsDragging(true)}
                onDrag={(e, info) => {
                    // 触觉反馈：滑动到删除阈值时震动
                    if (info.offset.x < -140 && info.offset.x > -160) {
                        if (navigator.vibrate) {
                            navigator.vibrate(10); // 轻微震动 10ms
                        }
                    }
                }}
                onDragEnd={(e, info) => {
                    setIsDragging(false);
                    if (info.offset.x < -150 || info.velocity.x < -800) {
                        // 删除确认时的强震动
                        if (navigator.vibrate) {
                            navigator.vibrate([20, 30, 20]); // 短-停-短 震动模式
                        }
                        onRemove(idea.id);
                    }
                }}
                onClick={() => {
                    if (!window.getSelection().toString()) {
                        onCopy(idea.content, idea.id);
                    }
                }}
                onDoubleClick={handleDoubleClick}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: 0
                }}
                transition={{ x: { type: "spring", stiffness: 500, damping: 30 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`
                    group relative bg-white dark:bg-gray-900 rounded-xl p-5 
                    border border-gray-100 dark:border-gray-800 shadow-sm 
                    transition-all duration-500 cursor-pointer active:scale-[0.99]
                    ${isDragging ? '' : `hover:shadow-md ${config.border} hover:ring-1 ring-inset ${config.glow}`}
                    ${isCompleted ? 'opacity-50' : ''}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Color Status Dot - Click to cycle colors */}
                    <div
                        className="flex-shrink-0 mt-1.5 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = typeof idea.colorIndex === 'number' ? idea.colorIndex : 0;
                            const nextIndex = (currentIndex + 1) % COLOR_CONFIG.length;
                            onUpdateColor(idea.id, nextIndex);
                        }}
                    >
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-sm transition-transform duration-200 hover:scale-125 ${isCompleted ? 'scale-75 opacity-50' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={`text-gray-700 dark:text-gray-200 text-[15px] font-normal leading-relaxed whitespace-pre-wrap font-sans transition-all duration-200 ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                            {parseRichText(idea.content)}
                        </div>
                        {/* Date/Time */}
                        <div className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                            {new Date(idea.timestamp || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                            <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                            {new Date(idea.timestamp || Date.now()).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* Copied Indicator */}
                <AnimatePresence>
                    {copiedId === idea.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-3 right-3 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm border border-emerald-100 dark:border-emerald-800"
                        >
                            <Check size={12} strokeWidth={3} />
                            <span>{t('common.copied')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default InspirationItem;
