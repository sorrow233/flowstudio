import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Code, FileCode } from 'lucide-react';

const ExportMenu = ({ show, onExport, onClose, isMobile, t }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        if (!show) return;
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [show, onClose]);

    if (!show) return null;

    const items = [
        { format: 'md', icon: FileCode, label: t('inspiration.exportMarkdown') },
        { format: 'html', icon: Code, label: t('inspiration.exportHtml') },
        { format: 'txt', icon: FileText, label: t('inspiration.exportTxt') },
    ];

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className={`absolute z-40 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-gray-200/60 bg-white/98 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-gray-700/60 dark:bg-slate-900/98 ${isMobile ? 'left-0' : 'right-0'
                }`}
        >
            <div className="p-1.5">
                {items.map(({ format, icon: Icon, label }) => (
                    <button
                        key={format}
                        onClick={() => onExport(format)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-gray-600 transition hover:bg-rose-50 hover:text-rose-600 dark:text-gray-300 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                    >
                        <Icon size={14} className="opacity-60" />
                        {label}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default ExportMenu;
