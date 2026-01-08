import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Rocket, Check } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const GrowthPhase = ({ channels, activeChannelIds, onToggleChannel }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key="growth-phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
        >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-950 rounded-[3rem] p-10 text-white flex-1 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8 text-emerald-400">
                        <Megaphone size={32} />
                        <span className="text-sm font-bold uppercase tracking-widest border px-3 py-1 rounded-full border-emerald-500/50 bg-emerald-500/10">
                            {t('commercial.growthPhase')}
                        </span>
                    </div>

                    <h2 className="text-4xl font-light mb-6">
                        {t('commercial.growthTitle')} <br />
                        <span className="text-gray-400">{t('commercial.growthSubtitle')}</span>
                    </h2>

                    <p className="text-gray-400 max-w-lg mb-12 text-lg font-light leading-relaxed">
                        {t('commercial.growthDesc')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6">
                            <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                <Rocket size={16} /> {t('commercial.activeChannels')}
                            </h4>
                            <div className="space-y-2">
                                {channels.map(channel => {
                                    const isActive = activeChannelIds.includes(channel.id);
                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => onToggleChannel(channel.id)}
                                            className={`
                                                w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                                                ${isActive
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                                    : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <channel.icon size={16} />
                                                <span className="text-sm font-medium">{t(`commercial.marketing.${channel.id}`)}</span>
                                            </div>
                                            {isActive && <Check size={14} className="text-emerald-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GrowthPhase;
