import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign, X, Copy, Check } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import '@/components/ProjectCard.css';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState(null);

    // Commands organized by stage with localStorage persistence
    const [commands, setCommands] = useState(() => {
        const saved = localStorage.getItem('commandTowerData');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultCommands();
            }
        }
        return getDefaultCommands();
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCommand, setNewCommand] = useState({ title: '', content: '', stage: 'inspiration' });

    function getDefaultCommands() {
        return {
            inspiration: [
                { id: 1, title: 'Code Review Prompt', content: 'Review this code for best practices...' }
            ],
            pending: [
                { id: 2, title: 'Deploy Pipeline', content: 'npm run deploy:main' }
            ],
            early: [
                { id: 3, title: 'Git Status', content: 'git status' }
            ],
            growth: [
                { id: 4, title: 'Full Scan', content: '/filescan' }
            ],
            advanced: [],
            commercial: []
        };
    }

    const saveCommands = (newCommands) => {
        setCommands(newCommands);
        localStorage.setItem('commandTowerData', JSON.stringify(newCommands));
    };

    const stageConfig = [
        { key: 'inspiration', icon: <Lightbulb size={18} style={{ color: 'var(--color-accent-teal)' }} />, label: t('modules.backlog.sections.inspiration') },
        { key: 'pending', icon: <Rocket size={18} style={{ color: 'var(--color-accent-vermilion)' }} />, label: t('modules.backlog.sections.pending') },
        { key: 'early', icon: <Sprout size={18} style={{ color: 'var(--color-accent-teal)' }} />, label: t('modules.workshop.stages.early') },
        { key: 'growth', icon: <TrendingUp size={18} style={{ color: 'var(--color-accent-indigo)' }} />, label: t('modules.workshop.stages.growth') },
        { key: 'advanced', icon: <Award size={18} style={{ color: '#9c27b0' }} />, label: t('modules.workshop.stages.advanced') },
        { key: 'commercial', icon: <DollarSign size={18} style={{ color: 'var(--color-accent-vermilion)' }} />, label: t('modules.workshop.stages.commercial') }
    ];

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleAddCommand = () => {
        if (!newCommand.title.trim() || !newCommand.content.trim()) return;

        const newId = Date.now();
        const updatedCommands = {
            ...commands,
            [newCommand.stage]: [...commands[newCommand.stage], { id: newId, title: newCommand.title, content: newCommand.content }]
        };
        saveCommands(updatedCommands);
        setNewCommand({ title: '', content: '', stage: 'inspiration' });
        setShowAddModal(false);
    };

    const handleDeleteCommand = (stage, id) => {
        const updatedCommands = {
            ...commands,
            [stage]: commands[stage].filter(cmd => cmd.id !== id)
        };
        saveCommands(updatedCommands);
    };

    return (
        <div className="project-page">
            <header className="project-page-header">
                <h1 className="project-page-title">{t('nav.command_tower')}</h1>
                <p className="project-page-subtitle">{t('dashboard.command_tower_desc')}</p>
            </header>

            {stageConfig.map(({ key, icon, label }) => (
                <section key={key} className="project-section">
                    <SectionHeader
                        icon={icon}
                        title={label}
                        count={commands[key].length}
                    />
                    <div className="command-grid-new">
                        {commands[key].map((cmd) => (
                            <div
                                key={cmd.id}
                                className="command-card-new"
                                onClick={() => copyToClipboard(cmd.content, cmd.id)}
                            >
                                <div className="command-card-header-new">
                                    <h3 className="command-card-title-new">{cmd.title}</h3>
                                    <div className="command-card-actions-new">
                                        {copiedId === cmd.id ? (
                                            <span className="command-copied-badge">
                                                <Check size={12} />
                                                {t('common.copied')}
                                            </span>
                                        ) : (
                                            <Copy size={14} className="command-copy-icon" />
                                        )}
                                        <button
                                            className="command-delete-btn-new"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCommand(key, cmd.id);
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <code className="command-card-code">{cmd.content}</code>
                            </div>
                        ))}
                        <div
                            className="command-card-new command-card-add-new"
                            onClick={() => {
                                setNewCommand({ ...newCommand, stage: key });
                                setShowAddModal(true);
                            }}
                        >
                            <Plus size={20} />
                            <span>{t('common.add')}</span>
                        </div>
                    </div>
                </section>
            ))}

            {/* Add Command Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('command_tower.add_command')}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t('command_tower.title')}</label>
                                <input
                                    type="text"
                                    value={newCommand.title}
                                    onChange={e => setNewCommand({ ...newCommand, title: e.target.value })}
                                    placeholder={t('command_tower.title_placeholder')}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('command_tower.command')}</label>
                                <textarea
                                    value={newCommand.content}
                                    onChange={e => setNewCommand({ ...newCommand, content: e.target.value })}
                                    placeholder={t('command_tower.command_placeholder')}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('command_tower.stage')}</label>
                                <select
                                    value={newCommand.stage}
                                    onChange={e => setNewCommand({ ...newCommand, stage: e.target.value })}
                                >
                                    {stageConfig.map(s => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</button>
                            <button className="btn btn-primary" onClick={handleAddCommand}>{t('common.add')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
