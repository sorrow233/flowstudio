import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Sprout, TrendingUp, Award, DollarSign } from 'lucide-react';

export default function WorkshopPage() {
    const { t } = useTranslation();

    // Static demo data - in production, these would come from a data store
    const earlyStage = [
        { id: 101, name: 'New UI Prototype', color: '#e0f7fa', textColor: '#006064' }
    ];

    const growthStage = [
        { id: 102, name: 'API Integration', color: '#e1bee7', textColor: '#4a148c' }
    ];

    const advancedStage = [
        { id: 103, name: 'Security Audit', color: '#ffecb3', textColor: '#ff6f00' }
    ];

    const commercialStage = [
        { id: 104, name: 'Pro Version Launch', color: '#c8e6c9', textColor: '#1b5e20' }
    ];

    const renderSection = (titleKey, icon, items) => (
        <section className="works-section">
            <div className="works-section-header">
                {icon}
                <h2 className="works-section-title">{t(`modules.workshop.stages.${titleKey}`)}</h2>
            </div>
            <div className="works-grid-Refined">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="works-card"
                        style={{ backgroundColor: item.color }}
                    >
                        <div className="works-card-overlay">
                            <span className="works-card-name" style={{ color: item.textColor || 'white' }}>{item.name}</span>
                        </div>
                    </div>
                ))}
                <div className="works-card works-card-add">
                    <Plus size={32} />
                    <span>{t('common.add_task')}</span>
                </div>
            </div>
        </section>
    );

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.workshop')}</h1>
                <div className="works-divider"></div>
            </header>

            {renderSection('early', <Sprout size={20} style={{ color: 'var(--color-accent-teal)' }} />, earlyStage)}
            {renderSection('growth', <TrendingUp size={20} style={{ color: 'var(--color-accent-indigo)' }} />, growthStage)}
            {renderSection('advanced', <Award size={20} style={{ color: '#9c27b0' }} />, advancedStage)}
            {renderSection('commercial', <DollarSign size={20} style={{ color: 'var(--color-accent-vermilion)' }} />, commercialStage)}
        </div>
    );
}
