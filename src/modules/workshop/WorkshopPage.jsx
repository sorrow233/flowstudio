import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, TrendingUp, Award, DollarSign, Archive, RotateCcw } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';
import ProjectCard from '@/components/ProjectCard';
import AddProjectCard from '@/components/AddProjectCard';
import SectionHeader from '@/components/SectionHeader';
import SearchInput from '@/components/SearchInput';
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

export default function WorkshopPage() {
    const { t } = useTranslation();
    const { items, addItem, updateItem, deleteItem, moveItemNext, validateForNextStage, moveItemToStage, toggleArchive } = useProject();
    const [activeId, setActiveId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const filteredItems = items.filter(item => {
        const matchesSearch = (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.link.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.goal.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesArchive = showArchived ? item.archived : !item.archived;
        return matchesSearch && matchesArchive;
    });

    const earlyStage = filteredItems.filter(item => item.stage === STAGES.EARLY);
    const growthStage = filteredItems.filter(item => item.stage === STAGES.GROWTH);
    const advancedStage = filteredItems.filter(item => item.stage === STAGES.ADVANCED);
    const commercialStage = filteredItems.filter(item => item.stage === STAGES.COMMERCIAL);
    const archivedItems = filteredItems;

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
            const overStage = over.id;

            const validStages = [STAGES.EARLY, STAGES.GROWTH, STAGES.ADVANCED, STAGES.COMMERCIAL];
            if (validStages.includes(overStage) && !showArchived) {
                const result = moveItemToStage(active.id, overStage);
                if (!result.success) {
                    alert(result.message);
                }
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
                    <div>
                        <h1 className="project-page-title">
                            {showArchived ? t('common.archived_projects') : t('nav.workshop')}
                        </h1>
                        <p className="project-page-subtitle">
                            {showArchived ? t('common.archived_desc') : t('dashboard.workshop_desc')}
                        </p>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t('common.search_projects')}
                            onClear={() => setSearchQuery('')}
                        />
                        <button
                            className={`btn-icon ${showArchived ? 'active' : ''}`}
                            onClick={() => setShowArchived(!showArchived)}
                            title={showArchived ? t('common.view_active') : t('common.view_archive')}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: showArchived ? 'var(--bg-active)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {showArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
                        </button>
                    </div>
                </header>

                {showArchived ? (
                    <section className="project-section">
                        <SectionHeader
                            icon={<Archive size={18} />}
                            title={t('common.archived_items')}
                            count={archivedItems.length}
                        />
                        <div className="project-grid">
                            {archivedItems.map((item) => (
                                <ProjectCard
                                    key={item.id}
                                    item={item}
                                    variant="workshop"
                                    onUpdate={updateItem}
                                    onDelete={deleteItem}
                                    onArchive={toggleArchive}
                                    isArchived={true}
                                />
                            ))}
                            {archivedItems.length === 0 && (
                                <div className="empty-state">
                                    <p>{t('common.no_archived_items') || "No archived items"}</p>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <>
                        {stageConfig.map(({ key, icon, title, items: stageItems, color, isLast }) => (
                            <section key={key} className="project-section">
                                <SectionHeader
                                    icon={icon}
                                    title={title}
                                    count={stageItems.length}
                                />
                                <DroppableSection id={key} className="project-grid">
                                    {stageItems.map((item) => (
                                        <DraggableCard key={item.id} id={item.id}>
                                            <ProjectCard
                                                item={item}
                                                variant="workshop"
                                                onUpdate={updateItem}
                                                onDelete={deleteItem}
                                                onMoveNext={handleMoveNext}
                                                onArchive={toggleArchive}
                                                accentColor={color}
                                                showMoveButton={!isLast}
                                            />
                                        </DraggableCard>
                                    ))}
                                    <AddProjectCard
                                        onAdd={handleAddItem(key)}
                                        accentColor={color}
                                        addLabel={t('common.add_task')}
                                    />
                                </DroppableSection>
                            </section>
                        ))}
                    </>
                )}

                <DragOverlay>
                    {activeItem ? (
                        <DragOverlayCard
                            item={activeItem}
                            accentColor={
                                stageConfig.find(s => s.key === activeItem.stage)?.color || 'var(--color-accent)'
                            }
                        />
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
