import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Link as LinkIcon, Command, Globe, Tag, FileText, Share2, GripVertical } from 'lucide-react';

const CommandItem = ({
    cmd,
    isSelectionMode,
    selectedIds,
    categories,
    handleEdit,
    handleCopy,
    handleRemove,
    handleShare,
    copiedId,
    dragControls,
    onClick,
    onDoubleClick,
    onLongPress
}) => {
    const longPressTimer = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });
    const isLongPressTriggered = useRef(false);

    const handlePointerDown = (e) => {
        if (isSelectionMode) return;
        // Only trigger for primary button (left click)
        if (e.button !== 0) return;

        isLongPressTriggered.current = false;
        startPos.current = { x: e.clientX, y: e.clientY };

        longPressTimer.current = setTimeout(() => {
            isLongPressTriggered.current = true;
            onLongPress?.(cmd.id);
            longPressTimer.current = null;
        }, 500);
    };

    const handlePointerMove = (e) => {
        if (longPressTimer.current) {
            const dist = Math.sqrt(
                Math.pow(e.clientX - startPos.current.x, 2) +
                Math.pow(e.clientY - startPos.current.y, 2)
            );
            if (dist > 10) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handlePointerUp = (e) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleInternalClick = (e) => {
        // If we just finished a long press, don't execute the click logic
        if (isLongPressTriggered.current) {
            isLongPressTriggered.current = false;
            return;
        }
        onClick?.(e);
    };

    // Elegant, minimal styling logic
    const categoryInfo = categories.find(cat => cat.id === cmd.category);

    const borders = {
        mandatory: 'border-red-100 dark:border-red-500/20 hover:border-red-200 dark:hover:border-red-500/40',
        link: 'border-blue-100 dark:border-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/40',
        utility: 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
    };

    const isSelected = isSelectionMode && selectedIds.has(cmd.id);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            whileHover={!isSelectionMode ? { y: -2, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' } : {}}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
                group relative flex flex-col p-4 rounded-2xl transition-all duration-300 border backdrop-blur-sm select-none overflow-hidden
                ${isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                    : `bg-white dark:bg-gray-900/40 ${borders[cmd.type] || borders.utility}`
                }
                ${isSelectionMode ? 'cursor-pointer' : ''}
            `}
            onClick={handleInternalClick}
            onDoubleClick={onDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div className="flex items-center gap-3 z-10">
                {/* Drag Handle or Selection */}
                {isSelectionMode ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'border-gray-300 dark:border-white/20'}
                    `}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                    </motion.div>
                ) : (
                    <div
                        onPointerDown={(e) => dragControls?.start(e)}
                        style={{ touchAction: 'none' }}
                        className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 transition-colors p-1 -ml-2 shrink-0 opacity-0 group-hover:opacity-100"
                    >
                        <GripVertical size={18} />
                    </div>
                )}

                {/* Icon Box */}
                <div className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 relative overflow-hidden
                    ${cmd.type === 'mandatory' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : ''}
                    ${cmd.type === 'link' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : ''}
                    ${cmd.type === 'utility' ? 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500' : ''}
                `}>
                    {cmd.type === 'link' ? <LinkIcon size={20} strokeWidth={1.5} /> : <Command size={20} strokeWidth={1.5} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">{cmd.title}</h4>
                        {categoryInfo && cmd.category !== 'general' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${categoryInfo.color.replace('bg-', 'bg-opacity-10 text-') || 'bg-gray-100 text-gray-500'} dark:bg-white/5 dark:text-gray-300`}>
                                {categoryInfo.label}
                            </span>
                        )}

                        {/* Inline Tags */}
                        {cmd.tags?.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {cmd.tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSelectionMode) handleCopy(`${cmd.id}-${tag.id}`, tag.value || cmd.content);
                                        }}
                                        className="group/tag px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/10 transition-all relative overflow-hidden"
                                    >
                                        <span className="relative z-10">{tag.label}</span>
                                        {copiedId === `${cmd.id}-${tag.id}` && (
                                            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="absolute inset-0 bg-emerald-500 text-white flex items-center justify-center z-20">
                                                <Check size={10} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate opacity-60 group-hover:opacity-80 transition-opacity">
                        {cmd.type === 'link' ? cmd.url : cmd.content}
                    </div>
                </div>

                {/* Side Actions */}
                {!isSelectionMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare?.(cmd); }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <Share2 size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(cmd.id); }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CommandItem;
