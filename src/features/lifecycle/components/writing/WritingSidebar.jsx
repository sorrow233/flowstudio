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
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.2, right: 0.05 }} // Elastic for that premium snap-back feel
                onDragEnd={(e, info) => {
                    // Optimized for iOS: lower thresholds for better responsiveness
                    // Match InspirationItem's logic for consistency
                    const isSwipeDelete = (info.offset.x < -180) || (info.offset.x < -60 && info.velocity.x < -400);

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
                    relative z-10 p-5 rounded-2xl cursor-pointer transition-all duration-300
                    border border-transparent select-none active:scale-[0.99] touch-none overflow-hidden
                    before:absolute before:left-2 before:top-4 before:bottom-4 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-rose-400 before:to-pink-500 before:opacity-0 before:transition-opacity
                    ${isActive
                        ? 'bg-white/95 dark:bg-gray-800/95 shadow-[0_16px_32px_-14px_rgba(244,63,94,0.35)] border-rose-200/50 dark:border-rose-500/20 before:opacity-100'
                        : 'bg-white/40 dark:bg-gray-900/40 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:shadow-[0_14px_26px_-18px_rgba(244,63,94,0.25)] before:group-hover:opacity-40'}
                `}
            >
                <div className="flex items-start gap-4">
                    {/* Category Indicator - Status Glow */}
                    <div className="relative mt-2 flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${category.dotColor} shadow-sm ${isActive ? 'ring-2 ring-rose-200 dark:ring-rose-800 scale-125' : ''}`} />
                        {isActive && (
                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${category.dotColor} animate-ping opacity-50`} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-[15px] font-semibold truncate tracking-tight transition-colors ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-800 dark:text-gray-100 group-hover:text-rose-500 dark:group-hover:text-rose-400'}`}>
                                {doc.title || t('inspiration.untitled')}
                            </h4>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tabular-nums bg-gray-50 dark:bg-gray-900/40 px-1.5 py-0.5 rounded-md">
                                {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className={`text-[13px] line-clamp-2 leading-relaxed transition-colors ${isActive ? 'text-rose-600/70 dark:text-rose-400/70' : 'text-gray-500 dark:text-gray-400 font-light'}`}>
                            {stripMarkup(doc.content) || t('inspiration.placeholder')}
                        </p>
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
            <div className="mb-8 last:mb-0">
                <h5 className="px-5 mb-4 text-[11px] uppercase font-bold text-gray-400/70 dark:text-gray-600 tracking-[0.2em] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-[1px] bg-rose-200 dark:bg-rose-800" />
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
            h-full flex flex-col relative z-20
            bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl
            ${isMobile ? 'w-full rounded-r-[28px] border-r border-black/5 dark:border-white/10 shadow-[-18px_0_44px_-20px_rgba(0,0,0,0.12)]' : 'w-[336px] bg-white/75 dark:bg-slate-900/75 border-r border-black/5 dark:border-white/10 shadow-[16px_0_40px_-34px_rgba(0,0,0,0.25)]'}
        `}>
            {/* Safe area padding for mobile top */}
            {isMobile && <div className="h-4" />}

            <div className={`${isMobile ? 'px-4 py-2' : 'p-8 pb-4'}`}>
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between mb-8'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900 dark:text-white tracking-tight`}>
                                    {t('inspiration.writing')}
                                </h2>
                                <div className="absolute -bottom-1 left-0 w-6 h-1 bg-rose-500 rounded-full" />
                            </div>
                        </div>

                        <motion.button
                            onClick={() => onCreate(selectedCategory)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${isMobile ? 'w-10 h-10' : 'w-9 h-9'} flex items-center justify-center bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors`}
                            title={t('inspiration.newDoc')}
                        >
                            <Plus size={isMobile ? 22 : 20} strokeWidth={3} />
                        </motion.button>
                    </div>

                    <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-3'}`}>
                        <div className="flex items-center gap-2 p-1.5 bg-gray-100/60 dark:bg-gray-800/60 rounded-2xl border border-white/50 dark:border-gray-700/40 shadow-inner backdrop-blur-md">
                            {WRITING_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                    className={`
                                        w-4 h-4 rounded-lg transition-all duration-500 relative
                                        ${cat.dotColor}
                                        ${selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-rose-400 scale-125' : 'opacity-30 hover:opacity-100 grayscale-[0.5] hover:grayscale-0'}
                                    `}
                                    title={cat.label}
                                />
                            ))}
                        </div>

                        {isMobile && (
                            <button
                                onClick={() => onClose?.()}
                                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 active:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative group mt-6 mb-4 z-30">
                    <Spotlight className="rounded-2xl" spotColor="rgba(244, 114, 182, 0.15)">
                        <div className="relative bg-white/60 dark:bg-gray-800/50 rounded-2xl border border-white/70 dark:border-gray-700/40 backdrop-blur-md overflow-hidden transition-all duration-500 shadow-sm focus-within:shadow-[0_14px_30px_-18px_rgba(244,63,94,0.35)] focus-within:border-rose-200/80 dark:focus-within:border-rose-800/40">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('inspiration.search')}
                                className="w-full bg-transparent border-none focus:ring-0 rounded-2xl pl-11 pr-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400/50"
                            />
                        </div>
                    </Spotlight>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar pb-32 ${isMobile ? 'px-4' : 'px-5'}`}>
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
