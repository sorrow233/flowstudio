import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
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
                className={`
                    relative p-4 rounded-2xl cursor-pointer transition-all duration-300 group mb-2
                    ${isActive
                        ? 'bg-white dark:bg-gray-800 shadow-sm border border-sky-300 dark:border-sky-700 ring-1 ring-sky-300/20'
                        : 'hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Category Indicator */}
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${category.dotColor} opacity-40 group-hover:opacity-100 transition-opacity`} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-light tabular-nums">
                                {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed font-light">
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
                            className="absolute -top-1 -right-1 p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 shadow-lg rounded-full border border-gray-100 dark:border-gray-700 transition-all z-10"
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
            <div className="mb-8 last:mb-0">
                <h5 className="px-4 mb-3 text-[10px] uppercase font-bold text-gray-400/60 tracking-[0.2em] flex items-center gap-2">
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
        <div className="w-80 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 relative">
            {/* Header: Title + Category Selector */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                        <h2 className="text-xl font-light text-gray-800 dark:text-gray-100 tracking-tight">
                            {t('inspiration.writing')}
                        </h2>
                        <div className="absolute -bottom-1 left-0 w-2/3 h-1 bg-gradient-to-r from-sky-300/60 to-transparent rounded-full blur-[1px]" />
                    </div>

                    {/* Minimal Category Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                        {WRITING_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`
                                    w-3 h-3 rounded-full transition-all duration-300 relative
                                    ${cat.dotColor}
                                    ${selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-sky-200 dark:ring-sky-800 scale-110' : 'opacity-30 hover:opacity-100'}
                                `}
                                title={cat.label}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative group mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('inspiration.search')}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none transition-all placeholder:text-gray-400"
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
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-32 mask-gradient-b">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-40">
                        <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-900/10 flex items-center justify-center mb-4">
                            <FileText size={24} strokeWidth={1} className="text-sky-300 dark:text-sky-600" />
                        </div>
                        <span className="text-xs font-light tracking-wide">{t('inspiration.noDocs')}</span>
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
            <div className="p-6 absolute bottom-0 w-full pointer-events-none">
                <div className="pointer-events-auto">
                    <motion.button
                        onClick={() => onCreate(selectedCategory)}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase">{t('inspiration.newDoc')}</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default WritingSidebar;
