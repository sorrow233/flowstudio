import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    PanelLeftClose,
    PanelLeftOpen,
    MoreHorizontal
} from 'lucide-react';
import ExportMenu from './ExportMenu';

const IconBtn = ({ onClick, disabled, title, children, active, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${disabled
            ? 'cursor-not-allowed text-sky-200 dark:text-slate-700'
            : active
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400'
            } ${className}`}
    >
        {children}
    </button>
);

const EditorToolbar = ({
    isSidebarOpen,
    onToggleSidebar,
    statusLabel,
    statusNeedsAttention,
    canUndo,
    canRedo,
    canManualSnapshot,
    canCopy,
    copiedAt,
    showActions,
    onUndo,
    onRedo,
    onManualSnapshot,
    onShowHistory,
    onCopy,
    onToggleActions,
    onExport,
    onCloseActions,
    isMobile,
    t
}) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-3 py-2 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center gap-2">
            <IconBtn onClick={onToggleSidebar} title={t('inspiration.toggleSidebar')}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isSidebarOpen ? 'close' : 'open'}
                        initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-center"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                    </motion.div>
                </AnimatePresence>
            </IconBtn>

            <div className="flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-700/80 dark:border-slate-800 dark:bg-slate-800/50 dark:text-sky-400/80">
                <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${statusNeedsAttention
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.45)] dark:bg-sky-400 dark:shadow-none'
                        }`}
                />
                {statusLabel}
            </div>
        </div>

        <div className="flex items-center">
            <div className="relative">
                <IconBtn onClick={onToggleActions} title={t('common.details', '详情')}>
                    <MoreHorizontal size={16} />
                </IconBtn>
                <AnimatePresence>
                    {showActions && (
                        <ExportMenu
                            show={showActions}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            canManualSnapshot={canManualSnapshot}
                            canCopy={canCopy}
                            copiedAt={copiedAt}
                            onUndo={onUndo}
                            onRedo={onRedo}
                            onManualSnapshot={onManualSnapshot}
                            onShowHistory={onShowHistory}
                            onCopy={onCopy}
                            onExport={onExport}
                            onClose={onCloseActions}
                            isMobile={isMobile}
                            t={t}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
);

export default EditorToolbar;
