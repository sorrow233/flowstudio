import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign, X } from 'lucide-react';

export default function CommandTowerPage() {
    const { t } = useTranslation();

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
        { key: 'inspiration', icon: <Lightbulb size={18} className="icon-yellow" />, label: t('modules.backlog.sections.inspiration') },
        { key: 'pending', icon: <Rocket size={18} className="icon-red" />, label: t('modules.backlog.sections.pending') },
        { key: 'early', icon: <Sprout size={18} className="icon-green" />, label: t('modules.workshop.stages.early') },
        { key: 'growth', icon: <TrendingUp size={18} className="icon-blue" />, label: t('modules.workshop.stages.growth') },
        { key: 'advanced', icon: <Award size={18} className="icon-purple" />, label: t('modules.workshop.stages.advanced') },
        { key: 'commercial', icon: <DollarSign size={18} className="icon-yellow" />, label: t('modules.workshop.stages.commercial') }
    ];

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
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
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.command_tower')}</h1>
                <div className="works-divider"></div>
            </header>

            {stageConfig.map(({ key, icon, label }) => (
                <section key={key} className="works-section">
                    <div className="works-section-header">
                        {icon}
                        <h2 className="works-section-title">{label}</h2>
                    </div>
                    <div className="works-grid-Refined command-grid">
                        {commands[key].map((cmd) => (
                            <div
                                key={cmd.id}
                                className="command-card"
                                onClick={() => copyToClipboard(cmd.content)}
                                title={t('common.click_to_copy')}
                            >
                                <div className="command-card-header">
                                    <h3 className="command-card-title">{cmd.title}</h3>
                                    <button
                                        className="command-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCommand(key, cmd.id);
                                        }}
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <code className="command-card-content">{cmd.content}</code>
                            </div>
                        ))}
                        <div
                            className="command-card command-card-add"
                            onClick={() => {
                                setNewCommand({ ...newCommand, stage: key });
                                setShowAddModal(true);
                            }}
                        >
                            <Plus size={24} />
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
