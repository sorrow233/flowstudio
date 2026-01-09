import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Terminal, Library, ChevronRight, Copy, Trash2, ListChecks, X } from 'lucide-react';
import CommandItem from './CommandItem';

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
    setCommands,
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
            <div className="flex-1 overflow-y-auto pr-2 md:-mr-4 md:pr-6 pb-20 custom-scrollbar">
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
                                <CommandItem
                                    cmd={cmd}
                                    isSelectionMode={isSelectionMode}
                                    selectedIds={selectedIds}
                                    categories={categories}
                                    handleEdit={handleEdit}
                                    handleCopy={handleCopy}
                                    handleRemove={handleRemove}
                                    handleShare={handleShare}
                                    handleShiftSelect={handleShiftSelect}
                                    copiedId={copiedId}
                                    isSearching={isSearching}
                                    dragListener={!isSearching && !isSelectionMode}
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            handleShiftSelect(cmd.id, e);
                                            return;
                                        }
                                    }}
                                    onDoubleClick={() => !isSelectionMode && handleEdit(cmd)}
                                />
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
                                        setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [], category: 'general' });
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
