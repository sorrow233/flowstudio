import React from 'react';
import { motion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { WRITING_HIGHLIGHT_COLORS } from './writingHighlightColors';

const FloatingColorPicker = ({ position, onApplyColor, onClearColor, isMobile, t }) => {
    if (!position) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            style={{ top: position.top, left: position.left }}
            className={`fixed z-50 -translate-x-1/2 rounded-full border border-sky-100 bg-white shadow-[0_14px_32px_-16px_rgba(37,99,235,0.55)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-none ${isMobile ? 'flex items-center gap-3 px-4 py-3' : 'flex items-center gap-2.5 px-3.5 py-2.5'}`}
        >
            <button
                onMouseDown={(event) => {
                    event.preventDefault();
                    onClearColor?.();
                }}
                className={`${isMobile ? 'h-7 w-7' : 'h-[22px] w-[22px]'} inline-flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm transition-transform hover:scale-110 hover:border-slate-400 hover:text-slate-700 active:scale-95 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white`}
                title={t?.('common.clear', '清除高亮') || '清除高亮'}
                aria-label={t?.('common.clear', '清除高亮') || '清除高亮'}
            >
                <Eraser size={isMobile ? 13 : 11} />
            </button>
            {WRITING_HIGHLIGHT_COLORS.map((config) => (
                <button
                    key={config.id}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        onApplyColor(config.id);
                    }}
                    className={`${isMobile ? 'h-7 w-7' : 'h-[22px] w-[22px]'} rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 active:scale-95 dark:border-slate-800 ${config.dot}`}
                    title={config.id}
                />
            ))}
        </motion.div>
    );
};

export default FloatingColorPicker;
