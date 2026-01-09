import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Coins, TrendingUp, CreditCard, Globe, Zap, BarChart3,
    Terminal, Wallet, Megaphone, Rocket, Hash, LineChart, Globe2,
    Share2, MousePointerClick
} from 'lucide-react';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { toast } from 'sonner';
import { useTranslation } from '../i18n';

// Components
import CommercialHeader from './components/commercial/CommercialHeader';
import PaymentProviderSelector from './components/commercial/PaymentProviderSelector';
import RevenueModelSelector from './components/commercial/RevenueModelSelector';
import PricingStructure from './components/commercial/PricingStructure';
import AiConfigurationPanel from './components/commercial/AiConfigurationPanel';
import GrowthPhase from './components/commercial/GrowthPhase';

// Configuration Data
const REVENUE_MODELS = [
    { id: 'subscription', icon: RefreshCwIcon },
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

// Helper icons because local imports are messy
function RefreshCwIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    );
}

const CommercialModule = () => {
    const { t } = useTranslation();
    const { doc } = useSync();
    const {
        projects: allProjects,
        updateProject
    } = useSyncedProjects(doc, 'all_projects');

    const location = useLocation();
    const [selectedProject, setSelectedProject] = useState(null);

    const commercialProjects = React.useMemo(() => {
        // Show all projects that have graduated from Primary (Development)
        // This includes 'advanced', 'final', 'commercial', or 'modules'
        return allProjects.filter(p => ['advanced', 'final', 'commercial', 'modules'].includes(p.stage));
    }, [allProjects]);

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
// Checklist logic removed for AI Config
${t('commercial.directive.readiness')}
- [${data.isLaunched ? 'x' : ' '}] ${t('commercial.aiConfig.unlocked')}

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
    const isLaunchReady = data.isLaunched === true;

    const handleUnlock = () => {
        handleUpdate({ isLaunched: true });
    };

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
                    <AiConfigurationPanel
                        onCopy={handleCopyCommand}
                        onUnlock={handleUnlock}
                        isLaunched={isLaunchReady}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommercialModule;
