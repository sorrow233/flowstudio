import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText, Check, X } from 'lucide-react';
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
        <div className="relative group overflow-hidden mb-1.5 mx-2">
            {/* Action Layer Below (Delete) */}
            <motion.div
                style={{ backgroundColor: deleteBackgroundColor }}
                className="absolute inset-0 rounded-2xl flex items-center justify-end px-6 z-0"
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
                dragConstraints={{ left: -150, right: 0 }}
                dragElastic={{ left: 0.15, right: 0.05 }} // Tighter, more "跟手" feel
                onDragEnd={(e, info) => {
                    // Accidental touch protection: must swipe at least 80px AND have high velocity, 
                    // or swipe a full 160px regardless of velocity.
                    const isSwipeDelete = (info.offset.x < -160) || (info.offset.x < -80 && info.velocity.x < -600);

                    if (isSwipeDelete) {
                        onDelete(doc);
                    }
                }}
                onClick={() => onSelect(doc.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                    x: { type: "spring", stiffness: 600, damping: 25 }, // Premium spring
                    opacity: { duration: 0.2 }
                }}
                className={`
                    relative z-10 p-5 rounded-2xl cursor-pointer transition-shadow duration-300
                    border border-transparent select-none active:scale-[0.99]
                    ${isActive
                        ? 'bg-white/95 dark:bg-gray-800/95 shadow-[0_12px_24px_-8px_rgba(56,189,248,0.25)] border-sky-200/50 dark:border-sky-500/20'
                        : 'bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors'}
                `}
            >
                <div className="flex items-start gap-4">
                    {/* Category Indicator - Status Glow */}
                    <div className="relative mt-2 flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${category.dotColor} shadow-sm ${isActive ? 'ring-2 ring-sky-200 dark:ring-sky-800 scale-125' : ''}`} />
                        {isActive && (
                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${category.dotColor} animate-ping opacity-50`} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-[15px] font-semibold truncate tracking-tight transition-colors ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-800 dark:text-gray-100 group-hover:text-sky-500 dark:group-hover:text-sky-400'}`}>
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tabular-nums bg-gray-50 dark:bg-gray-900/40 px-1.5 py-0.5 rounded-md">
                                {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className={`text-[13px] line-clamp-2 leading-relaxed transition-colors ${isActive ? 'text-sky-600/70 dark:text-sky-400/70' : 'text-gray-500 dark:text-gray-400 font-light'}`}>
                            {doc.content?.replace(/<[^>]*>?/gm, '') || t('inspiration.placeholder')}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onDelete, onUpdate, isMobile }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // ... same filtering logic
    const filteredDocs = useMemo(() => {
        let docs = documents;
        if (selectedCategory) {
            docs = docs.filter(doc => (doc.category || 'draft') === selectedCategory);
        }
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            docs = docs.filter(doc =>
                (doc.title || '').toLowerCase().includes(lowerQ) ||
                (doc.content || '').toLowerCase().includes(lowerQ)
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
                onClick: () => onCreate(doc)
            },
            duration: 4000
        });
    };

    const renderGroup = (titleKey, docs) => {
        if (docs.length === 0) return null;
        return (
            <div className="mb-8 last:mb-0">
                <h5 className="px-5 mb-4 text-[11px] uppercase font-bold text-gray-400/70 dark:text-gray-600 tracking-[0.2em] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-[1px] bg-sky-200 dark:bg-sky-800" />
                        {t(`inspiration.timeGroup.${titleKey}`)}
                    </span>
                    <span className="text-[9px] font-normal opacity-50 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                        {docs.length}
                    </span>
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
            h-full flex flex-col relative z-20 shadow-2xl
            border-r border-white/20 dark:border-gray-800/50 
            bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl
            ${isMobile ? 'w-full rounded-tr-[32px] sm:rounded-none' : 'w-[340px] bg-white/20 dark:bg-gray-900/40'}
        `}>
            <div className={`${isMobile ? 'p-4 pb-2' : 'p-8 pb-4'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900 dark:text-white tracking-tight`}>
                                {t('inspiration.writing')}
                            </h2>
                            <div className="absolute -bottom-1 left-0 w-6 h-1 bg-sky-500 rounded-full" />
                        </div>
                        <motion.button
                            onClick={() => onCreate(selectedCategory)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-colors"
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={18} strokeWidth={3} />
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMobile ? (
                            <div className="flex items-center gap-1.5 p-1 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/40 dark:border-gray-700/40 shadow-inner">
                                {WRITING_CATEGORIES.slice(0, 3).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${cat.dotColor} ${selectedCategory === cat.id ? 'ring-2 ring-sky-400 scale-110' : 'opacity-30'}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-inner backdrop-blur-md">
                                {WRITING_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                        className={`
                                            w-4 h-4 rounded-lg transition-all duration-500 relative
                                            ${cat.dotColor}
                                            ${selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-sky-400 scale-125' : 'opacity-30 hover:opacity-100 grayscale-[0.5] hover:grayscale-0'}
                                        `}
                                        title={cat.label}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative group mb-4 z-30">
                    <Spotlight className="rounded-xl" spotColor="rgba(56, 189, 248, 0.15)">
                        <div className="relative bg-white/40 dark:bg-gray-800/40 rounded-xl border border-white/60 dark:border-gray-700/30 backdrop-blur-md overflow-hidden transition-all duration-500 shadow-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('inspiration.search')}
                                className="w-full bg-transparent border-none focus:ring-0 rounded-xl pl-9 pr-3 py-2 text-[13px] text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400/50"
                            />
                        </div>
                    </Spotlight>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar pb-32 ${isMobile ? 'px-3' : 'px-5'}`}>
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-30">
                        <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-800/40 flex items-center justify-center mb-6 shadow-inner">
                            <FileText size={32} strokeWidth={1} className="text-gray-400" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-400 tracking-wide">{t('inspiration.noDocs')}</span>
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

            {/* Bottom Blur Mask */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/40 dark:from-gray-900/40 to-transparent pointer-events-none z-30" />
        </div>
    );
};

export default WritingSidebar;
