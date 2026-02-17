import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { MARKDOWN_QUICK_ACTIONS } from './markdown/quickActions';

const sectionOrder = ['inline', 'block'];
const sectionLabels = {
    inline: '行内',
    block: '区块',
};

const MarkdownQuickMenu = ({
    show,
    onInsert,
    onClose,
    onPrepareInsert,
    t,
}) => {
    const menuRef = useRef(null);

    const groupedActions = useMemo(() => {
        const groups = {
            inline: [],
            block: [],
        };

        MARKDOWN_QUICK_ACTIONS.forEach((action) => {
            if (!groups[action.group]) return;
            groups[action.group].push(action);
        });

        return groups;
    }, []);

    useEffect(() => {
        if (!show) return undefined;

        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [show, onClose]);

    if (!show) return null;

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="absolute right-11 z-40 mt-2 w-[18.5rem] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
            role="menu"
            aria-label={t?.('writing.markdownQuickMenu', 'Markdown 快捷菜单') || 'Markdown 快捷菜单'}
        >
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                {t?.('writing.markdownQuickMenu', 'Markdown 快捷菜单') || 'Markdown 快捷菜单'}
            </div>

            {sectionOrder.map((sectionId, sectionIndex) => (
                <div key={sectionId} className={sectionIndex === 0 ? 'pb-1' : 'pb-2'}>
                    {sectionIndex > 0 && <div className="mx-3 mb-1 h-px bg-sky-100 dark:bg-slate-800" />}
                    <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {sectionLabels[sectionId]}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 px-2">
                        {groupedActions[sectionId].map((action) => (
                            <button
                                key={action.id}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    onPrepareInsert?.();
                                    onInsert?.(action.id);
                                }}
                                className="flex min-h-12 flex-col items-start justify-center rounded-xl border border-transparent bg-slate-50/80 px-2.5 py-1.5 text-left transition hover:border-sky-200 hover:bg-sky-50 dark:bg-slate-800/75 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                title={action.preview}
                            >
                                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
                                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{action.preview}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default MarkdownQuickMenu;
