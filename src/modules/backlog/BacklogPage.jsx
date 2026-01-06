import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, List, PlayCircle } from 'lucide-react';

export default function BacklogPage() {
    const { t } = useTranslation();

    return (
        <div className="page-container backlog-page">
            <div className="page-header center">
                <h1 className="text-h2">{t('nav.backlog')}</h1>
                <p className="text-small">{t('modules.backlog.subtitle')}</p>
            </div>

            <div className="grid-stack">
                <div className="empty-state-card">
                    <Layers size={48} className="text-muted" />
                    <h3 className="text-h3">{t('modules.backlog.priority')}</h3>
                    <button className="btn btn-primary gap-2 mt-4">
                        <PlayCircle size={16} />
                        <span>{t('modules.backlog.start_sprint')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
