import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ArchivePage() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-h2">{t('nav.archive')}</h1>
            <p className="text-small">{t('modules.archive.subtitle')}</p>
        </div>
    );
}
