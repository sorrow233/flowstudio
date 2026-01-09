import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../../i18n';

// Refined Color Configuration for "Elegant and Faint" look
export const COLOR_CONFIG = [
    {
        id: 'pale-pink',
        dot: 'bg-[#F9DFDF]',
        glow: 'group-hover:ring-[#F9DFDF]/30 group-hover:shadow-[0_0_20px_rgba(249,223,223,0.3)]',
        border: 'hover:border-[#F9DFDF] dark:hover:border-[#F9DFDF]/50'
    },
    {
        id: 'light-red',
        dot: 'bg-[#FFA4A4]',
        glow: 'group-hover:ring-[#FFA4A4]/30 group-hover:shadow-[0_0_20px_rgba(255,164,164,0.3)]',
        border: 'hover:border-[#FFA4A4] dark:hover:border-[#FFA4A4]/50'
    },
    {
        id: 'salmon',
        dot: 'bg-[#FF8F8F]',
        glow: 'group-hover:ring-[#FF8F8F]/30 group-hover:shadow-[0_0_20px_rgba(255,143,143,0.3)]',
        border: 'hover:border-[#FF8F8F] dark:hover:border-[#FF8F8F]/50'
    },
    {
        id: 'pale-white',
        dot: 'bg-[#FBEFEF]',
        glow: 'group-hover:ring-[#FBEFEF]/30 group-hover:shadow-[0_0_20px_rgba(251,239,239,0.3)]',
        border: 'hover:border-[#FBEFEF] dark:hover:border-[#FBEFEF]/50'
    },
    {
        id: 'violet',
        dot: 'bg-violet-400',
        glow: 'group-hover:ring-violet-400/30 group-hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]',
        border: 'hover:border-violet-300 dark:hover:border-violet-700/50'
    },
    {
        id: 'pale-green',
        dot: 'bg-[#D9E9CF]',
        glow: 'group-hover:ring-[#D9E9CF]/30 group-hover:shadow-[0_0_20px_rgba(217,233,207,0.3)]',
        border: 'hover:border-[#D9E9CF] dark:hover:border-[#D9E9CF]/50'
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
                <code key={index} className="bg-pink-50/50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded text-[13px] font-mono text-pink-600 dark:text-pink-400 mx-0.5 border border-pink-100/50 dark:border-pink-800/30">
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
            return (
                <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 mx-1 first:ml-0 bg-pink-100/50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 rounded-[6px] text-[0.9em] font-normal align-baseline border border-pink-200/50 dark:border-pink-500/30 shadow-[0_1px_2px_rgba(244,114,182,0.1)] select-none transform translate-y-[-1px]"
                >
                    <span className="opacity-50 mr-0.5">#</span>
                    {tagName}
                </span>
            );
            );
}
// Plain text
return <span key={index}>{part}</span>;
    });
};

const InspirationItem = ({ idea, onRemove, onCopy, onUpdateColor, onUpdateNote, onToggleComplete, copiedId }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [isEditingNote, setIsEditingNote] = React.useState(false);
    const [noteDraft, setNoteDraft] = React.useState(idea.note || '');
    const inputRef = React.useRef(null);
    const { t } = useTranslation();

    const config = getColorConfig(idea.colorIndex || 0);
    const isCompleted = idea.completed || false;

    // Handle double click to toggle completion (persisted)
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onToggleComplete(idea.id, !isCompleted);
    };

    const handleDotClick = (e) => {
        e.stopPropagation();
        setIsEditingNote(true);
    };

    const handleNoteSave = () => {
        if (noteDraft.trim() !== (idea.note || '')) {
            onUpdateNote(idea.id, noteDraft.trim());
        }
        setIsEditingNote(false);
    };

    const handleNoteKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNoteSave();
        }
        if (e.key === 'Escape') {
            setIsEditingNote(false);
            setNoteDraft(idea.note || '');
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ right: 0.05, left: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
                setIsDragging(false);
                if (info.offset.x < -150 || info.velocity.x < -800) {
                    onRemove(idea.id);
                }
            }}
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
            className="relative group flex flex-col md:flex-row items-stretch md:items-start gap-2 md:gap-4 mb-4"
        >
            {/* Main Card Component */}
            <div
                className={`
                    relative flex-1 bg-white dark:bg-gray-900 rounded-xl p-5 
                    border border-gray-100 dark:border-gray-800 shadow-sm 
                    transition-all duration-500 cursor-pointer active:scale-[0.99]
                    ${isDragging ? '' : `hover:shadow-[0_0_20px_rgba(244,114,182,0.2)] hover:border-pink-200 dark:hover:border-pink-800/50`}
                    ${isCompleted ? 'opacity-50' : ''}
                `}
                onClick={() => {
                    if (!window.getSelection().toString()) {
                        onCopy(idea.content, idea.id);
                    }
                }}
                onDoubleClick={handleDoubleClick}
            >
                {/* Swipe Background (Delete Action) */}
                <div
                    className={`absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6 -z-10 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Trash2 className="text-white" size={20} />
                </div>

                <div className="flex items-start gap-3">
                    {/* Color Status Dot - Click to Edit Note */}
                    <div className="flex-shrink-0 mt-1.5 relative z-10">
                        <div
                            onClick={handleDotClick}
                            className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-sm ${isCompleted ? 'opacity-50' : ''} cursor-pointer hover:scale-125 transition-transform duration-200`}
                        />
                        {/* Note Input Popover */}
                        {isEditingNote && (
                            <div className="absolute top-6 left-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl shadow-pink-100/50 dark:shadow-pink-900/20 border border-pink-100 dark:border-pink-800 p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                                <input
                                    ref={input => input && input.focus()}
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    onBlur={handleNoteSave}
                                    onKeyDown={handleNoteKeyDown}
                                    placeholder={t('common.notePlaceholder', 'Add a note...')}
                                    className="w-full text-base md:text-xs text-gray-700 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-400"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className={`text-gray-700 dark:text-gray-200 text-[15px] font-normal leading-relaxed whitespace-pre-wrap font-sans transition-all duration-200 ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                            {parseRichText(idea.content)}
                        </div>
                        {/* Date/Time */}
                        <div className="mt-2 text-[11px] text-pink-300/30 dark:text-pink-500/30 font-medium group-hover:text-pink-300/80 dark:group-hover:text-pink-500/80 transition-colors">
                            {new Date(idea.timestamp || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                            <span className="mx-1.5 text-pink-200/20 dark:text-pink-800/20">·</span>
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
                            className="absolute top-3 right-3 bg-pink-50 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm border border-pink-100 dark:border-pink-800"
                        >
                            <Check size={12} strokeWidth={3} />
                            <span>{t('common.copied')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Note Display - Outside the Card */}
            {idea.note && (
                <div className="w-full md:w-[140px] pt-1 md:pt-4 pl-4 md:pl-0 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <p className="text-[12px] font-medium text-pink-300 dark:text-pink-300/80 leading-relaxed italic break-words select-text">
                        {idea.note}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default InspirationItem;
