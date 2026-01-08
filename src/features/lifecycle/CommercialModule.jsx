import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Coins, TrendingUp, ShieldCheck, Rocket, Check, CreditCard, Globe, Zap, BarChart3, Lock, RefreshCw,
    Copy, Terminal, Wallet, Megaphone, Share2, MousePointerClick, Hash, LineChart, Globe2
} from 'lucide-react';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { toast } from 'sonner';

// Revenue Models
const REVENUE_MODELS = [
    { id: 'subscription', title: 'Subscription (SaaS)', icon: RefreshCw, desc: 'Recurring via monthly/yearly plans.' },
    { id: 'one_time', title: 'One-Time Purchase', icon: CreditCard, desc: 'Single payment for lifetime.' },
    { id: 'freemium', title: 'Freemium', icon: Zap, desc: 'Free core, paid upgrades.' },
    { id: 'ads', title: 'Ad-Supported', icon: Globe, desc: 'Monetized via advertisements.' },
];

// Payment Providers
const PAYMENT_PROVIDERS = [
    { id: 'stripe', title: 'Stripe', desc: 'Standard for custom SaaS.', icon: CreditCard },
    { id: 'lemonsqueezy', title: 'Lemon Squeezy', desc: 'MoR, handles tax globally.', icon: Wallet },
    { id: 'paddle', title: 'Paddle', desc: 'Unified B2B billing.', icon: Globe2 },
    { id: 'revenuecat', title: 'RevenueCat', desc: 'Best for In-App Purchases.', icon: Coins },
];

// Marketing Channels
const MARKETING_CHANNELS = [
    { id: 'twitter', title: 'X / Twitter', icon: Hash, color: 'hover:text-blue-400' },
    { id: 'producthunt', title: 'Product Hunt', icon: Rocket, color: 'hover:text-orange-500' },
    { id: 'reddit', title: 'Reddit', icon: Megaphone, color: 'hover:text-orange-600' },
    { id: 'linkedin', title: 'LinkedIn', icon: Share2, color: 'hover:text-blue-700' },
    { id: 'seo', title: 'SEO & Blog', icon: Globe, color: 'hover:text-green-500' },
    { id: 'short_video', title: 'TikTok / Reels', icon: MousePointerClick, color: 'hover:text-pink-500' },
    { id: 'ads', title: 'Paid Ads', icon: LineChart, color: 'hover:text-purple-500' },
];

