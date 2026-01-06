import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Globe, Shield, Code, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, className, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -5, transition: { duration: 0.3 } }}
        className={`bento-card ${className}`}
    >
        <div className="bento-icon-wrapper">
            <Icon size={24} className="bento-icon" />
        </div>
        <div className="bento-content">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        <div className="bento-glow" />
    </motion.div>
);

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: Zap,
            title: t('landing.feature_backlog_title', 'Strategic Backlog'),
            description: t('landing.feature_backlog_desc', 'Organize your digital arsenal. Prioritize ideas with AI-driven insights.'),
            className: 'card-wide'
        },
        {
            icon: Globe,
            title: t('landing.feature_workshop_title', 'The Workshop'),
            description: t('landing.feature_workshop_desc', 'Where ideas take physical form. Track every phase of development.'),
            className: 'card-tall'
        },
        {
            icon: Shield,
            title: t('landing.feature_command_title', 'Command Tower'),
            description: t('landing.feature_command_desc', 'Centralized execution. Deploy and manage with professional precision.'),
            className: 'card-standard'
        },
        {
            icon: Code,
            title: t('landing.feature_ai_title', 'AI Forge'),
            description: t('landing.feature_ai_desc', 'Collaborate with advanced LLMs to generate high-quality codebases.'),
            className: 'card-standard'
        },
        {
            icon: Cpu,
            title: t('landing.feature_infra_title', 'Smart Infra'),
            description: t('landing.feature_infra_desc', 'Automated Cloudflare and Firebase integrations for instant scale.'),
            className: 'card-wide'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-header">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-h2"
                >
                    {t('landing.features_headline', 'Engineered for Digital Mastery')}
                </motion.h2>
            </div>
            <div className="bento-grid">
                {features.map((feature, idx) => (
                    <FeatureCard key={idx} {...feature} index={idx} />
                ))}
            </div>
        </section>
    );
};

export default Features;
