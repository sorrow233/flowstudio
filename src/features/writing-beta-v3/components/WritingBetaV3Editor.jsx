import React from 'react';

const WritingBetaV3Editor = ({ title, content, onTitleChange, onContentChange, onClear }) => {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">编辑区</h2>
                <button
                    type="button"
                    onClick={onClear}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    清空草稿
                </button>
            </div>

            <div className="space-y-3">
                <input
                    type="text"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="输入标题..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />

                <textarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder="开始写作，支持换行分段。"
                    className="min-h-[380px] w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
            </div>
        </section>
    );
};

export default WritingBetaV3Editor;
