import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Shield, Globe } from 'lucide-react';

const Features = () => {
    const { t } = useTranslation();
    return (
        <section className="features-section">
            <div className="feature-card">
                <div className="feature-icon"><Zap size={32} /></div>
                <h3>{t('nav.backlog', 'Backlog')}</h3>
                <p>{t('dashboard.backlog_desc', 'Manage approved ideas pending development.')}</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon"><Globe size={32} /></div>
                <h3>{t('nav.workshop', 'Workshop')}</h3>
                <p>{t('dashboard.workshop_desc', 'Track active projects and tasks.')}</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon"><Shield size={32} /></div>
                <h3>{t('nav.command_tower', 'Command Tower')}</h3>
                <p>{t('dashboard.command_tower_desc', 'Execute tasks with AI Copilot.')}</p>
            </div>
        </section>
    );
};

export default Features;
