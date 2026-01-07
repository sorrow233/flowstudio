import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Terminal, Tag, LayoutGrid, Monitor, Server, Database, Container, Beaker, ChevronDown, Filter } from 'lucide-react';
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedCmds = localStorage.getItem(STORAGE_KEYS.COMMANDS);
            if (savedCmds) setCommands(JSON.parse(savedCmds));
        }
    }, [isOpen]);

    const filteredCommands = commands.filter(cmd => {
        const matchesCategory = importCategory === 'all' || (cmd.category || 'general') === importCategory;
        const matchesSearch = cmd.title.toLowerCase().includes(importSearch.toLowerCase()) ||
            (cmd.content && cmd.content.toLowerCase().includes(importSearch.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const activeCategoryLabel = importCategory === 'all' ? 'All Commands' : COMMAND_CATEGORIES.find(c => c.id === importCategory)?.label;

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
                        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-medium text-gray-900">Import Command</h3>
                                <p className="text-sm text-gray-500 mt-1">Add pre-configured commands to your task list.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & Simplified Filter */}
                        <div className="p-4 border-b border-gray-100 bg-white flex gap-3 items-center z-10 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search commands..."
                                    value={importSearch}
                                    onChange={e => setImportSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none text-sm"
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${importCategory !== 'all' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <Filter size={14} />
                                    <span>{activeCategoryLabel}</span>
                                    <ChevronDown size={14} className={`transition-transformDuration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-0" onClick={() => setIsFilterOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10 py-1"
                                            >
                                                <button
                                                    onClick={() => { setImportCategory('all'); setIsFilterOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${importCategory === 'all' ? 'text-emerald-600 font-medium bg-emerald-50/50' : 'text-gray-600'}`}
                                                >
                                                    <LayoutGrid size={14} /> All Commands
                                                </button>
                                                <div className="h-px bg-gray-100 my-1" />
                                                {COMMAND_CATEGORIES.map(cat => {
                                                    const Icon = CATEGORY_ICONS[cat.icon] || LayoutGrid;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => { setImportCategory(cat.id); setIsFilterOpen(false); }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${importCategory === cat.id ? 'text-emerald-600 font-medium bg-emerald-50/50' : 'text-gray-600'}`}
                                                        >
                                                            <Icon size={14} /> {cat.label}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Command List (Simplified) */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-3">
                                {filteredCommands.map(cmd => {
                                    const CatIcon = CATEGORY_ICONS[COMMAND_CATEGORIES.find(c => c.id === (cmd.category || 'general'))?.icon] || LayoutGrid;

                                    return (
                                        <div
                                            key={cmd.id}
                                            onClick={() => onImport(cmd)}
                                            className="group bg-white border border-gray-100 p-4 rounded-xl hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer transition-all relative"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cmd.category === 'backend' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'} transition-colors`}>
                                                        <Terminal size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">{cmd.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                                                                <CatIcon size={8} /> {cmd.category || 'general'}
                                                            </span>
                                                            {cmd.tags && cmd.tags.length > 0 && (
                                                                <div className="flex gap-1">
                                                                    {cmd.tags.slice(0, 3).map(tag => (
                                                                        <span key={tag.id} className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                                                            <Tag size={8} /> {tag.label}
                                                                        </span>
                                                                    ))}
                                                                    {cmd.tags.length > 3 && <span className="text-[10px] text-gray-400">+{cmd.tags.length - 3}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Hidden hover action */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Add +</span>
                                                </div>
                                            </div>
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
