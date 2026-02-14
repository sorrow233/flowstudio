import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Code, FileCode } from 'lucide-react';

const ExportMenu = ({ show, onExport, onClose, isMobile, t }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        if (!show) return undefined;

        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
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
            className={`absolute z-40 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${isMobile ? 'left-0' : 'right-0'}`}
        >
            <div className="p-1.5">
                {items.map(({ format, icon: Icon, label }) => (
                    <button
                        key={format}
                        onClick={() => onExport(format)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
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
