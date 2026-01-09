import React from 'react';
import { Rocket, Check } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const CHECKLIST_ITEMS = [
    { id: 'market_fit', key: 'market_fit' },
    { id: 'waitlist', key: 'waitlist' },
    { id: 'pricing', key: 'pricing' },
    { id: 'legal', key: 'legal' },
    { id: 'analytics', key: 'analytics' },
    { id: 'payments', key: 'payments' },
];

const LaunchChecklist = ({ checklist = {}, onToggle, isLaunchReady, progress }) => {
    const { t } = useTranslation();

    return (
        <section className={`transition-all duration-500 h-fit ${isLaunchReady
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border-amber-200/80 dark:border-amber-800/80'} border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>

            {/* Decorative Glowing Blobs */}
            <div className={`absolute top-0 right-0 w-40 h-40 ${isLaunchReady ? 'bg-emerald-200 dark:bg-emerald-900/30' : 'bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30'} rounded-bl-full opacity-40 blur-2xl -z-0`} />
            <div className={`absolute bottom-0 left-0 w-24 h-24 ${isLaunchReady ? 'bg-teal-200 dark:bg-teal-900/20' : 'bg-gradient-to-tr from-yellow-200 to-amber-200 dark:from-yellow-900/20 dark:to-amber-900/20'} rounded-tr-full opacity-30 blur-xl -z-0`} />

            <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2 ${isLaunchReady ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                <Rocket size={16} /> {t('commercial.launchReadiness')}
            </h3>

            <div className="space-y-4 relative z-10">
                {CHECKLIST_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onToggle(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                            ${isLaunchReady
                                ? 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100'
                                : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-amber-900 dark:text-amber-100'}
                        `}
                    >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm
                            ${checklist[item.id]
                                ? (isLaunchReady ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white shadow-emerald-200 dark:shadow-none' : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 text-white shadow-amber-200 dark:shadow-none')
                                : (isLaunchReady ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900' : 'border-amber-300 dark:border-amber-700 bg-white/80 dark:bg-gray-900 group-hover:border-amber-400 dark:group-hover:border-amber-600')
                            }
                        `}>
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className={`text-sm transition-colors ${checklist[item.id] ? 'font-semibold' : 'font-light text-gray-500 dark:text-gray-400'}`}>
                            {t(`commercial.checklist.${item.key}`)}
                        </span>
                    </button>
                ))}
            </div>

            <div className={`mt-8 pt-8 border-t ${isLaunchReady ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200/50 dark:border-amber-800/50'}`}>
                <div className={`flex items-center justify-between text-xs font-medium mb-2 ${isLaunchReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    <span>{t('commercial.readiness')}</span>
                    <span>{progress} / 6</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isLaunchReady ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${isLaunchReady ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                        style={{ width: `${(progress / 6) * 100}%` }}
                    />
                </div>
            </div>
        </section>
    );
};

export default LaunchChecklist;
