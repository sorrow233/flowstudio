import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Plus, Trash2, Copy, Check, Search,
    Layers, MonitorPlay, Bug, Sparkles, Flag, Command,
    ChevronRight, Sparkle
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
    const [newCmd, setNewCmd] = useState({ title: '', content: '', type: 'utility' });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COMMANDS);
        if (saved) setCommands(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
    }, [commands]);

    const handleAdd = () => {
        if (!newCmd.title.trim() || !newCmd.content.trim()) return;

        const command = {
            id: uuidv4(),
            title: newCmd.title.trim(),
            content: newCmd.content.trim(),
            type: newCmd.type,
            stageId: activeStage,
            createdAt: Date.now()
        };

        setCommands([command, ...commands]);
        setNewCmd({ title: '', content: '', type: 'utility' });
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

    const filteredCommands = commands.filter(c =>
        c.stageId === activeStage &&
        (c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.content.toLowerCase().includes(search.toLowerCase()))
    );

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

                {/* Command Grid */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 -mr-4 pr-6 pb-20 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-white border border-emerald-100 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-500/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />

                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <input
                                            className="w-full bg-transparent text-2xl font-light outline-none placeholder:text-gray-300"
                                            placeholder="Command Title..."
                                            autoFocus
                                            value={newCmd.title}
                                            onChange={e => setNewCmd({ ...newCmd, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setNewCmd({ ...newCmd, type: 'utility' })}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${newCmd.type === 'utility' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Utility (Copy)
                                        </button>
                                        <button
                                            onClick={() => setNewCmd({ ...newCmd, type: 'mandatory' })}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${newCmd.type === 'mandatory' ? 'bg-red-500 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Mandatory (Task)
                                        </button>
                                    </div>
                                </div>

                                <div className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                                    <div className="absolute top-3 left-4 text-gray-300 pointer-events-none">
                                        <Terminal size={16} />
                                    </div>
                                    <textarea
                                        className="w-full bg-transparent p-4 pl-12 text-sm font-mono text-gray-600 outline-none resize-y min-h-[160px]"
                                        placeholder="Enter your system instruction or prompt here..."
                                        value={newCmd.content}
                                        onChange={e => setNewCmd({ ...newCmd, content: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newCmd.title.trim() || !newCmd.content.trim()}
                                        className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Create Command
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredCommands.map(cmd => (
                                <motion.div
                                    key={cmd.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                                    className={`
                                        group bg-white border rounded-3xl p-6 transition-all duration-300 flex flex-col h-full relative overflow-hidden
                                        ${cmd.type === 'mandatory' ? 'border-red-100 hover:border-red-200' : 'border-gray-100 hover:border-emerald-100'}
                                    `}
                                >
                                    {cmd.type === 'mandatory' && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-red-400" />
                                    )}

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500
                                                ${cmd.type === 'mandatory' ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}
                                            `}>
                                                <Command size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-lg text-gray-900">{cmd.title}</h4>
                                                    {cmd.type === 'mandatory' && (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            MANDATORY
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => handleCopy(cmd.id, cmd.content)}
                                                className="p-2 hover:bg-emerald-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors relative"
                                            >
                                                {copiedId === cmd.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cmd.id)}
                                                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-gray-50/50 group-hover:bg-gray-50 rounded-2xl p-4 font-mono text-xs text-gray-600 leading-relaxed relative border border-transparent group-hover:border-gray-100 transition-colors">
                                        <div className={`absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity ${cmd.type === 'mandatory' ? 'text-red-200' : 'text-emerald-200'}`}>
                                            <Sparkle size={12} fill="currentColor" />
                                        </div>
                                        <p className="line-clamp-4 pl-0 group-hover:pl-4 transition-all duration-300">
                                            {cmd.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredCommands.length === 0 && !isAdding && (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Terminal size={32} className="text-gray-300" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No Commands Configured</h4>
                                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                                    This stage is empty. Add your frequently used AI prompts here to streamline your workflow.
                                </p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2 hover:gap-3 transition-all"
                                >
                                    Create First Command <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CommandCenterModule;
