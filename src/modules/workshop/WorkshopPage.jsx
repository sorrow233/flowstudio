import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Sprout, TrendingUp, Award, DollarSign, ArrowRight } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';

export default function WorkshopPage() {
    const { t } = useTranslation();
    const { items, addItem, moveItemNext, validateForNextStage, updateItem } = useProject();

    const earlyStage = items.filter(item => item.stage === STAGES.EARLY);
    const growthStage = items.filter(item => item.stage === STAGES.GROWTH);
    const advancedStage = items.filter(item => item.stage === STAGES.ADVANCED);
    const commercialStage = items.filter(item => item.stage === STAGES.COMMERCIAL);

    const handleMove = (item) => {
        let nextStage;
        switch (item.stage) {
            case STAGES.EARLY: nextStage = STAGES.GROWTH; break;
            case STAGES.GROWTH: nextStage = STAGES.ADVANCED; break;
            case STAGES.ADVANCED: nextStage = STAGES.COMMERCIAL; break;
            default: return; // Should not happen here
        }

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) {
            alert(validation.message);

            // Simple prompt for missing data to match "must have connection and name" requirement quickly
            if (!item.name || !item.name.trim()) {
                const newName = prompt(t('common.enter_project_name'), item.name);
                if (newName) updateItem(item.id, { name: newName });
            }
            if (!item.link || !item.link.trim()) {
                const newLink = prompt(t('common.enter_project_link'), item.link);
                if (newLink) updateItem(item.id, { link: newLink });
            }
            // User can try clicking again after entering
            return;
        }

        moveItemNext(item.id);
    };

    const renderSection = (titleKey, icon, items, stage) => (
        <section className="works-section">
            <div className="works-section-header">
                {icon}
                <h2 className="works-section-title">{t(`modules.workshop.stages.${titleKey}`)}</h2>
            </div>
            <div className="works-grid-Refined">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="works-card group relative"
                        style={{ backgroundColor: item.color }}
                    >
                        <div className="works-card-overlay flex flex-col justify-between h-full p-4">
                            <span className="works-card-name text-lg font-medium" style={{ color: item.textColor || 'black' }}>
                                {item.name || 'Untitled'}
                            </span>
                            {item.link && <span className="text-xs opacity-70 truncate w-full">{item.link}</span>}

                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMove(item);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/30 hover:bg-white/50 p-2 rounded-full"
                                    title={t('common.next_stage')}
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <div
                    className="works-card works-card-add cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => addItem(stage)}
                >
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

            {renderSection('early', <Sprout size={20} style={{ color: 'var(--color-accent-teal)' }} />, earlyStage, STAGES.EARLY)}
            {renderSection('growth', <TrendingUp size={20} style={{ color: 'var(--color-accent-indigo)' }} />, growthStage, STAGES.GROWTH)}
            {renderSection('advanced', <Award size={20} style={{ color: '#9c27b0' }} />, advancedStage, STAGES.ADVANCED)}
            {renderSection('commercial', <DollarSign size={20} style={{ color: 'var(--color-accent-vermilion)' }} />, commercialStage, STAGES.COMMERCIAL)}
        </div>
    );
}
