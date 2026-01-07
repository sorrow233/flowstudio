import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Plus, Trash2, Copy, Check, Search,
    Layers, MonitorPlay, Bug, Sparkles, Flag, Command
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
    const [newCmd, setNewCmd] = useState({ title: '', content: '' });

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
            stageId: activeStage,
            createdAt: Date.now()
        };

        setCommands([command, ...commands]);
        setNewCmd({ title: '', content: '' });
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
        <div className="max-w-7xl mx-auto pt-10 px-6 h-full flex gap-8">
            {/* Sidebar / Stage Select */}
            <div className="w-64 shrink-0 flex flex-col gap-2">
                <div className="mb-8 px-4">
                    <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                        <Terminal size={20} />
                        Command Center
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your AI Prompts</p>
                </div>

                {DEV_STAGES.map(stage => {
                    const Icon = STAGE_ICONS[stage.id];
                    const count = commands.filter(c => c.stageId === stage.id).length;
                    const isActive = activeStage === stage.id;

                    return (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={`
                                flex items-center justify-between p-3 rounded-xl transition-all text-sm
                                ${isActive ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={16} />
                                <span>{stage.label}</span>
                            </div>
                            {count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col h-[calc(100vh-140px)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-light text-gray-900">{DEV_STAGES[activeStage - 1].title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{DEV_STAGES[activeStage - 1].desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search commands..."
                                className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none outline-none focus:ring-1 focus:ring-gray-900 w-64"
                            />
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-emerald-200 shadow-md"
                        >
                            <Plus size={16} /> New Command
                        </button>
                    </div>
                </div>

                {/* Command Grid */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <AnimatePresence>
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 border border-emerald-100 rounded-xl p-6 mb-6 overflow-hidden"
                            >
                                <input
                                    className="w-full bg-transparent text-lg font-medium outline-none mb-3 placeholder:text-gray-400"
                                    placeholder="Command Title (e.g., 'Generate API Logic')"
                                    autoFocus
                                    value={newCmd.title}
                                    onChange={e => setNewCmd({ ...newCmd, title: e.target.value })}
                                />
                                <textarea
                                    className="w-full bg-white rounded-lg p-4 text-sm font-mono text-gray-600 outline-none border border-gray-200 resize-y min-h-[120px]"
                                    placeholder="Enter your AI prompt here..."
                                    value={newCmd.content}
                                    onChange={e => setNewCmd({ ...newCmd, content: e.target.value })}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newCmd.title.trim() || !newCmd.content.trim()}
                                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Command
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {filteredCommands.map(cmd => (
                            <motion.div
                                key={cmd.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all relative"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-gray-900 transition-colors">
                                            <Command size={18} />
                                        </div>
                                        <h4 className="font-medium text-gray-900">{cmd.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(cmd.id, cmd.content)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                            title="Copy Prompt"
                                        >
                                            {copiedId === cmd.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cmd.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                    {cmd.content}
                                </div>
                            </motion.div>
                        ))}

                        {filteredCommands.length === 0 && !isAdding && (
                            <div className="text-center py-20 text-gray-300">
                                <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No commands in this stage yet.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CommandCenterModule;
