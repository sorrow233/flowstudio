import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Unlock, CheckCircle2, Copy, Sparkles, Lock } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const AiConfigurationPanel = ({ onCopy, onUnlock, isLaunched }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {t('commercial.aiConfig.title')}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                        {isLaunched ? t('commercial.aiConfig.unlocked') : 'Setup Wizard'}
                    </p>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('commercial.aiConfig.desc')}
                </p>

                <div className="space-y-3">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${isLaunched || step < 4
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}
                            `}>
                                {isLaunched && step !== 4 ? <CheckCircle2 size={14} /> : step}
                            </div>
                            <span className={`text-xs font-medium ${isLaunched ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                {t(`commercial.aiConfig.steps.${step}`)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={onCopy}
                    className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    <Terminal size={16} />
                    {t('commercial.aiConfig.copyAction')}
                </button>

                {!isLaunched ? (
                    <button
                        onClick={onUnlock}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200 dark:shadow-none"
                    >
                        <Unlock size={16} />
                        {t('commercial.aiConfig.unlockAction')}
                    </button>
                ) : (
                    <div className="w-full py-3 px-4 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-green-100 dark:border-green-900/20 cursor-default">
                        <CheckCircle2 size={16} />
                        {t('commercial.aiConfig.unlocked')}
                    </div>
                )}

                {!isLaunched && (
                    <p className="text-[10px] text-center text-gray-400">
                        {t('commercial.aiConfig.unlockDesc')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AiConfigurationPanel;
