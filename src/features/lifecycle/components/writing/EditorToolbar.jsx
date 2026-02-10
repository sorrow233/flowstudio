import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    PanelLeftClose,
    PanelLeftOpen,
    Undo2,
    Redo2,
    Save,
    History,
    Copy,
    Download,
    Check
} from 'lucide-react';
import ExportMenu from './ExportMenu';

const IconBtn = ({ onClick, disabled, title, children, active, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all ${disabled
            ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
            : active
                ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            } ${className}`}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="mx-1 h-4 w-px bg-gray-200/70 dark:bg-gray-700/70" />
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
    showExport,
    onUndo,
    onRedo,
    onManualSnapshot,
    onShowHistory,
    onCopy,
    onToggleExport,
    onExport,
    onCloseExport,
    isMobile,
    t
}) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/50 bg-white/85 px-3 py-2 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl transition dark:border-gray-800/50 dark:bg-slate-900/80">
        {/* Left: Sidebar toggle + Status */}
        <div className="flex items-center gap-2">
            <IconBtn onClick={onToggleSidebar} title={t('inspiration.toggleSidebar')}>
                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </IconBtn>

            <div className="flex items-center gap-1.5 rounded-full border border-gray-200/50 bg-gray-50/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:border-gray-700/50 dark:bg-slate-800/60 dark:text-gray-400">
                <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${statusNeedsAttention
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                        }`}
                />
                {statusLabel}
            </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-0.5">
            <IconBtn onClick={onUndo} disabled={!canUndo} title={`${t('common.undo')} ⌘Z`}>
                <Undo2 size={15} />
            </IconBtn>
            <IconBtn onClick={onRedo} disabled={!canRedo} title={`${t('common.redo')} ⌘⇧Z`}>
                <Redo2 size={15} />
            </IconBtn>

            <Divider />

            <IconBtn
                onClick={onManualSnapshot}
                disabled={!canManualSnapshot}
                title={`${t('inspiration.saveVersion')} ⌘S`}
            >
                <Save size={15} />
            </IconBtn>
            <IconBtn onClick={onShowHistory} title={t('inspiration.versionHistory')}>
                <History size={15} />
            </IconBtn>

            <Divider />

            <IconBtn onClick={onCopy} disabled={!canCopy} title={t('common.copy')}>
                {copiedAt ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </IconBtn>

            <div className="relative">
                <IconBtn onClick={onToggleExport} title={t('inspiration.export')}>
                    <Download size={15} />
                </IconBtn>
                <AnimatePresence>
                    {showExport && (
                        <ExportMenu
                            show={showExport}
                            onExport={onExport}
                            onClose={onCloseExport}
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
