import React from 'react';
import { formatTimeShort } from './editorUtils';

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
    <div className={`flex ${isMobile ? 'flex-col gap-1.5' : 'items-center justify-between gap-4'} text-[11px]`}>
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3 text-gray-500/80 dark:text-gray-500">
            <span className="font-mono tabular-nums">
                {wordCount} {t(wordCountLabelKey)}
            </span>
            {!isMobile && wordCountLabelKey !== 'inspiration.characters' && (
                <span className="font-mono tabular-nums">
                    {charCount} {t('inspiration.characters')}
                </span>
            )}
            {!isMobile && readMinutes > 0 && (
                <span className="font-mono tabular-nums">
                    {readMinutes} {t('inspiration.readTime')}
                </span>
            )}
        </div>

        {/* Save info */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-gray-400/80 dark:text-gray-600">
            {lastSavedAt ? (
                <span>
                    {t('inspiration.lastSaved')} {formatTimeShort(lastSavedAt)}
                </span>
            ) : null}
            {hasPendingRemote ? (
                <span className="text-amber-500">{t('inspiration.pendingRemote')}</span>
            ) : null}
        </div>
    </div>
);

export default EditorStatusBar;
