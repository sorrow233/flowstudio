import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Terminal, Tag, LayoutGrid, Monitor, Server, Database, Container, Beaker } from 'lucide-react';
import { STORAGE_KEYS, COMMAND_CATEGORIES } from '../../../../utils/constants';

const CATEGORY_ICONS = {
    'LayoutGrid': LayoutGrid,
    'Monitor': Monitor,
    'Server': Server,
    'Database': Database,
    'Container': Container,
    'Beaker': Beaker
};

const ImportCommandModal = ({ isOpen, onClose, onImport }) => {
    const [commands, setCommands] = useState([]);
    const [importCategory, setImportCategory] = useState('all');
    const [importSearch, setImportSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            const savedCmds = localStorage.getItem(STORAGE_KEYS.COMMANDS);
            if (savedCmds) setCommands(JSON.parse(savedCmds));
        }
    }, [isOpen]);

    const filteredCommands = commands.filter(cmd => {
        const matchesCategory = importCategory === 'all' || (cmd.category || 'general') === importCategory;
        const matchesSearch = cmd.title.toLowerCase().includes(importSearch.toLowerCase()) ||
            cmd.content.toLowerCase().includes(importSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10 pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-light text-gray-900">Import Command</h3>
                                <p className="text-sm text-gray-500 mt-1">Select a command to add to your project workflow.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search commands..."
                                    value={importSearch}
                                    onChange={e => setImportSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                />
                            </div>

                            {/* Category Pills */}
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                                <button
                                    onClick={() => setImportCategory('all')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${importCategory === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    All
                                </button>
                                {COMMAND_CATEGORIES.map(cat => {
                                    const Icon = CATEGORY_ICONS[cat.icon];
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setImportCategory(cat.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${importCategory === cat.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {Icon && <Icon size={14} />} {cat.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Command List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-4">
                                {filteredCommands.map(cmd => {
                                    const CatIcon = CATEGORY_ICONS[COMMAND_CATEGORIES.find(c => c.id === (cmd.category || 'general'))?.icon] || LayoutGrid;

                                    return (
                                        <div
                                            key={cmd.id}
                                            onClick={() => onImport(cmd)}
                                            className="group bg-white border border-gray-100 p-5 rounded-2xl hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer transition-all relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cmd.category === 'backend' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'} transition-colors`}>
                                                        <Terminal size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{cmd.title}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                <CatIcon size={10} /> {cmd.category || 'general'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono text-gray-300 bg-gray-50 px-2 py-1 rounded">CMD</span>
                                            </div>

                                            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-gray-300 overflow-x-auto custom-scrollbar group-hover:bg-black transition-colors">
                                                <code>{cmd.content}</code>
                                            </div>

                                            {/* Tags Preview */}
                                            {cmd.tags && cmd.tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {cmd.tags.map(tag => (
                                                        <span key={tag.id}
                                                            onClick={(e) => { e.stopPropagation(); onImport(cmd, tag); }}
                                                            className="text-[10px] flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 rounded border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                                        >
                                                            <Tag size={10} /> {tag.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {filteredCommands.length === 0 && (
                                    <div className="text-center py-20 text-gray-400">
                                        <Search size={40} className="mx-auto mb-4 opacity-20" />
                                        <p>No commands found matching filters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImportCommandModal;
