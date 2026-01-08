import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Terminal, Library, ChevronRight, GripVertical, Check, Copy, Trash2, Sparkles, Link as LinkIcon, Command, Globe, Tag, FileText, Share2, ListChecks, X, CheckSquare } from 'lucide-react';

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
    handleShare,
    setNewCmd,
    setIsAdding,
    setIsImporting,
    copiedId,
    commands,
    setCommands
}) => {
    // Multi-select state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [lastSelectedId, setLastSelectedId] = useState(null);

    // Reset selection when stage changes
    useEffect(() => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    }, [activeStage]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isSelectionMode) return;

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }
            if (e.key === 'Escape') {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
                setLastSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSelectionMode, visibleCommands]);

    // Shift+click range selection
    const handleShiftSelect = (id, e) => {
        if (!e.shiftKey || !lastSelectedId) {
            toggleSelection(id);
            setLastSelectedId(id);
            return;
        }

        const allIds = visibleCommands.map(c => c.id);
        const lastIdx = allIds.indexOf(lastSelectedId);
        const currentIdx = allIds.indexOf(id);

        if (lastIdx === -1 || currentIdx === -1) {
            toggleSelection(id);
            setLastSelectedId(id);
            return;
        }

        const start = Math.min(lastIdx, currentIdx);
        const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);

        const newSelected = new Set(selectedIds);
        rangeIds.forEach(rid => newSelected.add(rid));
        setSelectedIds(newSelected);
    };

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        setLastSelectedId(id);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === visibleCommands.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(visibleCommands.map(c => c.id)));
        }
    };

    // Bulk actions
    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (confirm(`Delete ${selectedIds.size} commands?`)) {
            selectedIds.forEach(id => handleRemove(id));
            setIsSelectionMode(false);
            setSelectedIds(new Set());
            setLastSelectedId(null);
        }
    };

    const handleBulkCopy = () => {
        if (selectedIds.size === 0) return;
        const selectedCmds = visibleCommands.filter(c => selectedIds.has(c.id));
        const textToCopy = selectedCmds.map(c => c.content || c.url).join('\n');
        navigator.clipboard.writeText(textToCopy);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    };

    // Bulk move to another stage
    const handleBulkMove = (targetStage) => {
        if (selectedIds.size === 0 || !commands || !setCommands) return;

        const updated = commands.map(cmd => {
            if (!selectedIds.has(cmd.id)) return cmd;
            const newStageIds = [...(cmd.stageIds || [])];
            // Remove from current stage
            const currentIdx = newStageIds.indexOf(activeStage);
            if (currentIdx !== -1) newStageIds.splice(currentIdx, 1);
            // Add to target stage if not already there
            if (!newStageIds.includes(targetStage)) newStageIds.push(targetStage);
            return { ...cmd, stageIds: newStageIds };
        });

        setCommands(updated);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        setLastSelectedId(null);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Command List */}
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
                                dragListener={!isSearching && !isSelectionMode}
                                className="relative"
                            >
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={!isSelectionMode ? { y: -2, scale: 1.005, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" } : {}}
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            handleShiftSelect(cmd.id, e);
                                            return;
                                        }
                                    }}
                                    onDoubleClick={() => !isSelectionMode && handleEdit(cmd)}
                                    className={`
                                        group bg-white border rounded-2xl p-4 transition-all duration-300 flex flex-col relative overflow-hidden select-none
                                        ${isSelectionMode && selectedIds.has(cmd.id) ? 'border-emerald-400 ring-1 ring-emerald-400 bg-emerald-50/50' : ''}
                                        ${!isSelectionMode && cmd.type === 'mandatory' ? 'border-red-100 hover:border-red-200' : ''}
                                        ${!isSelectionMode && cmd.type === 'link' ? 'border-blue-100 hover:border-blue-200' : ''}
                                        ${!isSelectionMode && cmd.type === 'utility' ? 'border-gray-100 hover:border-emerald-100' : ''}
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
                                        ) : !isSearching && (
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
                                        )}
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

            {/* Multi-select Toggle / Bulk Actions Footer */}
            <div className="shrink-0 pt-4 border-t border-gray-100">
                <AnimatePresence mode="wait">
                    {isSelectionMode ? (
                        <motion.div
                            key="bulk-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2 px-4 shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded transition-colors"
                                >
                                    {selectedIds.size === visibleCommands.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-sm font-medium text-emerald-900">
                                    {selectedIds.size} Selected
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedIds.size === 0}
                                    className="p-2 rounded-lg hover:bg-white text-red-500 hover:text-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Delete Selected"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={handleBulkCopy}
                                    disabled={selectedIds.size === 0}
                                    className="p-2 rounded-lg hover:bg-white text-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Copy Content"
                                >
                                    <Copy size={18} />
                                </button>
                                <div className="w-px h-4 bg-emerald-200 mx-1" />
                                {/* Move to Stage Buttons */}
                                <div className="flex items-center gap-0.5 bg-white/50 rounded-lg p-0.5">
                                    {[1, 2, 3, 4, 5].filter(s => s !== activeStage).map(stage => (
                                        <button
                                            key={stage}
                                            onClick={() => handleBulkMove(stage)}
                                            disabled={selectedIds.size === 0}
                                            className={`w-7 h-7 rounded-md text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                                                ${stage === 1 ? 'hover:bg-emerald-100 hover:text-emerald-700' : ''}
                                                ${stage === 2 ? 'hover:bg-blue-100 hover:text-blue-700' : ''}
                                                ${stage === 3 ? 'hover:bg-violet-100 hover:text-violet-700' : ''}
                                                ${stage === 4 ? 'hover:bg-amber-100 hover:text-amber-700' : ''}
                                                ${stage === 5 ? 'hover:bg-rose-100 hover:text-rose-700' : ''}
                                                text-gray-500
                                            `}
                                            title={`Move to Stage ${stage}`}
                                        >
                                            {stage}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-px h-4 bg-emerald-200 mx-1" />
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedIds(new Set());
                                        setLastSelectedId(null);
                                    }}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                                    title="Cancel (Esc)"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="toggle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-end"
                        >
                            <button
                                onClick={() => setIsSelectionMode(true)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm"
                                title="Multi-select mode"
                            >
                                <ListChecks size={16} />
                                <span className="text-xs font-medium">Multi-select</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommandList;
