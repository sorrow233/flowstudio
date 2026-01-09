import React from 'react';
import { motion, useDragControls } from 'framer-motion';
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
    onDoubleClick
}) => {
    // Elegant, minimal styling logic
    const categoryInfo = categories.find(cat => cat.id === cmd.category);

    const borders = {
        mandatory: 'border-red-100 dark:border-red-900/30',
        link: 'border-blue-100 dark:border-blue-900/30',
        utility: 'border-gray-100 dark:border-gray-800'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            whileHover={!isSelectionMode ? { y: -2, transition: { duration: 0.2 } } : {}}
            className={`
                group bg-white dark:bg-gray-900 border rounded-2xl p-4 transition-all duration-300 flex flex-col relative overflow-hidden select-none
                ${isSelectionMode && selectedIds.has(cmd.id) ? 'border-emerald-400 ring-1 ring-emerald-400 bg-emerald-50/50' : borders[cmd.type] || borders.utility}
                ${isSelectionMode ? 'cursor-pointer' : ''}
            `}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <div className="flex items-center gap-3 z-10">
                {/* Drag Handle or Selection */}
                {isSelectionMode ? (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${selectedIds.has(cmd.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}
                    `}>
                        {selectedIds.has(cmd.id) && <Check size={12} strokeWidth={3} />}
                    </div>
                ) : (
                    <div
                        onPointerDown={(e) => dragControls?.start(e)}
                        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors p-1 -ml-2 shrink-0"
                    >
                        <GripVertical size={18} />
                    </div>
                )}

                {/* Icon Box */}
                <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${cmd.type === 'mandatory' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : ''}
                    ${cmd.type === 'link' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : ''}
                    ${cmd.type === 'utility' ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-500' : ''}
                `}>
                    {cmd.type === 'link' ? <LinkIcon size={20} /> : <Command size={20} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{cmd.title}</h4>
                        {categoryInfo && cmd.category !== 'general' && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${categoryInfo.color.replace('bg-', 'bg-opacity-10 text-') || 'bg-gray-100 text-gray-500'}`}>
                                {categoryInfo.label}
                            </span>
                        )}

                        {/* Inline Tags */}
                        {cmd.tags?.length > 0 && (
                            <div className="flex gap-1">
                                {cmd.tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSelectionMode) handleCopy(`${cmd.id}-${tag.id}`, tag.value || cmd.content);
                                        }}
                                        className="group/tag px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-100 transition-all relative overflow-hidden"
                                    >
                                        {tag.label}
                                        {copiedId === `${cmd.id}-${tag.id}` && (
                                            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="absolute inset-0 bg-emerald-500 text-white flex items-center justify-center">
                                                <Check size={10} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate opacity-60">
                        {cmd.type === 'link' ? cmd.url : cmd.content}
                    </div>
                </div>

                {/* Side Actions */}
                {!isSelectionMode && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare?.(cmd); }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Share2 size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(cmd.id); }}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
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
