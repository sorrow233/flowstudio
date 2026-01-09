import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { GripVertical, Check, Copy, Trash2, Pencil, Link as LinkIcon, Command, Globe, Tag, FileText, Share2 } from 'lucide-react';

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

    const [isGrabbing, setIsGrabbing] = useState(false);

    // Only enable swipe actions if not selecting or searching
    const swipeEnabled = !isSelectionMode && !isSearching;

    return (
        <div className="relative">
            {/* Slide Action Context (Behind content) - Only render when swipe is possible */}
            {swipeEnabled && (
                <motion.div
                    className={`absolute inset-y-0 right-0 bg-rose-400 z-0 flex items-center justify-end pr-5 text-white rounded-2xl transition-opacity duration-200 ${isGrabbing ? 'opacity-100' : 'opacity-0'}`}
                    style={{ width: '100%' }}
                >
                    <Trash2 size={24} />
                </motion.div>
            )}

            <motion.div
                layout
                drag={swipeEnabled ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ right: 0.05, left: 0.5 }}
                onDragStart={() => setIsGrabbing(true)}
                onDragEnd={(e, info) => {
                    if (info.offset.x < -100 || info.velocity.x < -500) {
                        handleRemove(cmd.id);
                    }
                    setIsGrabbing(false);
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={!isSelectionMode ? { y: -2, scale: 1.005, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" } : {}}
                onClick={(e) => {
                    if (isSelectionMode) {
                        onClick && onClick(e);
                        return;
                    }

                    // Click to Copy Logic (Sync with TaskItem)
                    handleCopy(cmd.id, cmd.content || cmd.url);
                }}
                onDoubleClick={onDoubleClick}
                className={`
                    group bg-white border rounded-2xl p-4 transition-all duration-300 flex flex-col relative z-10 overflow-hidden select-none touch-pan-y
                    ${getBorderClass()}
                    ${isSelectionMode ? 'cursor-pointer' : 'cursor-default'}
                    ${isGrabbing ? 'cursor-grabbing' : ''}
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
                    ) : dragListener && !isSearching && (
                        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 p-2 -ml-2">
                            <GripVertical size={16} />
                        </div>
                    )}

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

                    {/* Copied Feedback Badge (Absolute) */}
                    {copiedId === cmd.id && (
                        <div className="absolute top-2 right-2 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse border border-emerald-100 shadow-sm z-20">
                            Copied
                        </div>
                    )}

                    {/* Actions - reduced to just Share and Edit */}
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
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CommandItem;
