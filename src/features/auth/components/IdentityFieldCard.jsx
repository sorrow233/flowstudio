import React from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCheck } from 'lucide-react';

const toneClassMap = {
    uid: 'bg-gradient-to-r from-sky-200/80 via-indigo-200/80 to-pink-200/80 dark:from-sky-500/25 dark:via-indigo-500/25 dark:to-pink-500/25',
    default: 'bg-gradient-to-r from-gray-200/75 via-gray-100/70 to-gray-200/75 dark:from-gray-700/45 dark:via-gray-800/45 dark:to-gray-700/45'
};

const IdentityFieldCard = ({
    label,
    value,
    tone = 'default',
    copyable = false,
    isCopied = false,
    onCopy
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`rounded-2xl p-[1px] ${toneClassMap[tone] || toneClassMap.default}`}
        >
            <div className="rounded-2xl bg-white/85 dark:bg-gray-900/80 backdrop-blur-md border border-white/60 dark:border-gray-700/60 px-4 py-3.5">
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] tracking-[0.12em] text-gray-500 dark:text-gray-400 uppercase">
                            {label}
                        </div>
                        <div className="mt-1.5 font-mono text-sm md:text-[0.96rem] text-gray-900 dark:text-gray-100 break-all select-text leading-relaxed">
                            {value}
                        </div>
                    </div>

                    {copyable && (
                        <button
                            type="button"
                            onClick={onCopy}
                            className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-colors ${
                                isCopied
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300'
                                    : 'border-gray-200 bg-white/90 text-gray-500 hover:text-gray-900 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-500'
                            }`}
                            title={isCopied ? '已复制' : `复制${label}`}
                        >
                            {isCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default IdentityFieldCard;
