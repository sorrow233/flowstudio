import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Layers as IconLayers, Layout as IconLayout } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModuleCard = ({ title, icon: Icon, description, to, color }) => (
    <Link to={to} className="module-card">
        <div className="module-header">
            <div className="module-icon" style={{ '--icon-color': color }}>
                <Icon size={24} color={color} />
            </div>
        </div>
        <div className="module-content">
            <h3 className="text-h3 module-title">{title}</h3>
            <p className="text-small module-desc">{description}</p>
        </div>
    </Link>
);

export default function Dashboard() {
    const { t } = useTranslation();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="text-h1">{t('app.title')}</h1>
                <p className="text-body subtitle">
                    {t('dashboard.subtitle')}
                </p>
            </div>

            <div className="dashboard-grid">
                <ModuleCard
                    title={t('nav.backlog')}
                    icon={IconLayers}
                    description={t('dashboard.backlog_desc')}
                    to="/app/backlog"
                    color="var(--color-accent-orange)"
                />
                <ModuleCard
                    title={t('nav.workshop')}
                    icon={IconLayout}
                    description={t('dashboard.workshop_desc')}
                    to="/app/workshop"
                    color="var(--color-accent-blue)"
                />
                <ModuleCard
                    title={t('nav.command_tower')}
                    icon={Zap}
                    description={t('dashboard.command_tower_desc')}
                    to="/app/command-tower"
                    color="var(--color-accent-indigo)"
                />
            </div>
        </div>
    );
}
