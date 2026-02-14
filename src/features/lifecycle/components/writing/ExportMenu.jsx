import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Code, FileCode, Undo2, Redo2, Save, History, Copy, Check } from 'lucide-react';

const ExportMenu = ({
    show,
    canUndo,
    canRedo,
    canManualSnapshot,
    canCopy,
    copiedAt,
    onUndo,
    onRedo,
    onManualSnapshot,
    onShowHistory,
    onCopy,
    onExport,
    onClose,
    isMobile,
    t
}) => {
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

    const actionItems = [
        { key: 'undo', icon: Undo2, label: `${t('common.undo')} ⌘Z`, disabled: !canUndo, onClick: onUndo },
        { key: 'redo', icon: Redo2, label: `${t('common.redo')} ⌘⇧Z`, disabled: !canRedo, onClick: onRedo },
        { key: 'snapshot', icon: Save, label: `${t('inspiration.saveVersion')} ⌘S`, disabled: !canManualSnapshot, onClick: onManualSnapshot },
        { key: 'history', icon: History, label: t('inspiration.versionHistory'), disabled: false, onClick: onShowHistory },
        {
            key: 'copy',
            icon: copiedAt ? Check : Copy,
            label: copiedAt ? t('common.copied', '已复制') : t('common.copy'),
            disabled: !canCopy,
            onClick: onCopy,
            active: Boolean(copiedAt),
        },
    ];

    const exportItems = [
        { format: 'md', icon: FileCode, label: t('inspiration.exportMarkdown') },
        { format: 'html', icon: Code, label: t('inspiration.exportHtml') },
        { format: 'txt', icon: FileText, label: t('inspiration.exportTxt') },
    ];

    const runAction = (handler, disabled = false) => {
        if (disabled || !handler) return;
        handler();
        onClose();
    };

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className={`absolute z-40 mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${isMobile ? 'left-0' : 'right-0'}`}
        >
            <div className="p-1.5">
                {actionItems.map(({ key, icon: Icon, label, disabled, onClick, active }) => (
                    <button
                        key={key}
                        onClick={() => runAction(onClick, disabled)}
                        disabled={disabled}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition ${disabled
                            ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                            : active
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                                : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'
                            }`}
                    >
                        <Icon size={14} className="opacity-60" />
                        {label}
                    </button>
                ))}

                <div className="mx-2 my-1 h-px bg-sky-100 dark:bg-slate-800" />

                {exportItems.map(({ format, icon: Icon, label }) => (
                    <button
                        key={format}
                        onClick={() => {
                            onExport(format);
                            onClose();
                        }}
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
