import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Layers as IconLayers, Layout as IconLayout, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ModuleCard = ({ title, icon: Icon, description, to, color, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
        <Link to={to} className="premium-module-card">
            <div className="module-glow" style={{ background: `radial-gradient(circle at top right, ${color}22, transparent 70%)` }} />
            <div className="module-header">
                <div className="module-icon-box" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={28} />
                </div>
                <div className="module-arrow">
                    <ArrowUpRight size={20} />
                </div>
            </div>
            <div className="module-body">
                <h3 className="module-title">{title}</h3>
                <p className="module-desc">{description}</p>
            </div>
            <div className="module-footer">
                <span className="module-status">Open Workspace</span>
            </div>
        </Link>
    </motion.div>
);

export default function Dashboard() {
    const { t } = useTranslation();

    const modules = [
        {
            title: t('nav.backlog'),
            icon: IconLayers,
            description: t('dashboard.backlog_desc'),
            to: "/app/backlog",
            color: "var(--color-accent-sakura)"
        },
        {
            title: t('nav.workshop'),
            icon: IconLayout,
            description: t('dashboard.workshop_desc'),
            to: "/app/workshop",
            color: "var(--color-accent-sora)"
        },
        {
            title: t('nav.command_tower'),
            icon: Zap,
            description: t('dashboard.command_tower_desc'),
            to: "/app/command-tower",
            color: "var(--color-accent-matcha)"
        }
    ];

    return (
        <div className="dashboard-layout">
            <div className="dashboard-content-zen">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="dashboard-heading"
                >
                    <h1 className="text-h1">{t('app.title', 'Flow Studio')}</h1>
                    <p className="text-body subtitle">
                        {t('dashboard.subtitle', 'Cultivate your ideas in a space of focused engineering.')}
                    </p>
                </motion.header>

                <div className="premium-dashboard-grid">
                    {modules.map((mod, idx) => (
                        <ModuleCard key={idx} {...mod} index={idx} />
                    ))}
                </div>
            </div>
        </div>
    );
}
