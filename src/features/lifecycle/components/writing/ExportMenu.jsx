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

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                />
                <motion.div
                    ref={menuRef}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="relative z-10 w-full rounded-t-[32px] bg-white px-5 pb-10 pt-3 shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.15)] dark:bg-slate-900"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2.5rem)' }}
                >
                    <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />

                    <div className="grid grid-cols-1 gap-2">
                        {actionItems.map(({ key, icon: Icon, label, disabled, onClick, active }) => (
                            <button
                                key={key}
                                onClick={() => runAction(onClick, disabled)}
                                disabled={disabled}
                                className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm transition-all active:scale-[0.98] ${disabled
                                    ? 'opacity-30'
                                    : active
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'bg-slate-50 text-slate-700 active:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300'
                                    }`}
                            >
                                <Icon size={18} className="opacity-70" />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}

                        <div className="my-2 h-px bg-slate-100 dark:bg-slate-800/50" />

                        <div className="grid grid-cols-3 gap-3">
                            {exportItems.map(({ format, icon: Icon, label }) => (
                                <button
                                    key={format}
                                    onClick={() => {
                                        onExport(format);
                                        onClose();
                                    }}
                                    className="flex flex-col items-center gap-2 rounded-2xl bg-sky-50/50 py-4 text-sky-700 transition-all active:scale-[0.95] dark:bg-sky-900/20 dark:text-sky-400"
                                >
                                    <Icon size={20} className="opacity-80" />
                                    <span className="text-[11px] font-bold">{label.split(' ')[1] || label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="absolute right-0 z-40 mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
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
