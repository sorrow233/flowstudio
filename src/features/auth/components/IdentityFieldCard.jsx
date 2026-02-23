import React from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCheck } from 'lucide-react';

const toneClassMap = {
    uid: 'border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 to-sky-50/80 dark:border-indigo-500/35 dark:from-indigo-500/12 dark:to-sky-500/8',
    default: 'border-gray-200/90 bg-white/80 dark:border-gray-700/80 dark:bg-gray-900/55'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`rounded-xl border backdrop-blur-sm px-3 py-2.5 ${toneClassMap[tone] || toneClassMap.default}`}
        >
            <div className="flex items-start gap-2.5">
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] tracking-[0.14em] text-gray-500 dark:text-gray-400 uppercase">
                        {label}
                    </div>
                    <div className="mt-1 font-mono text-[0.9rem] md:text-[0.92rem] text-gray-900 dark:text-gray-100 break-all select-text leading-relaxed">
                        {value}
                    </div>
                </div>

                {copyable && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                            isCopied
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500/45 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'border-gray-200 bg-white/80 text-gray-500 hover:text-gray-900 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-500'
                        }`}
                        title={isCopied ? '已复制' : `复制${label}`}
                    >
                        {isCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default IdentityFieldCard;
