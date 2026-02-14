import React from 'react';
import { BookOpenText, PenLine, AlignLeft } from 'lucide-react';

const WritingBetaV3SidePanel = ({ title, content, metrics }) => {
    const previewParagraphs = content
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4);

    return (
        <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">写作统计</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><PenLine size={14} />字符数</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{metrics.charCount}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><AlignLeft size={14} />段落数</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{metrics.paragraphCount}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><BookOpenText size={14} />预计阅读</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{metrics.readingMinutes} 分钟</span>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">预览</h2>
                <div className="min-h-[220px] rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">{title || '未命名草稿'}</h3>
                    {previewParagraphs.length > 0 ? (
                        <div className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {previewParagraphs.map((paragraph, index) => (
                                <p key={`${paragraph}-${index}`}>{paragraph}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">还没有可预览内容，先在左侧编辑区输入一些文字。</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WritingBetaV3SidePanel;
