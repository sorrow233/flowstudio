import React from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Trash2, Pencil, Link as LinkIcon, Command, Globe, Tag, FileText, Share2 } from 'lucide-react';

const CommandItem = ({
    cmd,
    isSelectionMode,
    selectedIds,
    categories,
    handleEdit,
    handleCopy,
    handleRemove, // Optional in selection mode
    handleShare,
    handleShiftSelect, // Optional
    copiedId,
    isSearching,
    dragListener = true,
    // Event handlers wrapper
    onClick,
    onDoubleClick
}) => {
    // Determine border color based on type
    const getBorderClass = () => {
        if (isSelectionMode && selectedIds.has(cmd.id)) return 'border-emerald-400 ring-1 ring-emerald-400 bg-emerald-50/50';
        if (!isSelectionMode) {
            if (cmd.type === 'mandatory') return 'border-red-100 hover:border-red-200';
            if (cmd.type === 'link') return 'border-blue-100 hover:border-blue-200';
            if (cmd.type === 'utility') return 'border-gray-100 hover:border-emerald-100';
        }
        return '';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={!isSelectionMode ? { y: -2, scale: 1.005, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" } : {}}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={`
                group bg-white border rounded-2xl p-4 transition-all duration-300 flex flex-col relative overflow-hidden select-none
                ${getBorderClass()}
                ${isSelectionMode ? 'cursor-pointer' : ''}
            `}
        >
            <div className="flex items-center gap-4 z-10">
                {/* Selection Checkbox or Drag Handle */}
                {isSelectionMode ? (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${selectedIds.has(cmd.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-400'}
                    `}>
                        {selectedIds.has(cmd.id) && <Check size={12} strokeWidth={3} />}
                    </div>
                ) : null}

                {/* Category Badge */}
                {cmd.category && cmd.category !== 'general' && (
                    <div className={`
                        absolute top-3 right-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide opacity-50 group-hover:opacity-100 transition-opacity
                        ${categories.find(cat => cat.id === cmd.category)?.color || 'bg-gray-100 text-gray-500'}
                    `}>
                        {categories.find(cat => cat.id === cmd.category)?.label}
                    </div>
                )}

                {/* Icon Box */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500
                    ${cmd.type === 'mandatory' ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : ''}
                    ${cmd.type === 'link' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100' : ''}
                    ${cmd.type === 'utility' ? 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600' : ''}
                `}>
                    {cmd.type === 'link' ? <LinkIcon size={20} /> : <Command size={20} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 py-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{cmd.title}</h4>
                        {cmd.type === 'mandatory' && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">MANDATORY</span>
                        )}
                        {cmd.type === 'link' && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">LINK</span>
                        )}
                        {(cmd.stageIds && cmd.stageIds.length > 1) && (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Globe size={8} /> SHARED
                            </span>
                        )}
                        {/* Inline Tags */}
                        {(cmd.tags && cmd.tags.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 ml-1">
                                {cmd.tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSelectionMode) handleCopy(`${cmd.id}-${tag.id}`, tag.value || cmd.content);
                                        }}
                                        className="group/tag flex items-center gap-1 px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200 hover:border-emerald-300 transition-all relative overflow-hidden select-none"
                                        title={`Copy: ${tag.value || cmd.content}`}
                                    >
                                        <Tag size={8} className="opacity-60 group-hover/tag:opacity-100" />
                                        {tag.label}
                                        {copiedId === `${cmd.id}-${tag.id}` && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute inset-0 bg-emerald-600 text-white flex items-center justify-center font-bold"
                                            >
                                                <Check size={10} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate flex items-center gap-2">
                        {cmd.type === 'link' ? (
                            <>
                                <Globe size={10} /> {cmd.url}
                            </>
                        ) : (
                            <>
                                <FileText size={10} /> {cmd.content}
                            </>
                        )}
                    </div>
                </div>

                {/* Actions - hide in selection mode */}
                {!isSelectionMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare?.(cmd); }}
                            className="p-2 hover:bg-violet-50 rounded-xl text-gray-400 hover:text-violet-600 transition-colors"
                            title="分享到社区"
                        >
                            <Share2 size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(cmd); }}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                            title="Edit"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(cmd.id, cmd.content || cmd.url); }}
                            className="p-2 hover:bg-emerald-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors relative"
                            title="Copy Content"
                        >
                            {copiedId === cmd.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(cmd.id); }}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CommandItem;
