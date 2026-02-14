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
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all ${disabled
            ? 'cursor-not-allowed text-sky-200'
            : active
                ? 'bg-sky-100 text-sky-700'
                : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'
            } ${className}`}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="mx-1 h-4 w-px bg-sky-100/90" />
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
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white/88 px-3 py-2 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
            <IconBtn onClick={onToggleSidebar} title={t('inspiration.toggleSidebar')}>
                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </IconBtn>

            <div className="flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-700/80">
                <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${statusNeedsAttention
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.45)]'
                        }`}
                />
                {statusLabel}
            </div>
        </div>

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
