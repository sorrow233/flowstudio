import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Coins, TrendingUp, CreditCard, Globe, Zap, BarChart3,
    Terminal, Wallet, Megaphone, Rocket, Hash, LineChart, Globe2,
    Share2, MousePointerClick, RefreshCw
} from 'lucide-react';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';
import { toast } from 'sonner';
import { useTranslation } from '../i18n';

// Components
import CommercialHeader from './components/commercial/CommercialHeader';
import PaymentProviderSelector from './components/commercial/PaymentProviderSelector';
import RevenueModelSelector from './components/commercial/RevenueModelSelector';
import PricingStructure from './components/commercial/PricingStructure';
import LaunchChecklist from './components/commercial/LaunchChecklist';
import GrowthPhase from './components/commercial/GrowthPhase';

// Configuration Data
const REVENUE_MODELS = [
    { id: 'subscription', icon: RefreshCw },
    { id: 'one_time', icon: CreditCard },
    { id: 'freemium', icon: Zap },
    { id: 'ads', icon: Globe },
];

const PAYMENT_PROVIDERS = [
    { id: 'stripe', icon: CreditCard },
    { id: 'lemonsqueezy', icon: Wallet },
    { id: 'paddle', icon: Globe2 },
    { id: 'revenuecat', icon: Coins },
];

const MARKETING_CHANNELS = [
    { id: 'twitter', icon: Hash },
    { id: 'producthunt', icon: Rocket },
    { id: 'reddit', icon: Megaphone },
    { id: 'linkedin', icon: Share2 },
    { id: 'seo', icon: Globe },
    { id: 'short_video', icon: MousePointerClick },
    { id: 'ads', icon: LineChart },
];

const CommercialModule = () => {
    const { t } = useTranslation();
    const { doc } = useSyncStore('flowstudio_v1');
    const {
        projects,
        updateProject
    } = useSyncedProjects(doc, 'primary_projects');

    const location = useLocation();
    const [selectedProject, setSelectedProject] = useState(null);

    const commercialProjects = React.useMemo(() => {
        return projects.filter(p => (p.subStage || 1) >= 6);
    }, [projects]);

    useEffect(() => {
        if (commercialProjects.length > 0) {
            const passedId = location.state?.projectId;
            if (passedId && !selectedProject) {
                const target = commercialProjects.find(p => p.id === passedId);
                if (target) {
                    setSelectedProject(target);
                    return;
                }
            }

            if (!selectedProject) {
                setSelectedProject(commercialProjects[0]);
            } else {
                const current = commercialProjects.find(p => p.id === selectedProject.id);
                if (current) setSelectedProject(current);
            }
        }
    }, [commercialProjects, location.state]);

    const handleUpdate = (updates) => {
        if (selectedProject) {
            updateProject(selectedProject.id, {
                commercial: { ...(selectedProject.commercial || {}), ...updates }
            });
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

        const commandText = `
# ${t('commercial.directive.title')}: ${selectedProject.title}

## ${t('commercial.directive.model')}
- **${t('commercial.directive.type')}**: ${t(`commercial.models.${data.model}`) || t('commercial.directive.notSelected')}
- **${t('commercial.directive.desc')}**: ${t(`commercial.models.${data.model}Desc`) || 'N/A'}
- **${t('commercial.directive.pricing')}**: ${data.proPrice ? `$${data.proPrice}/mo (Pro)` : t('commercial.directive.tbd')}

## ${t('commercial.directive.infrastructure')}
- **${t('commercial.directive.provider')}**: ${t(`commercial.payment.${data.paymentProvider}`) || t('commercial.directive.notSelected')}
- **${t('commercial.directive.rationale')}**: ${t(`commercial.payment.${data.paymentProvider}Desc`) || t('commercial.directive.pending')}

## ${t('commercial.directive.growth')}
- **${t('commercial.directive.channels')}**: ${(data.marketingChannels || []).map(id => t(`commercial.marketing.${id}`)).join(', ') || t('commercial.directive.none')}

## ${t('commercial.directive.readiness')}
${Object.keys(data.checklist || {}).map(key => `- [${data.checklist[key] ? 'x' : ' '}] ${t(`commercial.checklist.${key}`)}`).join('\n')}

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
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Coins size={32} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white">{t('commercial.noProjectsTitle')}</h2>
                <p className="text-gray-400 mt-2">{t('commercial.noProjectsDesc')}</p>
            </div>
        );
    }

    if (!selectedProject) return null;

    const data = selectedProject.commercial || {};
    const checklistProgress = Object.keys(data.checklist || {}).filter(key => data.checklist[key]).length;
    const isLaunchReady = checklistProgress >= 6;

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-24">
            <CommercialHeader
                isLaunchReady={isLaunchReady}
                handleCopyCommand={handleCopyCommand}
                commercialProjects={commercialProjects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                                <PaymentProviderSelector
                                    providers={PAYMENT_PROVIDERS}
                                    selectedProviderId={data.paymentProvider}
                                    onSelect={(id) => handleUpdate({ paymentProvider: id })}
                                />

                                <RevenueModelSelector
                                    models={REVENUE_MODELS}
                                    selectedModelId={data.model}
                                    onSelect={(id) => handleUpdate({ model: id })}
                                />

                                <PricingStructure
                                    proPrice={data.proPrice}
                                    onUpdateProPrice={(price) => handleUpdate({ proPrice: price })}
                                />
                            </motion.div>
                        ) : (
                            <GrowthPhase
                                channels={MARKETING_CHANNELS}
                                activeChannelIds={data.marketingChannels || []}
                                onToggleChannel={toggleMarketingChannel}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-10">
                    <LaunchChecklist
                        checklist={data.checklist}
                        isLaunchReady={isLaunchReady}
                        progress={checklistProgress}
                        onToggle={(id) => {
                            const current = data.checklist || {};
                            handleUpdate({ checklist: { ...current, [id]: !current[id] } });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommercialModule;
