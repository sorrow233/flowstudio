import React from 'react';
import { TrendingUp, Check } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const RevenueModelSelector = ({ models, selectedModelId, onSelect }) => {
    const { t } = useTranslation();

    return (
        <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={16} /> {t('commercial.revenueModel')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {models.map(model => (
                    <button
                        key={model.id}
                        onClick={() => onSelect(model.id)}
                        className={`
                            group relative overflow-hidden p-6 rounded-2xl border text-left transition-all duration-300
                            ${selectedModelId === model.id
                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 ring-1 ring-amber-200 dark:ring-amber-800 shadow-xl shadow-amber-100/50 dark:shadow-none'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md'}
                        `}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedModelId === model.id ? 'bg-amber-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 group-hover:text-amber-600'}`}>
                            <model.icon size={24} />
                        </div>
                        <h4 className={`font-medium text-lg mb-1 transition-colors ${selectedModelId === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {t(`commercial.models.${model.id}`)}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed font-light">
                            {t(`commercial.models.${model.id}Desc`)}
                        </p>

                        {selectedModelId === model.id && (
                            <div className="absolute top-4 right-4 text-amber-500">
                                <Check size={20} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default RevenueModelSelector;
