import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus, Trash2, Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign,
    X, Copy, Check, MoreVertical, Edit2, Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SectionHeader from '@/components/SectionHeader';
import SearchInput from '@/components/SearchInput';
import './CommandTowerPage.css';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState(null);
    const [showAddCommandModal, setShowAddCommandModal] = useState(false);
    const [showAddStageModal, setShowAddStageModal] = useState(false);

    // --- State Management ---

    // Stages: Custom + Default
    const defaultStages = [
        { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'var(--color-accent-matcha)' },
        { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'var(--color-accent-sakura)' },
        { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'var(--color-accent-matcha)' },
        { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'var(--color-accent-sora)' },
        { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: '#9c27b0' },
        { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'var(--color-accent-sakura)' }
    ];

    const [stages, setStages] = useState(() => {
        const saved = localStorage.getItem('commandTowerStages');
        return saved ? JSON.parse(saved) : defaultStages;
    });

    // Commands
    const [commands, setCommands] = useState(() => {
        const saved = localStorage.getItem('commandTowerData');
        return saved ? JSON.parse(saved) : getDefaultCommands();
    });

    const [newCommand, setNewCommand] = useState({ title: '', content: '', stage: '' });
    const [newStage, setNewStage] = useState({ key: '', label: '', icon: 'Layers', color: '#6366f1' });
    const [searchQuery, setSearchQuery] = useState('');

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('commandTowerData', JSON.stringify(commands));
    }, [commands]);

    useEffect(() => {
        localStorage.setItem('commandTowerStages', JSON.stringify(stages));
    }, [stages]);

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

    // --- Helpers ---
    const getIcon = (iconName, color) => {
        const props = { size: 20, style: { color } };
        const icons = { Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign, Layers };
        const IconComponent = icons[iconName] || Layers;
        return <IconComponent {...props} />;
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            // Fallback
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

    // --- Handlers ---

    const handleAddCommand = () => {
        if (!newCommand.title.trim() || !newCommand.content.trim() || !newCommand.stage) return;
        const newId = Date.now();

        setCommands(prev => ({
            ...prev,
            [newCommand.stage]: [...(prev[newCommand.stage] || []), {
                id: newId,
                title: newCommand.title,
                content: newCommand.content
            }]
        }));

        setNewCommand({ title: '', content: '', stage: '' });
        setShowAddCommandModal(false);
    };

    const handleDeleteCommand = (stageKey, id) => {
        if (confirm(t('common.delete_confirm') || "Are you sure?")) {
            setCommands(prev => ({
                ...prev,
                [stageKey]: prev[stageKey].filter(cmd => cmd.id !== id)
            }));
        }
    };

    const handleAddStage = () => {
        if (!newStage.label.trim()) return;
        const key = `custom_${Date.now()}`;
        const newStageObj = {
            key,
            label: newStage.label,
            icon: 'Layers',
            color: newStage.color,
            isCustom: true
        };

        setStages(prev => [...prev, newStageObj]);
        setCommands(prev => ({ ...prev, [key]: [] }));
        setNewStage({ key: '', label: '', icon: 'Layers', color: '#6366f1' });
        setShowAddStageModal(false);
    };

    const handleDeleteStage = (stageKey) => {
        if (confirm(t('common.delete_stage_confirm') || "Delete this category and all its commands?")) {
            setStages(prev => prev.filter(s => s.key !== stageKey));
            setCommands(prev => {
                const newCmds = { ...prev };
                delete newCmds[stageKey];
                return newCmds;
            });
        }
    };

    // --- Render ---

    return (
        <div className="command-tower-container">
            <header className="ct-header">
                <div className="ct-title-group">
                    <h1>{t('nav.command_tower')}</h1>
                    <p className="ct-subtitle">{t('dashboard.command_tower_desc')}</p>
                </div>
                <div style={{ width: '300px' }}>
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('common.search_placeholder')}
                        onClear={() => setSearchQuery('')}
                    />
                </div>
            </header>

            <div className="ct-stage-grid">
                {stages.map((stage) => {
                    const stageCommands = commands[stage.key] || [];
                    const filteredCommands = stageCommands.filter(cmd =>
                        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cmd.content.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (searchQuery && filteredCommands.length === 0) return null;

                    return (
                        <div key={stage.key} className="ct-stage-card" style={{ '--stage-color': stage.color }}>
                            <div className="ct-stage-header">
                                <div className="ct-stage-info">
                                    <div className="ct-stage-icon">
                                        {getIcon(stage.icon, stage.color)}
                                    </div>
                                    <span className="ct-stage-title">
                                        {stage.isCustom ? stage.label : t(stage.label)}
                                    </span>
                                    <span className="ct-stage-count">{filteredCommands.length}</span>
                                </div>
                                <div className="ct-stage-actions">
                                    {stage.isCustom && (
                                        <button
                                            className="ct-stage-action-btn"
                                            onClick={() => handleDeleteStage(stage.key)}
                                            title={t('common.delete')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <button
                                        className="ct-stage-action-btn"
                                        onClick={() => {
                                            setNewCommand(prev => ({ ...prev, stage: stage.key }));
                                            setShowAddCommandModal(true);
                                        }}
                                        title={t('common.add')}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="ct-command-list">
                                {filteredCommands.length > 0 ? (
                                    filteredCommands.map(cmd => (
                                        <div
                                            key={cmd.id}
                                            className="ct-command-item"
                                            onClick={() => copyToClipboard(cmd.content, cmd.id)}
                                        >
                                            <div className="ct-command-header" style={{ marginBottom: 0 }}>
                                                <span className="ct-command-title">{cmd.title}</span>
                                                {copiedId === cmd.id ? (
                                                    <Check size={14} color="#4ade80" />
                                                ) : (
                                                    <Copy size={14} color="#64748b" />
                                                )}
                                            </div>
                                            {/* Content hidden as requested
                                            <div className="ct-command-code">
                                                {cmd.content}
                                            </div>
                                            */}
                                            <button
                                                className="command-delete-btn-new"
                                                style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0 }} // Hidden by default, shown on hover via CSS
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCommand(stage.key, cmd.id);
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="ct-empty-stage">
                                        {searchQuery ? t('common.no_results') : t('common.empty_stage_hint') || "No commands yet"}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add Category Column */}
                <button
                    className="ct-stage-card"
                    style={{
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        opacity: 0.7,
                        width: '100%',
                        minHeight: '100px',
                        background: 'transparent'
                    }}
                    onClick={() => setShowAddStageModal(true)}
                >
                    <Plus size={32} color="#64748b" />
                    <span style={{
                        marginTop: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.9rem'
                    }}>
                        {t('common.add_category') || "Add Category"}
                    </span>
                </button>
            </div>

            {/* Floating Action Button (Alternative Add) */}
            <button className="ct-fab" onClick={() => {
                setNewCommand({ title: '', content: '', stage: stages[0]?.key || '' });
                setShowAddCommandModal(true);
            }}>
                <Plus size={24} />
            </button>


            {/* Add Command Modal */}
            {showAddCommandModal && (
                <div className="modal-overlay" onClick={() => setShowAddCommandModal(false)}>
                    <div className="ct-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0' }}>
                        <div className="modal-header">
                            <h3>{t('command_tower.add_command')}</h3>
                            <button className="modal-close" onClick={() => setShowAddCommandModal(false)}>
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
                                    autoFocus
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
                                    {stages.map(s => (
                                        <option key={s.key} value={s.key}>{s.isCustom ? s.label : t(s.label)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn" onClick={() => setShowAddCommandModal(false)}>{t('common.cancel')}</button>
                            <button className="btn btn-primary" onClick={handleAddCommand}>{t('common.add')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stage Modal */}
            {showAddStageModal && (
                <div className="modal-overlay" onClick={() => setShowAddStageModal(false)}>
                    <div className="ct-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '0' }}>
                        <div className="modal-header">
                            <h3>{t('common.add_category') || "Add Category"}</h3>
                            <button className="modal-close" onClick={() => setShowAddStageModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t('common.name') || "Name"}</label>
                                <input
                                    type="text"
                                    value={newStage.label}
                                    onChange={e => setNewStage({ ...newStage, label: e.target.value })}
                                    placeholder="Category Name"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('common.color') || "Color"}</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                                        <div
                                            key={c}
                                            onClick={() => setNewStage({ ...newStage, color: c })}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: c,
                                                cursor: 'pointer',
                                                border: newStage.color === c ? '2px solid white' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn" onClick={() => setShowAddStageModal(false)}>{t('common.cancel')}</button>
                            <button className="btn btn-primary" onClick={handleAddStage}>{t('common.add')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
