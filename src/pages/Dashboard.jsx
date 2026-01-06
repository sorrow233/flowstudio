import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Target, Zap, Archive, Layers as IconLayers, Layout as IconLayout } from 'lucide-react';
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
                    title={t('nav.incubator')}
                    icon={Sparkles}
                    description={t('dashboard.incubator_desc')}
                    to="/incubator"
                    color="var(--color-accent-vermilion)"
                />
                <ModuleCard
                    title={t('nav.backlog')}
                    icon={IconLayers}
                    description={t('dashboard.backlog_desc')}
                    to="/backlog"
                    color="var(--color-accent-orange)"
                />
                <ModuleCard
                    title={t('nav.workshop')}
                    icon={IconLayout}
                    description={t('dashboard.workshop_desc')}
                    to="/workshop"
                    color="var(--color-accent-blue)"
                />
                <ModuleCard
                    title={t('nav.vision_studio')}
                    icon={Target}
                    description={t('dashboard.vision_studio_desc')}
                    to="/vision-studio"
                    color="var(--color-accent-teal)"
                />
                <ModuleCard
                    title={t('nav.command_tower')}
                    icon={Zap}
                    description={t('dashboard.command_tower_desc')}
                    to="/command-tower"
                    color="var(--color-accent-indigo)"
                />
                <ModuleCard
                    title={t('nav.archive')}
                    icon={Archive}
                    description={t('dashboard.archive_desc')}
                    to="/archive"
                    color="var(--text-secondary)"
                />
            </div>
        </div>
    );
}
