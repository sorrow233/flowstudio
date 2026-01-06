import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Rocket } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';
import ProjectCard from '@/components/ProjectCard';
import AddProjectCard from '@/components/AddProjectCard';
import SectionHeader from '@/components/SectionHeader';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor
} from '@dnd-kit/core';
import DraggableCard from '@/components/DraggableCard';
import DroppableSection from '@/components/DroppableSection';
import DragOverlayCard from '@/components/DragOverlayCard';

export default function BacklogPage() {
    const { t } = useTranslation();
    const { items, addItem, updateItem, deleteItem, moveItemNext, moveItemToStage } = useProject();
    const [activeId, setActiveId] = React.useState(null);

    const inspirationItems = items.filter(item => item.stage === STAGES.INSPIRATION);
    const pendingItems = items.filter(item => item.stage === STAGES.PENDING);

    const handleAddItem = (stage) => (formData) => {
        addItem(stage, formData);
    };

    const handleMoveNext = (item) => {
        moveItemNext(item.id);
    };

    // DnD Logic
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // over.id should be the stage name (container id)
            // or we might need to be careful if we dropping on a card? 
            // DroppableSection id = stage
            const overStage = over.id;

            // Only handle if dropping onto a valid stage section
            if (overStage === STAGES.INSPIRATION || overStage === STAGES.PENDING) {
                moveItemToStage(active.id, overStage);
            }
        }
        setActiveId(null);
    };

    const activeItem = activeId ? items.find(i => i.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
                    <DroppableSection id={STAGES.INSPIRATION} className="project-grid">
                        {inspirationItems.map((item) => (
                            <DraggableCard key={item.id} id={item.id}>
                                <ProjectCard
                                    item={item}
                                    onUpdate={updateItem}
                                    onDelete={deleteItem}
                                    onMoveNext={handleMoveNext}
                                    accentColor="var(--color-accent-teal)"
                                />
                            </DraggableCard>
                        ))}
                        <AddProjectCard
                            onAdd={handleAddItem(STAGES.INSPIRATION)}
                            accentColor="var(--color-accent-teal)"
                            addLabel={t('common.add_idea')}
                        />
                    </DroppableSection>
                </section>

                {/* Pending Development */}
                <section className="project-section">
                    <SectionHeader
                        icon={<Rocket size={18} style={{ color: 'var(--color-accent-vermilion)' }} />}
                        title={t('modules.backlog.sections.pending')}
                        count={pendingItems.length}
                    />
                    <DroppableSection id={STAGES.PENDING} className="project-grid">
                        {pendingItems.map((item) => (
                            <DraggableCard key={item.id} id={item.id}>
                                <ProjectCard
                                    item={item}
                                    onUpdate={updateItem}
                                    onDelete={deleteItem}
                                    onMoveNext={handleMoveNext}
                                    accentColor="var(--color-accent-vermilion)"
                                />
                            </DraggableCard>
                        ))}
                        <AddProjectCard
                            onAdd={handleAddItem(STAGES.PENDING)}
                            accentColor="var(--color-accent-vermilion)"
                            addLabel={t('common.add_project')}
                        />
                    </DroppableSection>
                </section>

                <DragOverlay>
                    {activeItem ? (
                        <DragOverlayCard
                            item={activeItem}
                            accentColor={activeItem.stage === STAGES.INSPIRATION ? 'var(--color-accent-teal)' : 'var(--color-accent-vermilion)'}
                        />
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