const CommercialModule = () => {
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
# Commercial Operations Directive: ${selectedProject.title}

## 1. Business Model
- **Type**: ${model?.title || 'Not Selected'}
- **Description**: ${model?.desc || 'N/A'}
- **Pricing**: ${data.proPrice ? `$${data.proPrice}/mo (Pro)` : 'TBD'}

## 2. Financial Infrastructure
- **Provider**: ${payment?.title || 'Not Selected'}
- **Rationale**: ${payment?.desc || 'Pending Selection'}

## 3. Growth Engine
- **Active Channels**: ${channels.length > 0 ? channels.join(', ') : 'None Selected'}

## 4. Launch Readiness
${Object.entries(data.checklist || {}).map(([key, val]) => `- [${val ? 'x' : ' '}] ${key}`).join('\n')}

> Generated via Flow Studio Commercial Module
`.trim();

        navigator.clipboard.writeText(commandText);
        toast.success('Commercial Directive copied', {
            description: 'Ready to paste into Command Center or Project Wiki.'
        });
    };

    if (commercialProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Coins size={32} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">No Commercial Projects</h2>
                <p className="text-gray-400 mt-2">Graduate a project from Primary Development to unlock strategies.</p>
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
                        Commercial Strategy
                    </h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide max-w-xl leading-relaxed">
                        {isLaunchReady
                            ? "Launch systems verified. Focus shifting to Growth Engine and User Acquisition."
                            : "Design the economic engine. Price your value, choose your rails, and prepare for launch."
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
                        Copy Operational Directive
                    </button>

                    {/* Project Selector (if multiple) */}
                    {commercialProjects.length > 1 && (
                        <div className="flex gap-2">
                            {commercialProjects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProject(p)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedProject.id === p.id ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    )}
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
                                        <Wallet size={16} /> 1. Financial Infrastructure
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
                                        <TrendingUp size={16} /> 2. Revenue Model
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
                                        <BarChart3 size={16} /> 3. Pricing Structure
                                    </h3>
                                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-full -z-0 opacity-50" />

                                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Free Tier */}
                                            <div className="border border-gray-100 bg-white/50 backdrop-blur rounded-2xl p-6 flex flex-col">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-gray-900">Personal</h4>
                                                    <div className="text-3xl font-light text-gray-900 mt-2">$0</div>
                                                </div>
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Core Features</li>
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Community Support</li>
                                                </ul>
                                            </div>

                                            {/* Pro Tier */}
                                            <div className="border border-amber-200 bg-amber-50/50 backdrop-blur rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-amber-100/50">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-amber-900">Pro</h4>
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
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> Everything in Free</li>
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> Priority Support</li>
                                                    <li className="text-xs text-gray-600 flex items-center gap-2"><Check size={12} className="text-amber-500" /> Advanced Analytics</li>
                                                </ul>
                                            </div>

                                            {/* Enterprise Tier */}
                                            <div className="border border-gray-100 bg-white/50 backdrop-blur rounded-2xl p-6 flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-gray-900">Enterprise</h4>
                                                    <div className="text-xl font-light text-gray-500 mt-2 pt-2">Custom</div>
                                                </div>
                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-gray-400" /> SSO & Security</li>
                                                    <li className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-gray-400" /> Dedicated Manager</li>
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
                                            <span className="text-sm font-bold uppercase tracking-widest border px-3 py-1 rounded-full border-emerald-500/50 bg-emerald-500/10">Growth Phase Active</span>
                                        </div>

                                        <h2 className="text-4xl font-light mb-6">Your Engine is Ready. <br /><span className="text-gray-400">It's time to acquire users.</span></h2>

                                        <p className="text-gray-400 max-w-lg mb-12 text-lg font-light leading-relaxed">
                                            Infrastructure is set. Financial rails are connected. Your strategy is now focused purely on distribution and channel optimization.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6">
                                                <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><Rocket size={16} /> Active Channels</h4>
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
                    <section className={`transition-all duration-500 ${isLaunchReady ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-900 text-white'} border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>
                        {!isLaunchReady && <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-bl-full opacity-50 -z-0" />}

                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2 ${isLaunchReady ? 'text-emerald-700' : 'text-gray-500'}`}>
                            <Rocket size={16} /> Launch Readiness
                        </h3>

                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 'market_fit', label: 'Problem-Solution Fit Confirmed' },
                                { id: 'waitlist', label: 'Waitlist Landing Page Live' },
                                { id: 'pricing', label: 'Pricing Model Finalized' },
                                { id: 'legal', label: 'Terms & Privacy Policy' },
                                { id: 'analytics', label: 'Analytics & Tracking Setup' },
                                { id: 'payments', label: 'Payment Gateway Connected' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        const current = data.checklist || {};
                                        handleUpdate({ checklist: { ...current, [item.id]: !current[item.id] } });
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group
                                        ${isLaunchReady
                                            ? 'hover:bg-emerald-100 text-emerald-900'
                                            : 'hover:bg-gray-800 text-gray-400'}
                                    `}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all 
                                        ${data.checklist?.[item.id]
                                            ? (isLaunchReady ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-amber-500 border-amber-500 text-black')
                                            : (isLaunchReady ? 'border-emerald-300' : 'border-gray-600 text-transparent group-hover:border-gray-500')
                                        }
                                    `}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm font-light transition-colors ${data.checklist?.[item.id] ? (isLaunchReady ? 'font-medium' : 'text-gray-200 decoration-amber-500/50') : ''}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className={`mt-8 pt-8 border-t ${isLaunchReady ? 'border-emerald-200' : 'border-gray-800'}`}>
                            <div className={`flex items-center justify-between text-xs mb-2 ${isLaunchReady ? 'text-emerald-600' : 'text-gray-500'}`}>
                                <span>Readiness</span>
                                <span>{checklistProgress} / 6</span>
                            </div>
                            <div className={`w-full h-1 rounded-full overflow-hidden ${isLaunchReady ? 'bg-emerald-200' : 'bg-gray-800'}`}>
                                <div
                                    className={`h-full transition-all duration-500 ${isLaunchReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
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
