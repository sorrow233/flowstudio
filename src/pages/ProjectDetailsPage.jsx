import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Target, Link as LinkIcon, Calendar,
    Terminal, Plus, Trash2, Copy, Check
} from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import LoadingFallback from '@/components/LoadingFallback';
import SectionHeader from '@/components/SectionHeader';
import CommandSelectorModal from '@/components/CommandSelectorModal';
import { useCommandTower } from '@/features/command-tower/hooks/useCommandTower';
import CommandItem from '@/modules/command-tower/components/CommandItem';
import { Logger } from '@/utils/logger';
import PhaseNavigator from '@/features/phase-navigator/PhaseNavigator';
import './ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { projects, updateProject, loading, toggleCommandCompletion, moveItemNext } = useProjects();
    const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const project = projects.find(p => p.id === id);
    const { commands: towerCommands } = useCommandTower();

    if (loading) return <LoadingFallback />;
    if (!project) {
        return (
            <div className="project-details-container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>{t('common.project_not_found') || "Project not found"}</h2>
                <button className="btn-secondary" onClick={() => navigate(-1)}>
                    {t('common.go_back') || "Go Back"}
                </button>
            </div>
        );
    }

    const pinnedCommands = project.pinnedCommands || [];

    const handlePinCommand = async (command) => {
        // Check if already pinned
        if (pinnedCommands.some(c => c.id === command.id)) {
            alert(t('common.command_already_pinned') || "Command already pinned");
            return;
        }

        const newPinned = [...pinnedCommands, {
            id: command.id,
            title: command.title,
            content: command.content,
            color: command.color
        }];

        await updateProject(project.id, { pinnedCommands: newPinned });
        Logger.info('ProjectDetails', 'Pinned command:', command.title);
    };

    const handleUnpinCommand = async (cmdId) => {
        if (!confirm(t('common.confirm_unpin') || "Unpin this command?")) return;
        const newPinned = pinnedCommands.filter(c => c.id !== cmdId);
        await updateProject(project.id, { pinnedCommands: newPinned });
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            Logger.info('ProjectDetails', 'Copied command');
        } catch (err) {
            Logger.error('ProjectDetails', 'Copy failed', err);
        }
    };

    const handleSaveTags = () => {
        const newTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        updateProject(project.id, { tags: newTags });
        setIsEditingTags(false);
    };

    // --- Stage Mapping Logic (Quantum Entanglement) ---
    const getSuggestedCommands = () => {
        if (!project || !towerCommands) return [];

        // 1. Map Project Stage to Command Tower Stage/Key
        // Project Stages: inspiration, pending, early, growth, advanced, commercial
        // Command Tower Keys: same keys used in storage (default keys match)
        const stageKey = project.stage;

        let candidates = towerCommands[stageKey] || [];

        // 2. Filter by Tags (Quantum Entanglement)
        // If project has tags, only show commands that match at least one tag.
        // If project has NO tags, show ALL commands for that stage (or maybe limited set? Default to all).
        if (project.tags && project.tags.length > 0) {
            candidates = candidates.filter(cmd => {
                if (!cmd.tags || cmd.tags.length === 0) return false; // Strict matching? Or lax? 
                // User said: "If project marked as React, only show React commands". Implies strict filter.
                return cmd.tags.some(tag => project.tags.includes(tag));
            });
        }

        return candidates;
    };

    const suggestedCommands = getSuggestedCommands();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="project-details-container animate-fade-in">
            {/* Header */}
            <header className="details-header">
                <button className="btn-icon-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="details-title-group">
                    <h1 className="details-title">{project.name}</h1>
                    <div className="details-meta">
                        {project.createdAt && (
                            <span className="meta-item">
                                <Calendar size={14} />
                                {formatDate(project.createdAt)}
                            </span>
                        )}
                        <span className={`status-badge status-${project.stage}`}>
                            {t(`modules.workshop.stages.${project.stage}`) || project.stage}
                        </span>
                    </div>
                </div>
            </header>

            <div className="details-content">
                {/* Left Column: Info */}
                <aside className="details-sidebar">
                    <div className="sidebar-card">
                        <h3>{t('common.about') || "About"}</h3>
                        {project.goal && (
                            <div className="info-row">
                                <Target size={16} className="info-icon" />
                                <p>{project.goal}</p>
                            </div>
                        )}

                        {/* Tags Section */}
                        <div className="info-row" style={{ alignItems: 'flex-start', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('common.tags') || "Tags"}</label>
                                <button
                                    className="btn-icon-sm"
                                    onClick={() => {
                                        setTagInput(project.tags ? project.tags.join(', ') : '');
                                        setIsEditingTags(!isEditingTags);
                                    }}
                                    style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}
                                >
                                    {isEditingTags ? t('common.cancel') : (t('common.edit') || "Edit")}
                                </button>
                            </div>

                            {isEditingTags ? (
                                <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        className="project-input"
                                        placeholder="react, api..."
                                        style={{ fontSize: '0.85rem', padding: '4px 8px' }}
                                    />
                                    <button className="btn-icon" onClick={handleSaveTags}><Check size={14} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {project.tags && project.tags.length > 0 ? (
                                        project.tags.map(tag => (
                                            <span key={tag} style={{
                                                fontSize: '0.75rem',
                                                background: 'var(--bg-secondary)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                            {t('common.no_tags') || "No tags"}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {project.link && (
                            <div className="info-row">
                                <LinkIcon size={16} className="info-icon" />
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    {project.link}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Quick Access to Pinned Commands */}
                    <div className="sidebar-card" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3>{t('common.pinned_commands') || "Pinned Commands"}</h3>
                            <button className="btn-icon-sm" onClick={() => setIsCommandModalOpen(true)}><Plus size={14} /></button>
                        </div>
                        <div className="pinned-commands-list">
                            {pinnedCommands.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No pinned commands.</p>
                            ) : (
                                pinnedCommands.map(cmd => (
                                    <div key={cmd.id} className="mini-pinned-item">
                                        <div className="mini-pinned-header">
                                            <span className="mini-pinned-title">{cmd.title}</span>
                                            <button className="btn-icon-danger" onClick={() => handleUnpinCommand(cmd.id)}><Trash2 size={12} /></button>
                                        </div>
                                        <div className="mini-pinned-code" onClick={() => copyToClipboard(cmd.content, cmd.id)}>
                                            <Terminal size={12} style={{ marginRight: '4px' }} />
                                            <span className="truncate">{cmd.content.substring(0, 20)}...</span>
                                            {copiedId === cmd.id && <Check size={12} color="#4ade80" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Right Column: Relations & Content */}
                <main className="details-main">

                    {/* Phase Navigator */}
                    <section className="details-section animate-slide-up">
                        <PhaseNavigator
                            project={project}
                            stageCommands={suggestedCommands}
                            onToggleCompletion={toggleCommandCompletion}
                            onAdvanceStage={(id) => moveItemNext(id, suggestedCommands)}
                        />
                    </section>

                </main>
            </div>

            <CommandSelectorModal
                isOpen={isCommandModalOpen}
                onClose={() => setIsCommandModalOpen(false)}
                onSelect={handlePinCommand}
            />
        </div>
    );
}
