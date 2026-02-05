import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../../../i18n';
import Spotlight from '../../../../components/shared/Spotlight';
import { WRITING_CATEGORIES } from '../../../../utils/constants';

// --- Sub-component to ensure Hooks work correctly and provide premium feel ---
const WritingSidebarItem = ({ doc, isActive, onSelect, onDelete, t }) => {
    const category = WRITING_CATEGORIES.find(c => c.id === (doc.category || 'draft')) || WRITING_CATEGORIES[0];

    // Precise motion values for "fluid" follow-finger feel
    const x = useMotionValue(0);

    // Background color: transparent to vibrant ruby
    const deleteBackgroundColor = useTransform(x, [0, -60, -150], ['rgba(244, 63, 94, 0)', 'rgba(244, 63, 94, 0.4)', 'rgba(244, 63, 94, 1)']);

    // Icon scaling and opacity: only visible when swiping deep enough
    const deleteIconOpacity = useTransform(x, [0, -40, -100], [0, 0, 1]);
    const deleteIconScale = useTransform(x, [0, -40, -120], [0.6, 0.6, 1.1]);
    const deleteIconRotate = useTransform(x, [0, -150], [0, -15]);

    return (
        <div className="relative group overflow-hidden mb-2 mx-3">
            {/* Action Layer Below (Delete) */}
            <motion.div
                style={{ backgroundColor: deleteBackgroundColor }}
                className="absolute inset-0 rounded-xl flex items-center justify-end px-6 z-0"
            >
                <motion.div style={{ opacity: deleteIconOpacity, scale: deleteIconScale, rotate: deleteIconRotate }}>
                    <Trash2 className="text-white w-5 h-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]" />
                </motion.div>
            </motion.div>

            {/* Content Layer Above (Fluid & Snappy) */}
            <motion.div
                layout
                style={{ x }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.2, right: 0.05 }}
                onDragEnd={(e, info) => {
                    const isSwipeDelete = (info.offset.x < -180) || (info.offset.x < -60 && info.velocity.x < -400);
                    if (isSwipeDelete) {
                        onDelete(doc);
                    }
                }}
                onClick={() => onSelect(doc.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                    x: { type: "spring", stiffness: 600, damping: 25 },
                    opacity: { duration: 0.2 }
                }}
                className={`
                    relative z-10 p-4 rounded-xl cursor-pointer transition-all duration-300
                    border border-transparent select-none active:scale-[0.99] touch-none overflow-hidden
                    ${isActive
                        ? 'bg-rose-50/80 dark:bg-rose-900/20 shadow-sm border-rose-200/50 dark:border-rose-500/20'
                        : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Category Indicator */}
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${category.dotColor} ${isActive ? 'ring-2 ring-rose-200 dark:ring-rose-800' : ''}`} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-[14px] font-semibold truncate tracking-tight transition-colors ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            {/* Optional: Add time if needed, but keeping it clean for now */}
                        </div>
                        <p className={`text-[12px] line-clamp-2 leading-relaxed ${isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {stripMarkup(doc.content) || t('inspiration.placeholder')}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                                {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const stripMarkup = (text = '') => {
    if (!text) return '';
    const withoutHighlights = text.replace(/#!([^:]+):([^#]+)#/g, '$2');
    return withoutHighlights.replace(/<[^>]*>?/gm, '');
};

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onDelete, onRestore, onUpdate, onClose, isMobile }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filteredDocs = useMemo(() => {
        let docs = documents;
        if (selectedCategory) {
            docs = docs.filter(doc => (doc.category || 'draft') === selectedCategory);
        }
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            docs = docs.filter(doc =>
                (doc.title || '').toLowerCase().includes(lowerQ) ||
                stripMarkup(doc.content || '').toLowerCase().includes(lowerQ)
            );
        }
        return docs;
    }, [documents, searchQuery, selectedCategory]);

    const groupedDocs = useMemo(() => {
        const groups = { today: [], yesterday: [], week: [], older: [] };
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        filteredDocs.forEach(doc => {
            const ts = doc.timestamp || Date.now();
            if (ts >= todayStart) groups.today.push(doc);
            else if (ts >= yesterdayStart) groups.yesterday.push(doc);
            else if (ts >= weekStart) groups.week.push(doc);
            else groups.older.push(doc);
        });
        return groups;
    }, [filteredDocs]);

    const handleDelete = (doc) => {
        onDelete(doc.id);
        toast.info(t('inspiration.ideaDeleted'), {
            icon: <Trash2 className="w-4 h-4 text-rose-500" />,
            action: {
                label: t('common.undo'),
                onClick: () => {
                    if (onRestore) {
                        onRestore(doc);
                    } else {
                        onCreate(doc);
                    }
                }
            },
            duration: 4000
        });
    };

    const renderGroup = (titleKey, docs) => {
        if (docs.length === 0) return null;
        return (
            <div className="mb-6 last:mb-0">
                <h5 className="px-6 mb-3 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-2">
                    {t(`inspiration.timeGroup.${titleKey}`)}
                    <span className="w-full h-[1px] bg-gray-100 dark:bg-gray-800/50" />
                </h5>
                <div className="space-y-0">
                    {docs.map(doc => (
                        <WritingSidebarItem
                            key={doc.id}
                            doc={doc}
                            isActive={activeDocId === doc.id}
                            onSelect={onSelectDoc}
                            onDelete={handleDelete}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`
            h-full flex flex-col relative z-20
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-r border-gray-200/50 dark:border-gray-800/50
            ${isMobile ? 'w-full shadow-2xl' : 'w-[320px]'}
        `}>
            {/* Safe area padding for mobile top */}
            {isMobile && <div className="h-4" />}

            <div className="px-5 pt-8 pb-4 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight flex items-center gap-2">
                        {isMobile && (
                            <button onClick={onClose} className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        {t('inspiration.writing')}
                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {documents.length}
                        </span>
                    </h2>

                    <motion.button
                        onClick={() => onCreate(selectedCategory)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </motion.button>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('inspiration.search')}
                        className="w-full bg-gray-100/50 dark:bg-gray-800/50 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-rose-200 dark:focus:border-rose-800 rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {WRITING_CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                                className={`
                                    flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border
                                    ${isSelected
                                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                        : 'bg-white dark:bg-gray-800/50 text-gray-500 border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'}
                                `}
                            >
                                {cat.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 opacity-40">
                        <FileText size={40} strokeWidth={1} className="text-gray-300 mb-3" />
                        <span className="text-xs text-gray-400">{t('inspiration.noDocs')}</span>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {renderGroup('today', groupedDocs.today)}
                        {renderGroup('yesterday', groupedDocs.yesterday)}
                        {renderGroup('week', groupedDocs.week)}
                        {renderGroup('older', groupedDocs.older)}
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom Gradient for fade out */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
        </div>
    );
};

export default WritingSidebar;
