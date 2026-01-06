import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, CheckSquare, Clock } from 'lucide-react';

export default function WorkshopPage() {
    const { t } = useTranslation();

    return (
        <div className="page-container workshop-page">
            <div className="page-header center">
                <h1 className="text-h2">{t('nav.workshop')}</h1>
                <p className="text-small">{t('modules.workshop.subtitle')}</p>
            </div>

            <div className="grid-stack">
                <div className="empty-state-card">
                    <Layout size={48} className="text-muted" />
                    <h3 className="text-h3">{t('modules.workshop.active_tasks')}</h3>
                    <p className="text-muted">{t('modules.workshop.progress')}: 0%</p>
                </div>
            </div>
        </div>
    );
}
