import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import Spotlight from '../../../../components/shared/Spotlight';
import { WRITING_CATEGORIES } from '../../../../utils/constants';

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onDelete, onUpdate }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredDocId, setHoveredDocId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); // Filter state

    // Filter documents based on search & category
    const filteredDocs = useMemo(() => {
        let docs = documents;

        // Category Filter
        if (selectedCategory) {
            docs = docs.filter(doc => (doc.category || 'draft') === selectedCategory);
        }

        // Search Filter
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            docs = docs.filter(doc =>
                (doc.title || '').toLowerCase().includes(lowerQ) ||
                (doc.content || '').toLowerCase().includes(lowerQ)
            );
        }
        return docs;
    }, [documents, searchQuery, selectedCategory]);

    // Group documents by date
    const groupedDocs = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            week: [],
            older: []
        };

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        filteredDocs.forEach(doc => {
            const ts = doc.timestamp || Date.now();
            if (ts >= todayStart) {
                groups.today.push(doc);
            } else if (ts >= yesterdayStart) {
                groups.yesterday.push(doc);
            } else if (ts >= weekStart) {
                groups.week.push(doc);
            } else {
                groups.older.push(doc);
            }
        });

        return groups;
    }, [filteredDocs]);

    const handleDelete = (doc) => {
        // Optimistic delete with Undo
        onDelete(doc.id);
        toast.success(t('inspiration.ideaDeleted'), {
            action: {
                label: t('common.undo'),
                onClick: () => onCreate(doc) // Re-create the doc (simplified undo)
            },
            duration: 4000
        });
    };

    const renderDocItem = (doc) => {
        const category = WRITING_CATEGORIES.find(c => c.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];
        const isActive = activeDocId === doc.id;

        return (
            <motion.div
                key={doc.id}
                layout
                onClick={() => onSelectDoc && onSelectDoc(doc.id)}
                onMouseEnter={() => setHoveredDocId(doc.id)}
                onMouseLeave={() => setHoveredDocId(null)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`
                    relative p-4 rounded-xl cursor-pointer mb-3 group/card
                    border transition-all duration-300
                    ${isActive
                        ? 'bg-white dark:bg-gray-800 shadow-md border-sky-200 dark:border-sky-800'
                        : 'bg-white/40 dark:bg-gray-800/40 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-[0_4px_20px_-4px_rgba(56,189,248,0.3)] hover:border-sky-100 dark:hover:border-sky-900'}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Category Indicator - Glowing Dot */}
                    <div className="relative mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${category.dotColor} ${isActive ? 'ring-2 ring-sky-200 dark:ring-sky-800 scale-110' : ''}`} />
                        {isActive && <div className={`absolute inset-0 w-1.5 h-1.5 rounded-full ${category.dotColor} animate-ping opacity-75`} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-700 dark:text-gray-200 group-hover/card:text-gray-900 dark:group-hover/card:text-white'}`}>
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-light tabular-nums">
                                {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed font-light group-hover/card:text-gray-500 dark:group-hover/card:text-gray-400">
                            {doc.content?.replace(/<[^>]*>?/gm, '') || t('inspiration.placeholder')}
                        </p>
                    </div>
                </div>

                {/* Delete Button - Premium position */}
                <AnimatePresence>
                    {hoveredDocId === doc.id && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc);
                            }}
                            className="absolute -top-1 -right-1 p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 shadow-lg rounded-full border border-gray-100 dark:border-gray-700 transition-all z-10 hover:scale-110"
                            title={t('common.delete')}
                        >
                            <Trash2 size={12} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const renderGroup = (titleKey, docs) => {
        if (docs.length === 0) return null;
        return (
            <div className="mb-6 last:mb-0">
                <h5 className="px-4 mb-3 text-[10px] uppercase font-bold text-gray-400/60 dark:text-gray-600 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-sky-300 dark:bg-sky-600 rounded-full" />
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h5>
                <div className="space-y-0">
                    {docs.map(renderDocItem)}
                </div>
            </div>
        );
    };

    return (
        <div className="w-80 h-full flex flex-col border-r border-white/20 dark:border-gray-800/50 bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl relative z-20">
            {/* Header: Title + Category Selector */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                        <h2 className="text-xl font-light text-gray-800 dark:text-gray-100 tracking-tight">
                            {t('inspiration.writing')}
                        </h2>
                        {/* Underline Glow */}
                        <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-sky-400/40 via-blue-400/20 to-transparent rounded-full blur-[2px]" />
                    </div>

                    {/* Gradient Capsule Category Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-gray-800/60 rounded-full border border-white/40 dark:border-gray-700/40 shadow-sm backdrop-blur-md">
                        {WRITING_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`
                                    w-3 h-3 rounded-full transition-all duration-300 relative
                                    ${cat.dotColor}
                                    ${selectedCategory === cat.id ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-sky-300 dark:ring-sky-700 scale-125' : 'opacity-40 hover:opacity-100 hover:scale-110'}
                                `}
                                title={cat.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Search - Spotlight Enhanced */}
                <div className="relative group mb-2 z-30">
                    <Spotlight className="rounded-2xl transition-all duration-300 focus-within:ring-1 focus-within:ring-sky-300 dark:focus-within:ring-sky-500" spotColor="rgba(56, 189, 248, 0.2)">
                        <div className="relative bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-sm border border-white/50 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden group-hover:border-sky-200 dark:group-hover:border-sky-800 transition-colors">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('inspiration.search')}
                                className="w-full bg-transparent border-none focus:ring-0 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400/70"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </Spotlight>
                </div>
            </div>

            {/* Document List - Masked for smoothness */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-32 mask-gradient-b">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 flex items-center justify-center mb-4 shadow-inner">
                            <FileText size={24} strokeWidth={1} className="text-sky-400 dark:text-sky-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t('inspiration.noDocs')}</span>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {renderGroup('today', groupedDocs.today)}
                        {renderGroup('yesterday', groupedDocs.yesterday)}
                        {renderGroup('week', groupedDocs.week)}
                        {renderGroup('older', groupedDocs.older)}
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom Actions - Floating style */}
            <div className="p-6 absolute bottom-0 w-full pointer-events-none z-30">
                <div className="pointer-events-auto">
                    <motion.button
                        onClick={() => onCreate(selectedCategory)}
                        whileHover={{ y: -2, scale: 1.02, shadow: "0 10px 30px -5px rgba(56, 189, 248, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ shadow: "0 4px 6px -1px rgba(56, 189, 248, 0.2)" }}
                        className="w-full py-4 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 blur-xl" />
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center relative z-10">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase relative z-10 shadow-sm">{t('inspiration.newDoc')}</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default WritingSidebar;
