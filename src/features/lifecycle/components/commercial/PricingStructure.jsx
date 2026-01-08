import React from 'react';
import { BarChart3, Check } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const PricingStructure = ({ proPrice, onUpdateProPrice }) => {
    const { t } = useTranslation();

    return (
        <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={16} /> {t('commercial.pricingStructure')}
            </h3>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-0 opacity-50" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Tier */}
                    <div className="border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl p-6 flex flex-col">
                        <div className="mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white">{t('commercial.pricingTiers.personal')}</h4>
                            <div className="text-3xl font-light text-gray-900 dark:text-white mt-2">$0</div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {t('commercial.pricingTiers.features.core')}</li>
                            <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {t('commercial.pricingTiers.features.community')}</li>
                        </ul>
                    </div>

                    {/* Pro Tier */}
                    <div className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 backdrop-blur rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-amber-100/50 dark:shadow-none">
                        <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
                        <div className="mb-4">
                            <h4 className="font-bold text-amber-900 dark:text-amber-400">{t('commercial.pricingTiers.pro')}</h4>
                            <div className="relative mt-2">
                                <span className="text-3xl font-light text-gray-900 dark:text-white">$</span>
                                <input
                                    type="number"
                                    placeholder="19"
                                    value={proPrice || ''}
                                    onChange={(e) => onUpdateProPrice(e.target.value)}
                                    className="w-20 text-3xl font-light bg-transparent border-b border-amber-300 dark:border-amber-700 focus:border-amber-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 inline-block"
                                />
                                <span className="text-xs text-gray-400"> /mo</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            <li className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.everything')}</li>
                            <li className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.priority')}</li>
                            <li className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.analytics')}</li>
                        </ul>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl p-6 flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                        <div className="mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white">{t('commercial.pricingTiers.enterprise')}</h4>
                            <div className="text-xl font-light text-gray-500 dark:text-gray-400 mt-2 pt-2">{t('commercial.pricingTiers.custom')}</div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            <li className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"><Check size={12} className="text-gray-400" /> {t('commercial.pricingTiers.features.sso')}</li>
                            <li className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"><Check size={12} className="text-gray-400" /> {t('commercial.pricingTiers.features.manager')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingStructure;
