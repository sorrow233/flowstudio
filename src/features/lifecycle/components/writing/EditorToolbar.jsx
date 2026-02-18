import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FileCode2,
    MoreHorizontal,
} from 'lucide-react';
import ExportMenu from './ExportMenu';
import MarkdownQuickMenu from './MarkdownQuickMenu';

const IconBtn = ({ onClick, onMouseDown, disabled, title, children, active, className = '' }) => (
    <button
        onClick={onClick}
        onMouseDown={onMouseDown}
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
    showMarkdownMenu,
    showActions,
    onUndo,
    onRedo,
    onManualSnapshot,
    onShowHistory,
    onCopy,
    onToggleMarkdownMenu,
    onInsertMarkdown,
    onCloseMarkdownMenu,
    onPrepareMarkdownInsert,
    onToggleActions,
    onExport,
    onCloseActions,
    isMobile,
    t
}) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
            <button
                onClick={onToggleSidebar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-sky-50 dark:hover:bg-slate-800"
                title={`${statusLabel} • ${t('inspiration.toggleSidebar')}`}
                aria-label={statusLabel}
            >
                <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${statusNeedsAttention
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.45)] dark:bg-sky-400 dark:shadow-none'
                        }`}
                />
            </button>
        </div>

        <div className="flex items-center">
            <div className="flex items-center gap-1">
                <div className="relative">
                    <IconBtn
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onPrepareMarkdownInsert?.();
                        }}
                        onClick={onToggleMarkdownMenu}
                        active={showMarkdownMenu}
                        title={t('writing.markdownQuickMenu', 'Markdown 快捷')}
                    >
                        <FileCode2 size={15} />
                    </IconBtn>
                    <AnimatePresence>
                        {showMarkdownMenu && (
                            <MarkdownQuickMenu
                                show={showMarkdownMenu}
                                onInsert={onInsertMarkdown}
                                onClose={onCloseMarkdownMenu}
                                onPrepareInsert={onPrepareMarkdownInsert}
                                isMobile={isMobile}
                                t={t}
                            />
                        )}
                    </AnimatePresence>
                </div>

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
    </div>
);

export default EditorToolbar;
