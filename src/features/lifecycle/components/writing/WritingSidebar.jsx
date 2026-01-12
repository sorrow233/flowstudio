import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../../i18n';
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
                    relative p-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${activeDocId === doc.id
                        ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}
                `}
            >
                <div className="flex items-start gap-2">
                    {/* Category Dot */}
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${category.dotColor}`} title={category.label} />

                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium mb-0.5 truncate ${activeDocId === doc.id ? 'text-pink-600 dark:text-pink-300' : 'text-gray-700 dark:text-gray-200'}`}>
                            {doc.title || t('inspiration.untitled')}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-light h-4 opacity-80">
                            {doc.content?.replace(/<[^>]*>?/gm, '') || t('inspiration.placeholder')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 opacity-60 pl-3.5">
                    <span className="text-[10px] text-gray-400">
                        {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Delete Button - Only visible on hover or active */}
                <AnimatePresence>
                    {(hoveredDocId === doc.id) && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc);
                            }}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                            title={t('common.delete')}
                        >
                            <Trash2 size={13} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const renderGroup = (titleKey, docs) => {
        if (docs.length === 0) return null;
        return (
            <div className="mb-6">
                <h5 className="px-3 mb-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider opacity-70">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                </h5>
                <div className="space-y-1">
                    {docs.map(renderDocItem)}
                </div>
            </div>
        );
    };

    return (
        <div className="w-72 h-full flex flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-xl">
            {/* Header: Title + Category Dots */}
            <div className="p-5 pb-2">
                {/* Category Filter */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                        {t('inspiration.writing')}
                    </h2>
                    <div className="flex items-center -space-x-1">
                        {WRITING_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`
                                    w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-300 hover:scale-110 hover:z-10 relative
                                    ${cat.color}
                                    ${selectedCategory === cat.id ? 'scale-110 z-10 ring-2 ring-offset-1 ring-gray-200 dark:ring-gray-700' : 'opacity-70 hover:opacity-100'}
                                `}
                                title={cat.label}
                            />
                        ))}
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative group mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('inspiration.search')}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-pink-300 dark:focus:border-pink-800 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-900/20 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar pb-20 mask-gradient-b">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
                        <FileText size={40} strokeWidth={1} className="mb-3 text-gray-300" />
                        <span className="text-sm font-light">{t('inspiration.noDocs')}</span>
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

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md absolute bottom-0 w-full">
                <motion.button
                    onClick={() => onCreate(selectedCategory)} // Pass selected category to create
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span className="text-sm font-semibold tracking-wide">{t('inspiration.newDoc')}</span>
                </motion.button>
            </div>
        </div>
    );
};

export default WritingSidebar;
