import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Globe2, Download, Terminal, Link as LinkIcon,
    Loader2, RefreshCw, User, Clock, Tag, ChevronDown,
    LayoutGrid, Monitor, Server, Database, Container, Beaker
} from 'lucide-react';
import { shareService } from '../shareService';
import { COMMAND_CATEGORIES } from '../../../utils/constants';

const CATEGORY_ICONS = {
    'LayoutGrid': LayoutGrid,
    'Monitor': Monitor,
    'Server': Server,
    'Database': Database,
    'Container': Container,
    'Beaker': Beaker
};

const ShareBrowserModal = ({ isOpen, onClose, onImport }) => {
    const [shares, setShares] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [importingId, setImportingId] = useState(null);

    const loadShares = useCallback(async (reset = true) => {
        setIsLoading(true);
        try {
            const result = await shareService.getPublicShares({
                pageSize: 20,
                lastDoc: reset ? null : lastDoc,
                category: selectedCategory !== 'all' ? selectedCategory : null,
            });

            if (reset) {
                setShares(result.shares);
            } else {
                setShares(prev => [...prev, ...result.shares]);
            }
            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error('Load shares error:', err);
            if (err.code === 'permission-denied') {
                // Ideally show a toast or UI message, for now logging is the first step, 
                // but let's make it clearer in the console at least.
                console.error('Permission denied. Please ensure firestore.rules are deployed.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [lastDoc, selectedCategory]);

    useEffect(() => {
        if (isOpen) {
            loadShares(true);
        }
    }, [isOpen, selectedCategory]);

    const handleImport = async (share) => {
        setImportingId(share.id);
        try {
            // Increment download count
            await shareService.incrementDownloads(share.id);

            // Call parent import handler with the command
            onImport({
                ...share.command,
                id: undefined, // Generate new ID on import
                stageIds: [], // Will be assigned by parent
            });

            // Brief success feedback
            setTimeout(() => setImportingId(null), 500);
        } catch (err) {
            console.error('Import error:', err);
            setImportingId(null);
        }
    };

    const filteredShares = shares.filter(share => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            share.command.title.toLowerCase().includes(q) ||
            share.description?.toLowerCase().includes(q) ||
            share.author.displayName?.toLowerCase().includes(q)
        );
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                        <Globe2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900">社区分享库</h3>
                                        <p className="text-sm text-gray-500">发现并导入其他开发者的配置</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/80 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="p-4 border-b border-gray-100 bg-white flex gap-3 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="搜索命令..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all outline-none text-sm"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-full">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${selectedCategory === 'all'
                                        ? 'bg-white text-gray-900 shadow-md scale-110'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                        }`}
                                >
                                    ALL
                                </button>
                                <div className="w-px h-4 bg-gray-300/50" />
                                {COMMAND_CATEGORIES.map(cat => {
                                    const Icon = CATEGORY_ICONS[cat.icon] || LayoutGrid;
                                    return (
                                        <div key={cat.id} className="relative group/cat">
                                            <button
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${selectedCategory === cat.id
                                                    ? 'bg-white shadow-md scale-110'
                                                    : 'hover:bg-white/50 hover:scale-105'
                                                    }`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0]}`} />
                                            </button>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/cat:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                {cat.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Refresh */}
                            <button
                                onClick={() => loadShares(true)}
                                disabled={isLoading}
                                className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Share List */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                            {isLoading && shares.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={32} className="animate-spin text-violet-500" />
                                </div>
                            ) : filteredShares.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <Globe2 size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">暂无分享内容</p>
                                    <p className="text-sm mt-1">成为第一个分享者吧！</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredShares.map(share => {
                                        const CatIcon = CATEGORY_ICONS[
                                            COMMAND_CATEGORIES.find(c => c.id === share.command.category)?.icon
                                        ] || LayoutGrid;
                                        const catColor = COMMAND_CATEGORIES.find(c => c.id === share.command.category)?.color || 'bg-gray-400 text-white';

                                        return (
                                            <motion.div
                                                key={share.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-violet-100/50 hover:border-violet-200 transition-all"
                                            >
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${share.command.type === 'link'
                                                            ? 'bg-blue-50 text-blue-500'
                                                            : 'bg-gray-50 text-gray-500 group-hover:bg-violet-50 group-hover:text-violet-500'
                                                            } transition-colors`}>
                                                            {share.command.type === 'link' ? <LinkIcon size={18} /> : <Terminal size={18} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 group-hover:text-violet-700 transition-colors">
                                                                {share.command.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColor.split(' ')[0]} bg-opacity-20 text-gray-600`}>
                                                                    {share.command.category}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <Download size={10} /> {share.downloads || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                {share.description && (
                                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                        {share.description}
                                                    </p>
                                                )}

                                                {/* Content Preview */}
                                                <pre className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-x-auto font-mono mb-4 line-clamp-2">
                                                    {share.command.content || share.command.url}
                                                </pre>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {share.author.photoURL ? (
                                                            <img
                                                                src={share.author.photoURL}
                                                                alt=""
                                                                className="w-6 h-6 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <User size={12} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-gray-500">{share.author.displayName}</span>
                                                        <span className="text-xs text-gray-300">·</span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {formatDate(share.createdAt)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleImport(share)}
                                                        disabled={importingId === share.id}
                                                        className="px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-violet-500 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {importingId === share.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Download size={14} />
                                                        )}
                                                        导入
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Load More */}
                            {hasMore && !isLoading && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => loadShares(false)}
                                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <ChevronDown size={16} />
                                        加载更多
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShareBrowserModal;
