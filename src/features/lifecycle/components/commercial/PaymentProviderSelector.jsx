import React from 'react';
import { Wallet } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const PaymentProviderSelector = ({ providers, selectedProviderId, onSelect }) => {
    const { t } = useTranslation();

    return (
        <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Wallet size={16} /> {t('commercial.financialInfrastructure')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {providers.map(provider => (
                    <button
                        key={provider.id}
                        onClick={() => onSelect(provider.id)}
                        className={`
                            flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-3
                            ${selectedProviderId === provider.id
                                ? 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 border-transparent shadow-xl scale-105'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white'}
                        `}
                    >
                        <provider.icon size={28} strokeWidth={1.5} />
                        <div>
                            <div className="text-sm font-bold">{t(`commercial.payment.${provider.id}`)}</div>
                            <div className={`text-[10px] mt-1 leading-tight text-gray-400`}>
                                {t(`commercial.payment.${provider.id}Desc`)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default PaymentProviderSelector;
