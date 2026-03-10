import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Settings2 } from 'lucide-react';

const InspirationCategorySelector = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
    onOpenManager,
    onTodoDoubleClick,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const selectorRef = useRef(null);
    const selectedCategoryInfo = useMemo(
        () => categories.find((category) => category.id === selectedCategory) || categories[0] || null,
        [categories, selectedCategory]
    );

    useEffect(() => {
        if (!isMenuOpen) return undefined;

        const handlePointerDown = (event) => {
            if (selectorRef.current?.contains(event.target)) return;
            setIsMenuOpen(false);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [selectedCategory]);

    if (categories.length === 0 || !selectedCategoryInfo) {
        return null;
    }

    return (
        <div
            ref={selectorRef}
            className="flex items-center p-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-full border border-gray-100/50 dark:border-gray-800/50 shadow-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:shadow-md hover:border-pink-100/30 dark:hover:border-pink-900/30 group/selector"
        >
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 border-r border-gray-200/50 dark:border-gray-700/50 mr-1 min-w-[76px] justify-center relative overflow-hidden h-7 rounded-l-full transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60"
                    title="打开分类列表"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={selectedCategory}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`max-w-[72px] truncate text-xs font-medium ${selectedCategoryInfo.textColor || 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {selectedCategoryInfo.label || 'Inspiration'}
                        </motion.span>
                    </AnimatePresence>
                    <ChevronDown
                        size={12}
                        className={`shrink-0 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            className="absolute left-0 top-[calc(100%+8px)] z-40 min-w-[168px] rounded-2xl border border-pink-100/70 bg-white/95 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-gray-700/70 dark:bg-gray-900/95"
                        >
                            <div className="flex flex-col gap-1">
                                {categories.map((category) => {
                                    const isActive = selectedCategory === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                                onSelectCategory?.(category.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${isActive
                                                ? 'bg-pink-50 text-gray-900 dark:bg-gray-800/90 dark:text-white'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/70'
                                                }`}
                                        >
                                            <span className={`h-2.5 w-2.5 rounded-full ${category.dotColor}`} />
                                            <span className={`flex-1 truncate text-sm font-medium ${category.textColor || ''}`}>
                                                {category.label}
                                            </span>
                                            {isActive && <Check size={14} className="text-pink-400 dark:text-pink-300" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 w-[140px] md:w-auto overflow-x-auto md:overflow-visible no-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onSelectCategory?.(category.id)}
                            onDoubleClick={() => {
                                if (category.id === 'todo' && selectedCategory === category.id) {
                                    onTodoDoubleClick?.();
                                }
                            }}
                            className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group/dot flex-shrink-0"
                            title={category.id === 'todo'
                                ? `${category.label} · 双击打开 AI 批量导入`
                                : category.label}
                        >
                            {selectedCategory === category.id && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div
                                className={`
                                    relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-300
                                    ${category.dotColor}
                                    ${selectedCategory === category.id ? 'scale-110' : 'opacity-40 group-hover/dot:opacity-100 group-hover/dot:scale-110'}
                                `}
                            />
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onOpenManager}
                    className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group/settings hover:bg-gray-100 dark:hover:bg-gray-800 ml-1 flex-shrink-0"
                    title="管理分类"
                >
                    <Settings2 size={14} className="text-gray-400 group-hover/settings:text-gray-600 dark:group-hover/settings:text-gray-300 transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default InspirationCategorySelector;
