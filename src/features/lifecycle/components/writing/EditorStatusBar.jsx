import React from 'react';
import { formatTimeShort } from './editorUtils';

const StatusBadge = ({ label }) => (
    <span className="writing-editor-status-badge inline-flex items-center rounded-full px-2.5 py-1 font-mono tabular-nums text-[11px]">
        {label}
    </span>
);

const EditorStatusBar = ({
    wordCount,
    wordCountLabelKey,
    charCount,
    readMinutes,
    lastSavedAt,
    hasPendingRemote,
    isMobile,
    t
}) => (
    <div className={`writing-editor-status flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between gap-4'} text-[11px]`}>
        <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={`${wordCount} ${t(wordCountLabelKey)}`} />
            {!isMobile && wordCountLabelKey !== 'inspiration.characters' && (
                <StatusBadge label={`${charCount} ${t('inspiration.characters')}`} />
            )}
            {!isMobile && readMinutes > 0 && (
                <StatusBadge label={`${readMinutes} ${t('inspiration.readTime')}`} />
            )}
        </div>

        <div className="writing-editor-status-meta flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
            {lastSavedAt ? (
                <span>
                    {t('inspiration.lastSaved')} {formatTimeShort(lastSavedAt)}
                </span>
            ) : null}
            {hasPendingRemote ? (
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                    {t('inspiration.pendingRemote')}
                </span>
            ) : null}
        </div>
    </div>
);

export default EditorStatusBar;
