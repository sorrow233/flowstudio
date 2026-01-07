import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Terminal, Plus, Trash2, Copy, Check, Search,
    Layers, MonitorPlay, Bug, Sparkles, Flag, Command,
    ChevronRight, Sparkle, Link as LinkIcon, GripVertical, FileText, Globe, Library, Download, X, Tag
} from 'lucide-react';
import { STORAGE_KEYS, DEV_STAGES } from '../../utils/constants';
import { v4 as uuidv4 } from 'uuid';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Bug,
    4: Sparkles,
    5: Flag
};

const CommandCenterModule = () => {
    const [commands, setCommands] = useState([]);
    const [activeStage, setActiveStage] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // Form State
    const [newCmd, setNewCmd] = useState({ title: '', content: '', type: 'utility', url: '', tags: [] });
    const [newTag, setNewTag] = useState({ label: '', value: '' });
    const [editingTagId, setEditingTagId] = useState(null); // Track which tag is being edited

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COMMANDS);
        if (saved) {
            let parsed = JSON.parse(saved);

            // DATA MIGRATION: Ensure all commands have stageIds array
            const migrated = parsed.map(c => {
                let updated = { ...c };
                if (!updated.stageIds) {
                    updated.stageIds = updated.stageId ? [updated.stageId] : [];
                }
                if (!updated.tags) {
                    updated.tags = [];
                }
                return updated;
            });

            // Check if we actually needed migration to avoid infinite loops if we were setting state inside effect without check
            // (But creating a new array reference always triggers re-render if not careful. 
            // Here we just set it once on mount. The save effect handles persist.)
            setCommands(migrated);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
    }, [commands]);

    const handleAdd = () => {
        if (!newCmd.title.trim()) return;

        // Validation based on type
        if (newCmd.type === 'link' && !newCmd.url.trim()) return;
        if (newCmd.type !== 'link' && !newCmd.content.trim()) return;

        if (newCmd.id) {
            // Update existing
            setCommands(commands.map(c => c.id === newCmd.id ? {
                ...c,
                title: newCmd.title.trim(),
                content: newCmd.content.trim(),
                url: newCmd.url.trim(),
                type: newCmd.type
                // stageIds remains unchanged during simple edit
            } : c));
        } else {
            // Create New
            const command = {
                id: uuidv4(),
                title: newCmd.title.trim(),
                content: newCmd.content.trim(),
                url: newCmd.url.trim(),
                type: newCmd.type,
                tags: newCmd.tags || [],
                stageIds: [activeStage], // Assign to current stage
                createdAt: Date.now()
            };
            setCommands([command, ...commands]);
        }

        setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [] });
        setIsAdding(false);
    };

    const handleAddTag = () => {
        if (!newTag.label.trim()) return;
        const tagValue = newTag.value.trim() || newCmd.content;

        if (editingTagId) {
            // Update existing tag
            const updatedTags = newCmd.tags.map(t =>
                t.id === editingTagId
                    ? { ...t, label: newTag.label.trim(), value: tagValue }
                    : t
            );
            setNewCmd({ ...newCmd, tags: updatedTags });
            setEditingTagId(null);
        } else {
            // Add new tag
            // Prevent duplicates based on label (optional, but good for sanity)
            if (newCmd.tags.some(t => t.label.toLowerCase() === newTag.label.trim().toLowerCase())) {
                alert('A tag with this label already exists.');
                return;
            }

            const tag = {
                id: uuidv4(),
                label: newTag.label.trim(),
                value: tagValue
            };
            setNewCmd({ ...newCmd, tags: [...(newCmd.tags || []), tag] });
        }
        setNewTag({ label: '', value: '' });
    };

    const handleEditTagClick = (tag) => {
        setNewTag({ label: tag.label, value: tag.value });
        setEditingTagId(tag.id);
    };

    const handleCancelTagEdit = () => {
        setNewTag({ label: '', value: '' });
        setEditingTagId(null);
    };

    const handleRemoveTag = (tagId) => {
        setNewCmd({ ...newCmd, tags: newCmd.tags.filter(t => t.id !== tagId) });
        if (editingTagId === tagId) {
            handleCancelTagEdit();
        }
    };

    const handleImport = (cmd) => {
        // Add activeStage to the command's stageIds
        const updated = commands.map(c =>
            c.id === cmd.id
                ? { ...c, stageIds: [...(c.stageIds || []), activeStage] }
                : c
        );
        setCommands(updated);
        setIsImporting(false);
    };

    const handleEdit = (cmd) => {
        setNewCmd({
            id: cmd.id,
            title: cmd.title,
            content: cmd.content || '',
            url: cmd.url || '',
            type: cmd.type,
            tags: cmd.tags || []
        });
        setNewTag({ label: '', value: '' }); // Clear tag form when editing command
        setEditingTagId(null); // Clear editing tag state
        setIsAdding(true);
    };

    const handleRemove = (id) => {
        const command = commands.find(c => c.id === id);
        if (!command) return;

        // Check if this is the last stage assignment
        // If it's the last one, we hard delete.
        // If it's mandatory, it's usually 1:1, but new logic allows M to be anywhere technically, 
        // but user requirement implies M is specific. We treat all same here for consistency.

        const isLastInstance = command.stageIds.length <= 1;

        if (confirm(isLastInstance ? 'Delete this command permanently?' : 'Remove command from this stage? (It will remain in others)')) {
            if (isLastInstance) {
                setCommands(commands.filter(c => c.id !== id));
            } else {
                // Just remove the stageId
                setCommands(commands.map(c =>
                    c.id === id
                        ? { ...c, stageIds: c.stageIds.filter(sid => sid !== activeStage) }
                        : c
                ));
            }
        }
    };

    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Reorder Handlers
    // Note: Reordering is tricky with global commands. 
    // We will store the order in the array itself relative to other items?
    // Simplified User Reorder: We just update the command array order. 
    // Since we filter by stage, moving an item in the main array changes its relative pos.
    // Ideally we need per-stage order. For V1, we accept that reordering might affect global order.
    // Or we keep it simple: Reorder just moves it in the master list.
    const handleReorder = (reorderedStageCommands) => {
        // We need to merge reordered subset back into the main list without losing others
        // Strategy: Create a new list where the items of this stage are replaced by the reordered ones

        // 1. Get IDs of items in this stage
        const stageIdsSet = new Set(reorderedStageCommands.map(c => c.id));

        // 2. Filter out current stage items from main list to preserve "others" order
        const others = commands.filter(c => !stageIdsSet.has(c.id));

        // 3. We can't just append 'others' at the end or we lose the global mix.
        // Simpler V1 approach: Just put text stage items at TOP or replace them?
        // Let's just put the reordered ones + others.
        // This effectively "groups" stage commands together in the master list if we view raw DB, 
        // but for the user it looks correct.
        setCommands([...reorderedStageCommands, ...others]);
    };

    // Filter commands for current stage
    const stageCommands = commands.filter(c => c.stageIds?.includes(activeStage));

    // For Import Modal: Commands NOT in current stage AND (Link or Utility)
    const importableCommands = commands.filter(c =>
        !c.stageIds?.includes(activeStage) &&
        (c.type === 'link' || c.type === 'utility')
    );

    // Search filtering
    const isSearching = search.trim().length > 0;
    const visibleCommands = isSearching
        ? stageCommands.filter(c =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.content.toLowerCase().includes(search.toLowerCase())
        )
        : stageCommands;

    return (
        <div className="max-w-7xl mx-auto pt-8 px-6 h-[calc(100vh-4rem)] flex gap-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-10 bg-gray-50/50 pointer-events-none" />
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-100 to-transparent -z-10 opacity-50" />

            {/* Sidebar / Stage Select */}
            <div className="w-72 shrink-0 flex flex-col gap-2 py-4">
                <div className="mb-10 px-4">
                    <h2 className="text-2xl font-thin text-gray-900 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                            <Terminal size={20} />
                        </div>
                        Command Center
                    </h2>
                    <p className="text-xs text-gray-400 mt-2 pl-1 font-light tracking-wide">
                        AI PROMPT ORCHESTRATION
                    </p>
                </div>

                <div className="space-y-1">
                    {DEV_STAGES.map(stage => {
                        const Icon = STAGE_ICONS[stage.id];
                        // Count items in this stage
                        const count = commands.filter(c => c.stageIds?.includes(stage.id)).length;
                        const isActive = activeStage === stage.id;

                        return (
                            <button
                                key={stage.id}
                                onClick={() => setActiveStage(stage.id)}
                                className={`
                                        w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive ? 'bg-white shadow-xl shadow-gray-200/50 scale-105 z-10' : 'hover:bg-white/50 hover:pl-5 text-gray-500'}
                                    `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                            ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-white'}
                                        `}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {stage.label}
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="subtitle"
                                                className="text-[10px] text-gray-400 font-mono hidden xl:block"
                                            >
                                                STAGE 0{stage.id}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                                {count > 0 && (
                                    <span className={`text-[10px] font-mono px-2 py-1 rounded-full transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-400'}`}>
                                        {count}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-bg"
                                        className="absolute inset-0 border-2 border-gray-100 rounded-2xl pointer-events-none"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 flex flex-col relative overflow-hidden ring-1 ring-gray-100/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-50/50 to-transparent blur-3xl -z-10 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold tracking-widest uppercase text-gray-500">
                                Stage 0{activeStage}
                            </span>
                        </div>
                        <h3 className="text-4xl font-thin text-gray-900 mb-2">{DEV_STAGES[activeStage - 1].title}</h3>
                        <p className="text-gray-400 font-light max-w-lg leading-relaxed">
                            {DEV_STAGES[activeStage - 1].desc}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex gap-2">
                            {/* Import Button */}
                            <button
                                onClick={() => setIsImporting(true)}
                                className="group flex items-center gap-2 px-5 py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                                title="Import from Global Library"
                            >
                                <Library size={18} />
                                <span className="font-medium text-sm">Library</span>
                            </button>

                            {/* New Command Button */}
                            <button
                                onClick={() => {
                                    setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [] }); // Clear for new
                                    setNewTag({ label: '', value: '' });
                                    setEditingTagId(null);
                                    setIsAdding(true);
                                }}
                                className="group flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="font-medium tracking-wide">New Command</span>
                            </button>
                        </div>

                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search commands..."
                                className="pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white rounded-xl text-sm border border-transparent hover:border-gray-200 focus:border-emerald-200 outline-none w-64 transition-all focus:w-80 shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* Command Grid / List */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-4 pr-6 pb-20 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-white border border-emerald-100 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-500/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />

                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-light text-gray-900">{newCmd.id ? 'Edit Command' : 'Create New Command'}</h4>
                                        {/* Type Selector */}
                                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                                            {[
                                                { id: 'utility', label: 'Utility (Copy)', icon: Copy },
                                                { id: 'mandatory', label: 'Mandatory (Task)', icon: Check },
                                                { id: 'link', label: 'Link (URL)', icon: LinkIcon }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setNewCmd({ ...newCmd, type: type.id })}
                                                    className={`
                                                        flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all
                                                        ${newCmd.type === type.id
                                                            ? 'bg-white shadow-sm text-gray-900'
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                                                    `}
                                                >
                                                    <type.icon size={14} />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title Input */}
                                    <input
                                        className="w-full bg-transparent text-2xl font-light outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-100 pb-2 transition-colors"
                                        placeholder="Command Title..."
                                        autoFocus={!newCmd.id}
                                        value={newCmd.title}
                                        onChange={e => setNewCmd({ ...newCmd, title: e.target.value })}
                                    />

                                    {/* Content Inputs based on Type */}
                                    <div className="space-y-4">
                                        {newCmd.type === 'link' && (
                                            <div className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                                                <div className="absolute top-3 left-4 text-gray-300 pointer-events-none">
                                                    <Globe size={16} />
                                                </div>
                                                <input
                                                    className="w-full bg-transparent p-3 pl-12 text-sm font-mono text-emerald-600 outline-none"
                                                    placeholder="https://..."
                                                    value={newCmd.url}
                                                    onChange={e => setNewCmd({ ...newCmd, url: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                                            <div className="absolute top-3 left-4 text-gray-300 pointer-events-none">
                                                <Terminal size={16} />
                                            </div>
                                            <textarea
                                                className="w-full bg-transparent p-4 pl-12 text-sm font-mono text-gray-600 outline-none resize-y min-h-[120px]"
                                                placeholder={newCmd.type === 'link' ? "(Optional) Content to copy before opening URL..." : "Enter your system instruction or prompt here..."}
                                                value={newCmd.content}
                                                onChange={e => setNewCmd({ ...newCmd, content: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Tags Section (Only for Utility) */}
                                    {newCmd.type === 'utility' && (
                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Tag size={12} /> Tags & Variants
                                                </span>
                                                {editingTagId && (
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium animate-pulse">
                                                        Editing Tag...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-1">
                                                    <input
                                                        className={`
                                                            w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400
                                                            ${editingTagId
                                                                ? 'bg-amber-50 border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 text-amber-900'
                                                                : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-emerald-200 focus:ring-2 focus:ring-emerald-50'}
                                                        `}
                                                        placeholder="Label (e.g. 'Prod')"
                                                        value={newTag.label}
                                                        onChange={e => setNewTag({ ...newTag, label: e.target.value })}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (newTag.label.trim()) handleAddTag();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-[2] space-y-1">
                                                    <input
                                                        className={`
                                                            w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all font-mono placeholder:text-gray-400
                                                            ${editingTagId
                                                                ? 'bg-amber-50 border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 text-amber-900'
                                                                : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-emerald-200 focus:ring-2 focus:ring-emerald-50 text-gray-600'}
                                                        `}
                                                        placeholder="Content Override (Optional)"
                                                        value={newTag.value}
                                                        onChange={e => setNewTag({ ...newTag, value: e.target.value })}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (newTag.label.trim()) handleAddTag();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handleAddTag}
                                                        disabled={!newTag.label.trim()}
                                                        className={`
                                                            px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                                            ${editingTagId
                                                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
                                                                : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}
                                                            disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                                                        `}
                                                    >
                                                        {editingTagId ? 'Update' : 'Add'}
                                                    </button>
                                                    {editingTagId && (
                                                        <button
                                                            onClick={handleCancelTagEdit}
                                                            className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                                                            title="Cancel Edit"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Added Tags List */}
                                            {(newCmd.tags && newCmd.tags.length > 0) && (
                                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 min-h-[60px]">
                                                    {newCmd.tags.map(tag => (
                                                        <div
                                                            key={tag.id}
                                                            onClick={() => handleEditTagClick(tag)}
                                                            className={`
                                                                    group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all select-none
                                                                    ${editingTagId === tag.id
                                                                    ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200 ring-offset-1'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:text-emerald-600 hover:shadow-sm'}
                                                                `}
                                                        >
                                                            <Tag size={12} className={editingTagId === tag.id ? 'text-amber-600' : 'text-gray-400 group-hover:text-emerald-500'} />
                                                            <span>{tag.label}</span>
                                                            {tag.value && (
                                                                <>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className="font-mono opacity-60 max-w-[120px] truncate text-[10px]">{tag.value}</span>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }}
                                                                className="ml-1 p-0.5 hover:bg-red-50 hover:text-red-500 rounded-md text-gray-400 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {newCmd.tags.length === 0 && (
                                                        <div className="text-gray-400 text-xs italic p-2 w-full text-center">No tags added yet.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newCmd.title.trim() || (newCmd.type === 'link' ? !newCmd.url.trim() : !newCmd.content.trim())}
                                        className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {newCmd.id ? 'Save Changes' : 'Create Command'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Draggable List */}
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
                                                <div className="flex items-center gap-2 mb-1">
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

                                        {/* Tags Display */}
                                        {(cmd.tags && cmd.tags.length > 0) && (
                                            <div className="flex flex-wrap gap-2 pl-[4.5rem] mt-3 mb-1">
                                                {cmd.tags.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(`${cmd.id}-${tag.id}`, tag.value || cmd.content);
                                                        }}
                                                        className="group/tag flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 hover:border-emerald-300 transition-all relative overflow-hidden shadow-sm"
                                                        title={`Copy: ${tag.value || cmd.content}`}
                                                    >
                                                        <Tag size={10} className="opacity-60 group-hover/tag:opacity-100" />
                                                        {tag.label}
                                                        {copiedId === `${cmd.id}-${tag.id}` && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="absolute inset-0 bg-emerald-600 text-white flex items-center justify-center font-bold"
                                                            >
                                                                <Check size={12} strokeWidth={3} />
                                                            </motion.div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
            </div>

            {/* Import Library Modal */}
            <AnimatePresence>
                {isImporting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsImporting(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col relative z-50"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-light text-gray-900 flex items-center gap-2">
                                        <Library size={20} /> Global Command Library
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">Import commands from other stages</p>
                                </div>
                                <button onClick={() => setIsImporting(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {importableCommands.length > 0 ? (
                                    importableCommands.map(cmd => (
                                        <div key={cmd.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                                    ${cmd.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'}
                                                `}>
                                                    {cmd.type === 'link' ? <LinkIcon size={18} /> : <Command size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{cmd.title}</h4>
                                                    <p className="text-xs text-gray-400 font-mono line-clamp-1 max-w-xs">{cmd.url || cmd.content}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleImport(cmd)}
                                                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <Download size={14} /> Import
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Library size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No other commands available to import.</p>
                                        <p className="text-xs mt-2">Only 'Utility' and 'Link' types are shared globally.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default CommandCenterModule;
