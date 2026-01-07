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
import { Logger } from '@/utils/logger';
import './ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { projects, updateProject, loading } = useProjects();
    const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const project = projects.find(p => p.id === id);

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
        } catch (err) {
            Logger.error('ProjectDetails', 'Copy failed', err);
        }
    };

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
                        {project.link && (
                            <div className="info-row">
                                <LinkIcon size={16} className="info-icon" />
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    {project.link}
                                </a>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Column: Relations & Content */}
                <main className="details-main">
                    {/* Access / Commands Section */}
                    <section className="details-section">
                        <div className="section-header-row">
                            <SectionHeader
                                icon={<Terminal size={18} />}
                                title={t('common.pinned_commands') || "Pinned Commands"}
                                count={pinnedCommands.length}
                            />
                            <button
                                className="btn-add-command"
                                onClick={() => setIsCommandModalOpen(true)}
                            >
                                <Plus size={14} />
                                {t('common.pin_command') || "Pin Command"}
                            </button>
                        </div>

                        <div className="pinned-commands-grid">
                            {pinnedCommands.length === 0 ? (
                                <div className="empty-relations">
                                    <p>{t('common.no_pinned_commands') || "No commands pinned yet. Add frequently used commands from Command Tower."}</p>
                                </div>
                            ) : (
                                pinnedCommands.map(cmd => (
                                    <div key={cmd.id} className="pinned-command-card" style={{ borderLeftColor: cmd.color || 'var(--color-primary)' }}>
                                        <div className="pinned-cmd-header">
                                            <span className="pinned-cmd-title">{cmd.title}</span>
                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => handleUnpinCommand(cmd.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div
                                            className="pinned-cmd-code-block"
                                            onClick={() => copyToClipboard(cmd.content, cmd.id)}
                                            title={t('common.click_to_copy') || "Click to copy"}
                                        >
                                            <code>{cmd.content}</code>
                                            <div className="copy-indicator">
                                                {copiedId === cmd.id ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
