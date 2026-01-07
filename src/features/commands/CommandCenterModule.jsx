import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Terminal, Plus, Trash2, Copy, Check, Search,
    Layers, MonitorPlay, Bug, Sparkles, Flag, Command,
    ChevronRight, Sparkle, Link as LinkIcon, GripVertical, FileText, Globe
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
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // Form State
    const [newCmd, setNewCmd] = useState({ title: '', content: '', type: 'utility', url: '' });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COMMANDS);
        if (saved) setCommands(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
    }, [commands]);

    const handleAdd = () => {
        if (!newCmd.title.trim()) return;

        // Validation based on type
        if (newCmd.type === 'link' && !newCmd.url.trim()) return;
        if (newCmd.type !== 'link' && !newCmd.content.trim()) return;

        const command = {
            id: uuidv4(),
            title: newCmd.title.trim(),
            content: newCmd.content.trim(), // Optional for Link type
            url: newCmd.url.trim(),
            type: newCmd.type,
            stageId: activeStage,
            createdAt: Date.now()
        };

        setCommands([command, ...commands]);
        setNewCmd({ title: '', content: '', type: 'utility', url: '' });
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this command?')) {
            setCommands(commands.filter(c => c.id !== id));
        }
    };

    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Reorder Handlers
    // We only reorder within the current stage view, but updating the main array
    const handleReorder = (reorderedStageCommands) => {
        // 1. Get commands NOT in this stage
        const otherCommands = commands.filter(c => c.stageId !== activeStage);

        // 2. Combine others + new ordered stage commands
        // Note: We might want to preserve the relative position of other stage items, 
        // but typically simply concatenating is fine as long as stability is maintained by ID.
        // However, a safer bet for "global state" is to map the new order.

        // Actually, Reorder.Group expects the full state it controls to be passed back.
        // Since we are filtering, we need to be careful.
        // Strategy: We won't use Reorder.Group on the *filtered* list directly to set state if it conflicts with the global list.
        // Instead, we update the global list by stitching.

        setCommands([...reorderedStageCommands, ...otherCommands]);
    };

    // Derived state for the current stage (needs to be stable for Reorder)
    const stageCommands = commands.filter(c => c.stageId === activeStage);

    // Search filtering applies visually but might disable reordering if active
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
                        const count = commands.filter(c => c.stageId === stage.id).length;
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
                        <button
                            onClick={() => setIsAdding(true)}
                            className="group flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium tracking-wide">New Command</span>
                        </button>
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

                                    {/* Title Input */}
                                    <input
                                        className="w-full bg-transparent text-2xl font-light outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-100 pb-2 transition-colors"
                                        placeholder="Command Title..."
                                        autoFocus
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
                                        Create Command
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
                                    dragListener={!isSearching} // Disable drag when searching
                                    className="relative"
                                >
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -2, scale: 1.005, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" }}
                                        className={`
                                            group bg-white border rounded-2xl p-4 transition-all duration-300 flex items-center gap-4 relative overflow-hidden select-none
                                            ${cmd.type === 'mandatory' ? 'border-red-100 hover:border-red-200' : ''}
                                            ${cmd.type === 'link' ? 'border-blue-100 hover:border-blue-200' : ''}
                                            ${cmd.type === 'utility' ? 'border-gray-100 hover:border-emerald-100' : ''}
                                        `}
                                    >
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
                                                onClick={() => handleCopy(cmd.id, cmd.content || cmd.url)}
                                                className="p-2 hover:bg-emerald-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors relative"
                                                title="Copy Content"
                                            >
                                                {copiedId === cmd.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cmd.id)}
                                                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    ) : (
                        !isAdding && (
                            <div className="flex flex-col items-center justify-center py-32 text-center select-none">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Terminal size={32} className="text-gray-300" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No Commands Configured</h4>
                                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                                    Stage {activeStage} is waiting for orders.
                                </p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2 hover:gap-3 transition-all"
                                >
                                    Create First Command <ChevronRight size={16} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandCenterModule;
