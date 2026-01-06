import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Rocket } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';
import ProjectCard from '@/components/ProjectCard';
import AddProjectCard from '@/components/AddProjectCard';
import SectionHeader from '@/components/SectionHeader';

export default function BacklogPage() {
    const { t } = useTranslation();
    const { items, addItem, updateItem, deleteItem, moveItemNext } = useProject();

    const inspirationItems = items.filter(item => item.stage === STAGES.INSPIRATION);
    const pendingItems = items.filter(item => item.stage === STAGES.PENDING);

    const handleAddItem = (stage) => (formData) => {
        addItem(stage, formData);
    };

    const handleMoveNext = (item) => {
        moveItemNext(item.id);
    };

    return (
        <div className="project-page">
            <header className="project-page-header">
                <h1 className="project-page-title">{t('nav.backlog')}</h1>
                <p className="project-page-subtitle">{t('dashboard.backlog_desc')}</p>
            </header>

            {/* Inspiration Pool */}
            <section className="project-section">
                <SectionHeader
                    icon={<Lightbulb size={18} style={{ color: 'var(--color-accent-teal)' }} />}
                    title={t('modules.backlog.sections.inspiration')}
                    count={inspirationItems.length}
                />
                <div className="project-grid">
                    {inspirationItems.map((item) => (
                        <ProjectCard
                            key={item.id}
                            item={item}
                            onUpdate={updateItem}
                            onDelete={deleteItem}
                            onMoveNext={handleMoveNext}
                            accentColor="var(--color-accent-teal)"
                        />
                    ))}
                    <AddProjectCard
                        onAdd={handleAddItem(STAGES.INSPIRATION)}
                        accentColor="var(--color-accent-teal)"
                        addLabel={t('common.add_idea')}
                    />
                </div>
            </section>

            {/* Pending Development */}
            <section className="project-section">
                <SectionHeader
                    icon={<Rocket size={18} style={{ color: 'var(--color-accent-vermilion)' }} />}
                    title={t('modules.backlog.sections.pending')}
                    count={pendingItems.length}
                />
                <div className="project-grid">
                    {pendingItems.map((item) => (
                        <ProjectCard
                            key={item.id}
                            item={item}
                            onUpdate={updateItem}
                            onDelete={deleteItem}
                            onMoveNext={handleMoveNext}
                            accentColor="var(--color-accent-vermilion)"
                        />
                    ))}
                    <AddProjectCard
                        onAdd={handleAddItem(STAGES.PENDING)}
                        accentColor="var(--color-accent-vermilion)"
                        addLabel={t('common.add_project')}
                    />
                </div>
            </section>
        </div>
    );
}
