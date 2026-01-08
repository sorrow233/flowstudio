import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Coins, TrendingUp, ShieldCheck, Rocket, Check, CreditCard, Globe, Zap, BarChart3, Lock, RefreshCw,
    Copy, Terminal, Wallet, Megaphone, Share2, MousePointerClick, Hash, LineChart, Globe2
} from 'lucide-react';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { toast } from 'sonner';
import { useTranslation } from '../i18n';

const CommercialModule = () => {
    const { t, language } = useTranslation();

    // Memoize Data Constants to react to language changes
    const REVENUE_MODELS = useMemo(() => [
        { id: 'subscription', title: t('commercial.models.subscription'), icon: RefreshCw, desc: t('commercial.models.subscriptionDesc') },
        { id: 'one_time', title: t('commercial.models.one_time'), icon: CreditCard, desc: t('commercial.models.one_timeDesc') },
        { id: 'freemium', title: t('commercial.models.freemium'), icon: Zap, desc: t('commercial.models.freemiumDesc') },
        { id: 'ads', title: t('commercial.models.ads'), icon: Globe, desc: t('commercial.models.adsDesc') },
    ], [t]);

    const PAYMENT_PROVIDERS = useMemo(() => [
        { id: 'stripe', title: t('commercial.payment.stripe'), desc: t('commercial.payment.stripeDesc'), icon: CreditCard },
        { id: 'lemonsqueezy', title: t('commercial.payment.lemonsqueezy'), desc: t('commercial.payment.lemonsqueezyDesc'), icon: Wallet },
        { id: 'paddle', title: t('commercial.payment.paddle'), desc: t('commercial.payment.paddleDesc'), icon: Globe2 },
        { id: 'revenuecat', title: t('commercial.payment.revenuecat'), desc: t('commercial.payment.revenuecatDesc'), icon: Coins },
    ], [t]);

    const MARKETING_CHANNELS = useMemo(() => [
        { id: 'twitter', title: t('commercial.marketing.twitter'), icon: Hash, color: 'hover:text-blue-400' },
        { id: 'producthunt', title: t('commercial.marketing.producthunt'), icon: Rocket, color: 'hover:text-orange-500' },
        { id: 'reddit', title: t('commercial.marketing.reddit'), icon: Megaphone, color: 'hover:text-orange-600' },
        { id: 'linkedin', title: t('commercial.marketing.linkedin'), icon: Share2, color: 'hover:text-blue-700' },
        { id: 'seo', title: t('commercial.marketing.seo'), icon: Globe, color: 'hover:text-green-500' },
        { id: 'short_video', title: t('commercial.marketing.short_video'), icon: MousePointerClick, color: 'hover:text-pink-500' },
        { id: 'ads', title: t('commercial.marketing.ads'), icon: LineChart, color: 'hover:text-purple-500' },
    ], [t]);

    const CHECKLIST_ITEMS = useMemo(() => [
        { id: 'market_fit', label: t('commercial.checklist.market_fit') },
        { id: 'waitlist', label: t('commercial.checklist.waitlist') },
        { id: 'pricing', label: t('commercial.checklist.pricing') },
        { id: 'legal', label: t('commercial.checklist.legal') },
        { id: 'analytics', label: t('commercial.checklist.analytics') },
        { id: 'payments', label: t('commercial.checklist.payments') },
    ], [t]);

    // Sync Integration
    const { doc } = useSyncStore('flowstudio_v1');
    const {
        projects,
        updateProject
    } = useSyncedProjects(doc, 'primary_projects');

    const location = useLocation();

    // UI State
    const [selectedProject, setSelectedProject] = useState(null);

    // Filter for Advanced Projects Only (Stage 6+)
    const commercialProjects = React.useMemo(() => {
        return projects.filter(p => (p.subStage || 1) >= 6);
    }, [projects]);


    // Sync Helper & Initial Selection
    useEffect(() => {
        if (commercialProjects.length > 0) {
            // Priority 1: ID passed via navigation state (e.g. from Graduation)
            const passedId = location.state?.projectId;
            if (passedId && !selectedProject) {
                const target = commercialProjects.find(p => p.id === passedId);
                if (target) {
                    setSelectedProject(target);
                    return;
                }
            }

            // Priority 2: Default to first project if nothing selected
            if (!selectedProject) {
                setSelectedProject(commercialProjects[0]);
            } else {
                // Keep current selection updated
                const current = commercialProjects.find(p => p.id === selectedProject.id);
                if (current) setSelectedProject(current);
            }
        }
    }, [commercialProjects, location.state]);

    const handleUpdate = (updates) => {
        if (selectedProject) {
            updateProject(selectedProject.id, { commercial: { ...(selectedProject.commercial || {}), ...updates } });
        }
    };

    const toggleMarketingChannel = (channelId) => {
        const current = selectedProject.commercial?.marketingChannels || [];
        const updated = current.includes(channelId)
            ? current.filter(id => id !== channelId)
            : [...current, channelId];
        handleUpdate({ marketingChannels: updated });
    };

    const handleCopyCommand = () => {
        if (!selectedProject) return;
        const data = selectedProject.commercial || {};
        const model = REVENUE_MODELS.find(m => m.id === data.model);
        const payment = PAYMENT_PROVIDERS.find(p => p.id === data.paymentProvider);
        const channels = (data.marketingChannels || []).map(id => MARKETING_CHANNELS.find(c => c.id === id)?.title).filter(Boolean);

        const commandText = `
# ${t('commercial.directive.title')}: ${selectedProject.title}

## ${t('commercial.directive.model')}
- **${t('commercial.directive.type')}**: ${model?.title || t('commercial.directive.notSelected')}
- **${t('commercial.directive.desc')}**: ${model?.desc || 'N/A'}
- **${t('commercial.directive.pricing')}**: ${data.proPrice ? `$${data.proPrice}/mo (Pro)` : t('commercial.directive.tbd')}

## ${t('commercial.directive.infrastructure')}
- **${t('commercial.directive.provider')}**: ${payment?.title || t('commercial.directive.notSelected')}
- **${t('commercial.directive.rationale')}**: ${payment?.desc || t('commercial.directive.pending')}

## ${t('commercial.directive.growth')}
- **${t('commercial.directive.channels')}**: ${channels.length > 0 ? channels.join(', ') : t('commercial.directive.none')}

## ${t('commercial.directive.readiness')}
${Object.entries(data.checklist || {}).map(([key, val]) => {
            const itemLabel = CHECKLIST_ITEMS.find(i => i.id === key)?.label || key;
            return `- [${val ? 'x' : ' '}] ${itemLabel}`;
        }).join('\n')}

> ${t('commercial.directive.generated')}
`.trim();

        navigator.clipboard.writeText(commandText);
        toast.success(t('common.copied'), {
            description: t('commercial.copyDirective')
        });
    };

    if (commercialProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Coins size={32} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">{t('commercial.noProjectsTitle')}</h2>
                <p className="text-gray-400 mt-2">{t('commercial.noProjectsDesc')}</p>
            </div>
        );
    }

    // Safety check if selection is lost
    if (!selectedProject) return null;

    const data = selectedProject.commercial || {};
    const checklistProgress = Object.values(data.checklist || {}).filter(Boolean).length;
    const isLaunchReady = checklistProgress >= 6;

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-24">
            {/* Header */}
            <div className="mb-12 flex justify-between items-end border-b border-gray-100 pb-8">
                <div>
                    <h2 className="text-3xl font-thin text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                        <span className="text-amber-500"><Coins size={28} strokeWidth={1.5} /></span>
                        {t('commercial.strategy')}
                    </h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide max-w-xl leading-relaxed">
                        {isLaunchReady
                            ? t('commercial.strategyReadyDesc')
                            : t('commercial.strategyDesc')
                        }
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Copy Command Button */}
                    <button
                        onClick={handleCopyCommand}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                    >
                        <Terminal size={14} />
                        {t('commercial.copyDirective')}
                    </button>

                    {/* Project Selector Tabs */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-1.5 rounded-2xl border border-amber-100 shadow-lg shadow-amber-100/50">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider pl-3">{t('commercial.project')}:</span>
                        <div className="flex gap-1">
                            {commercialProjects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProject(p)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedProject.id === p.id
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-300/50'
                                        : 'bg-white/80 text-amber-700 border-amber-200/50 hover:bg-white hover:border-amber-300'
                                        }`}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: SETUP PHASE (Infrastructure, Revenue, Pricing) */}
                <div className="lg:col-span-2 space-y-12">
                    <AnimatePresence mode="wait">
                        {!isLaunchReady ? (
                            <motion.div
                                key="setup-phase"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {/* 1. Financial Infrastructure (First Priority) */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Wallet size={16} /> {t('commercial.financialInfrastructure')}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {PAYMENT_PROVIDERS.map(provider => (
                                            <button
                                                key={provider.id}
                                                onClick={() => handleUpdate({ paymentProvider: provider.id })}
                                                className={`
                                                    flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-3
                                                    ${data.paymentProvider === provider.id
                                                        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border-transparent shadow-xl scale-105'
                                                        : 'bg-white border-gray-100 hover:border-gray-300 text-gray-500 hover:text-gray-900'}
                                                `}
                                            >
                                                <provider.icon size={28} strokeWidth={1.5} />
                                                <div>
                                                    <div className="text-sm font-bold">{provider.title}</div>
                                                    <div className={`text-[10px] mt-1 leading-tight ${data.paymentProvider === provider.id ? 'text-gray-400' : 'text-gray-400'}`}>
                                                        {provider.desc}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* 2. Revenue Model */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <TrendingUp size={16} /> {t('commercial.revenueModel')}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {REVENUE_MODELS.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => handleUpdate({ model: model.id })}
                                                className={`
                                                    group relative overflow-hidden p-6 rounded-2xl border text-left transition-all duration-300
                                                    ${data.model === model.id
                                                        ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200 shadow-xl shadow-amber-100/50'
                                                        : 'bg-white border-gray-100 hover:border-amber-200 hover:shadow-md'}
                                                `}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${data.model === model.id ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600'}`}>
                                                    <model.icon size={24} />
                                                </div>
                                                <h4 className={`font-medium text-lg mb-1 transition-colors ${data.model === model.id ? 'text-gray-900' : 'text-gray-700'}`}>{model.title}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed font-light">{model.desc}</p>

                                                {data.model === model.id && (
                                                    <div className="absolute top-4 right-4 text-amber-500">
                                                        <Check size={20} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* 3. Pricing Tiers */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <BarChart3 size={16} /> {t('commercial.pricingStructure')}
                                    </h3>
                                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-full -z-0 opacity-50" />

                                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Free Tier */}
                                            <div className="border border-gray-100 bg-white/50 backdrop-blur rounded-2xl p-6 flex flex-col">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-gray-900">{t('commercial.pricingTiers.personal')}</h4>
                                                    <div className="text-3xl font-light text-gray-900 mt-2">$0</div>
                                                </div>
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {t('commercial.pricingTiers.features.core')}</li>
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {t('commercial.pricingTiers.features.community')}</li>
                                                </ul>
                                            </div>

                                            {/* Pro Tier */}
                                            <div className="border border-amber-200 bg-amber-50/50 backdrop-blur rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-amber-100/50">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-amber-900">{t('commercial.pricingTiers.pro')}</h4>
                                                    <div className="relative mt-2">
                                                        <span className="text-3xl font-light text-gray-900">$</span>
                                                        <input
                                                            type="number"
                                                            placeholder="19"
                                                            value={data.proPrice || ''}
                                                            onChange={(e) => handleUpdate({ proPrice: e.target.value })}
                                                            className="w-20 text-3xl font-light bg-transparent border-b border-amber-300 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-300 inline-block"
                                                        />
                                                        <span className="text-xs text-gray-400"> /mo</span>
                                                    </div>
                                                </div>
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.everything')}</li>
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.priority')}</li>
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> {t('commercial.pricingTiers.features.analytics')}</li>
                                                </ul>
                                            </div>

                                            {/* Enterprise Tier */}
                                            <div className="border border-gray-100 bg-white/50 backdrop-blur rounded-2xl p-6 flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-gray-900">{t('commercial.pricingTiers.enterprise')}</h4>
                                                    <div className="text-xl font-light text-gray-500 mt-2 pt-2">{t('commercial.pricingTiers.custom')}</div>
                                                </div>
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-gray-400" /> {t('commercial.pricingTiers.features.sso')}</li>
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-gray-400" /> {t('commercial.pricingTiers.features.manager')}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="growth-phase"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col"
                            >
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-10 text-white flex-1 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-8 text-emerald-400">
                                            <Megaphone size={32} />
                                            <span className="text-sm font-bold uppercase tracking-widest border px-3 py-1 rounded-full border-emerald-500/50 bg-emerald-500/10">{t('commercial.growthPhase')}</span>
                                        </div>

                                        <h2 className="text-4xl font-light mb-6">{t('commercial.growthTitle')} <br /><span className="text-gray-400">{t('commercial.growthSubtitle')}</span></h2>

                                        <p className="text-gray-400 max-w-lg mb-12 text-lg font-light leading-relaxed">
                                            {t('commercial.growthDesc')}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6">
                                                <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><Rocket size={16} /> {t('commercial.activeChannels')}</h4>
                                                <div className="space-y-2">
                                                    {MARKETING_CHANNELS.map(channel => {
                                                        const isActive = (data.marketingChannels || []).includes(channel.id);
                                                        return (
                                                            <button
                                                                key={channel.id}
                                                                onClick={() => toggleMarketingChannel(channel.id)}
                                                                className={`
                                                                    w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                                                                    ${isActive
                                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                                                        : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <channel.icon size={16} />
                                                                    <span className="text-sm font-medium">{channel.title}</span>
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
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Launch Checklist (Controller) */}
                <div className="space-y-10">
                    <section className={`transition-all duration-500 ${isLaunchReady ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200/80'} border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>
                        {/* Decorative Glowing Blobs */}
                        <div className={`absolute top-0 right-0 w-40 h-40 ${isLaunchReady ? 'bg-emerald-200' : 'bg-gradient-to-br from-amber-200 to-orange-200'} rounded-bl-full opacity-40 blur-2xl -z-0`} />
                        <div className={`absolute bottom-0 left-0 w-24 h-24 ${isLaunchReady ? 'bg-teal-200' : 'bg-gradient-to-tr from-yellow-200 to-amber-200'} rounded-tr-full opacity-30 blur-xl -z-0`} />

                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2 ${isLaunchReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                            <Rocket size={16} /> {t('commercial.launchReadiness')}
                        </h3>

                        <div className="space-y-4 relative z-10">
                            {CHECKLIST_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        const current = data.checklist || {};
                                        handleUpdate({ checklist: { ...current, [item.id]: !current[item.id] } });
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                                        ${isLaunchReady
                                            ? 'hover:bg-emerald-100/50 text-emerald-900'
                                            : 'hover:bg-white/60 text-amber-900'}
                                    `}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm
                                        ${data.checklist?.[item.id]
                                            ? (isLaunchReady ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white shadow-emerald-200' : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 text-white shadow-amber-200')
                                            : (isLaunchReady ? 'border-emerald-300 bg-white' : 'border-amber-300 bg-white/80 group-hover:border-amber-400')
                                        }
                                    `}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm transition-colors ${data.checklist?.[item.id] ? 'font-semibold' : 'font-light text-gray-500'}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className={`mt-8 pt-8 border-t ${isLaunchReady ? 'border-emerald-200' : 'border-amber-200/50'}`}>
                            <div className={`flex items-center justify-between text-xs font-medium mb-2 ${isLaunchReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                <span>{t('commercial.readiness')}</span>
                                <span>{checklistProgress} / 6</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${isLaunchReady ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${isLaunchReady ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                                    style={{ width: `${(checklistProgress / 6) * 100}%` }}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CommercialModule;
