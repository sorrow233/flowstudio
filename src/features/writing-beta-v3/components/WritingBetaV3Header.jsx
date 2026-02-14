import React from 'react';
import { FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const SaveStateText = ({ saveState, lastSavedAt }) => {
    if (saveState === 'saving') {
        return (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Loader2 size={14} className="animate-spin" />
                自动保存中
            </span>
        );
    }

    if (saveState === 'saved') {
        return (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
                已保存 {lastSavedAt ? lastSavedAt.toLocaleTimeString() : ''}
            </span>
        );
    }

    if (saveState === 'error') {
        return (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertCircle size={14} />
                保存失败
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <AlertCircle size={14} />
            草稿未变更
        </span>
    );
};

const WritingBetaV3Header = ({ saveState, lastSavedAt }) => {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
                        <FileText size={13} />
                        Beta 写作 3 第三版测试
                    </span>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">写作测试页 V3</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">用于快速迭代写作体验，当前仅作为独立测试路由，不进入主导航。</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/80">
                    <SaveStateText saveState={saveState} lastSavedAt={lastSavedAt} />
                </div>
            </div>
        </section>
    );
};

export default WritingBetaV3Header;
