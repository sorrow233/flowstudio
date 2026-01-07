import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Terminal, Library, ChevronRight, GripVertical, Check, Copy, Trash2, Sparkles, Link as LinkIcon, Command, Globe, Tag, FileText } from 'lucide-react';

const CommandList = ({
    visibleCommands,
    stageCommands,
    handleReorder,
    isSearching,
    isAdding,
    isImporting,
    activeStage,
    categories,
    handleEdit,
    handleCopy,
    handleRemove,
    setNewCmd,
    setIsAdding,
    setIsImporting,
    copiedId
}) => {
    return (
        <div className="flex-1 overflow-y-auto pr-2 -mr-4 pr-6 pb-20 custom-scrollbar">
            {visibleCommands.length > 0 ? (
                <Reorder.Group
                    axis="y"
                    values={stageCommands}
                    onReorder={handleReorder}
                    className="space-y-3"
                >
                    {visibleCommands.map(cmd => (
                        <Reorder.Item
                            key={cmd.id}
                            value={cmd}
                            dragListener={!isSearching}
                            className="relative"
                        >
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -2, scale: 1.005, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" }}
                                onDoubleClick={() => handleEdit(cmd)}
                                className={`
                                    group bg-white border rounded-2xl p-4 transition-all duration-300 flex flex-col relative overflow-hidden select-none
                                    ${cmd.type === 'mandatory' ? 'border-red-100 hover:border-red-200' : ''}
                                    ${cmd.type === 'link' ? 'border-blue-100 hover:border-blue-200' : ''}
                                    ${cmd.type === 'utility' ? 'border-gray-100 hover:border-emerald-100' : ''}
                                `}
                            >
                                <div className="flex items-center gap-4 z-10">
                                    {/* Drag Handle */}
                                    {!isSearching && (
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
                                                                handleCopy(`${cmd.id}-${tag.id}`, tag.value || cmd.content);
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

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(cmd); }}
                                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                                            title="Edit"
                                        >
                                            <Sparkles size={18} />
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
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                !isAdding && !isImporting && (
                    <div className="flex flex-col items-center justify-center py-32 text-center select-none">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Terminal size={32} className="text-gray-300" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Commands Configured</h4>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                            Stage {activeStage} is waiting for orders.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsImporting(true)}
                                className="text-gray-500 font-medium hover:text-gray-700 flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                <Library size={16} /> Open Library
                            </button>
                            <button
                                onClick={() => {
                                    setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [] });
                                    setIsAdding(true);
                                }}
                                className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                Create Command <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default CommandList;
