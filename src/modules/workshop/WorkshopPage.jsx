import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, TrendingUp, Award, DollarSign, CheckCircle } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';
import ProjectCard from '@/components/ProjectCard';
import AddProjectCard from '@/components/AddProjectCard';
import SectionHeader from '@/components/SectionHeader';

export default function WorkshopPage() {
    const { t } = useTranslation();
    const { items, addItem, updateItem, deleteItem, moveItemNext, validateForNextStage } = useProject();

    const earlyStage = items.filter(item => item.stage === STAGES.EARLY);
    const growthStage = items.filter(item => item.stage === STAGES.GROWTH);
    const advancedStage = items.filter(item => item.stage === STAGES.ADVANCED);
    const commercialStage = items.filter(item => item.stage === STAGES.COMMERCIAL);

    const handleAddItem = (stage) => (formData) => {
        addItem(stage, formData);
    };

    const handleMoveNext = (item) => {
        let nextStage;
        switch (item.stage) {
            case STAGES.EARLY: nextStage = STAGES.GROWTH; break;
            case STAGES.GROWTH: nextStage = STAGES.ADVANCED; break;
            case STAGES.ADVANCED: nextStage = STAGES.COMMERCIAL; break;
            default: return;
        }

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) {
            // TODO: Show elegant toast notification instead of alert
            alert(validation.message);
            return;
        }

        moveItemNext(item.id);
    };

    const stageConfig = [
        {
            key: STAGES.EARLY,
            icon: <Sprout size={18} style={{ color: 'var(--color-accent-teal)' }} />,
            title: t('modules.workshop.stages.early'),
            items: earlyStage,
            color: 'var(--color-accent-teal)'
        },
        {
            key: STAGES.GROWTH,
            icon: <TrendingUp size={18} style={{ color: 'var(--color-accent-indigo)' }} />,
            title: t('modules.workshop.stages.growth'),
            items: growthStage,
            color: 'var(--color-accent-indigo)'
        },
        {
            key: STAGES.ADVANCED,
            icon: <Award size={18} style={{ color: '#9c27b0' }} />,
            title: t('modules.workshop.stages.advanced'),
            items: advancedStage,
            color: '#9c27b0'
        },
        {
            key: STAGES.COMMERCIAL,
            icon: <DollarSign size={18} style={{ color: 'var(--color-accent-vermilion)' }} />,
            title: t('modules.workshop.stages.commercial'),
            items: commercialStage,
            color: 'var(--color-accent-vermilion)',
            isLast: true
        }
    ];

    return (
        <div className="project-page">
            <header className="project-page-header">
                <h1 className="project-page-title">{t('nav.workshop')}</h1>
                <p className="project-page-subtitle">{t('dashboard.workshop_desc')}</p>
            </header>

            {stageConfig.map(({ key, icon, title, items: stageItems, color, isLast }) => (
                <section key={key} className="project-section">
                    <SectionHeader
                        icon={icon}
                        title={title}
                        count={stageItems.length}
                    />
                    <div className="project-grid">
                        {stageItems.map((item) => (
                            <ProjectCard
                                key={item.id}
                                item={item}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                                onMoveNext={handleMoveNext}
                                accentColor={color}
                                showMoveButton={!isLast}
                            />
                        ))}
                        <AddProjectCard
                            onAdd={handleAddItem(key)}
                            accentColor={color}
                            addLabel={t('common.add_task')}
                        />
                    </div>
                </section>
            ))}
        </div>
    );
}
