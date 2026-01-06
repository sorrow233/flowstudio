import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Archive, Lightbulb, Rocket } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { STAGES } from '@/features/projects/domain';
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

export default function BacklogPage() {
    const { t } = useTranslation();
    const {
        items,
        addItem,
        updateItem,
        deleteItem,
        moveItemNext,
        moveItemToStage,
        toggleArchive
    } = useProjects();
    const [activeId, setActiveId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Filter Logic
    const filteredItems = items.filter(item => {
        const matchesSearch = (
            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.link || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.goal || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesArchive = showArchived ? item.archived : !item.archived;
        return matchesSearch && matchesArchive;
    });

    const inspirationItems = filteredItems.filter(item => item.stage === STAGES.INSPIRATION);
    const pendingItems = filteredItems.filter(item => item.stage === STAGES.PENDING);
    // For archived view, we can just show everything flat
    const archivedItems = filteredItems;

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
            const overStage = over.id;

            if ((overStage === STAGES.INSPIRATION || overStage === STAGES.PENDING) && !showArchived) {
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
                    <div>
                        <h1 className="project-page-title">
                            {showArchived ? t('common.archived_projects') : t('nav.backlog')}
                        </h1>
                        <p className="project-page-subtitle">
                            {showArchived ? t('common.archived_desc') : t('dashboard.backlog_desc')}
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
                                    variant="backlog"
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
                                            variant="backlog"
                                            onUpdate={updateItem}
                                            onDelete={deleteItem}
                                            onMoveNext={handleMoveNext}
                                            onArchive={toggleArchive}
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
                                            variant="backlog"
                                            onUpdate={updateItem}
                                            onDelete={deleteItem}
                                            onMoveNext={handleMoveNext}
                                            onArchive={toggleArchive}
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
                    </>
                )}

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
