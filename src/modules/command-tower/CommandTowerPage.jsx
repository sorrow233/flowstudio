import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import Modal from '@/components/Modal';
import { Logger } from '@/utils/logger';
import CommandStageColumn from './components/CommandStageColumn';
import './CommandTowerPage.css';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState(null);
    const [showAddCommandModal, setShowAddCommandModal] = useState(false);
    const [showAddStageModal, setShowAddStageModal] = useState(false);
    const [editingCommand, setEditingCommand] = useState(null); // { stageKey, command }
    const [editingStage, setEditingStage] = useState(null); // { key, label }

    // --- State Management ---

    // Stages: Custom + Default - 每个指令库有独特的清新颜色
    const defaultStages = [
        { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', defaultCmdColor: '#d4fc79' },  // 初春绿
        { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', defaultCmdColor: '#f093fb' },           // 霓虹粉
        { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', defaultCmdColor: '#84fab0' },                // 薄荷海
        { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', defaultCmdColor: '#fccb90' },          // 晚霞紫
        { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', defaultCmdColor: '#e0c3fc' },           // 梦幻紫
        { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', defaultCmdColor: '#a8edea' }   // 马卡龙
    ];

    const [stages, setStages] = useState(() => {
        const saved = localStorage.getItem('commandTowerStages');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migrate old solid colors to new gradients if needed (simple check)
            if (parsed.length > 0 && !parsed[0].color.includes('gradient')) {
                return defaultStages.map(ds => {
                    const existing = parsed.find(p => p.key === ds.key);
                    return existing ? { ...existing, color: ds.color } : ds;
                }).concat(parsed.filter(p => !defaultStages.find(ds => ds.key === p.key)));
            }
            return parsed;
        }
        return defaultStages;
    });

    // Commands
    const [commands, setCommands] = useState(() => {
        const saved = localStorage.getItem('commandTowerData');
        return saved ? JSON.parse(saved) : getDefaultCommands();
    });

    // 清新颜色选择 (8个清新明亮的颜色)
    const freshColors = [
        { color: '#3ECFB2', name: '薄荷绿' },   // Mint Green
        { color: '#FFB5C5', name: '樱花粉' },   // Sakura Pink
        { color: '#87CEEB', name: '天空蓝' },   // Sky Blue
        { color: '#FFEAA7', name: '柠檬黄' },   // Lemon Yellow
        { color: '#C3AED6', name: '薰衣草紫' }, // Lavender Purple
        { color: '#FFCCBC', name: '蜜桃橙' },   // Peach Orange
        { color: '#B2DFDB', name: '青瓷绿' },   // Celadon Green
        { color: '#F8BBD9', name: '玫瑰粉' },   // Rose Pink
    ];

    // 获取指令库的默认颜色
    const getStageDefaultColor = (stageKey) => {
        const stage = stages.find(s => s.key === stageKey);
        // 如果是渐变色，取一个主色调用于command
        if (stage?.defaultCmdColor) return stage.defaultCmdColor;
        return freshColors[0].color;
    };

    const [newCommand, setNewCommand] = useState({ title: '', content: '', stage: '', color: '' });
    const [newStage, setNewStage] = useState({ key: '', label: '', icon: 'Layers', color: defaultStages[0].color });
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
    const copyToClipboard = async (text, id) => {
        Logger.info('CommandTower', 'Copying to clipboard:', id);
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            Logger.info('CommandTower', 'Copy success');
        } catch (err) {
            Logger.error('CommandTower', 'Copy failed, using fallback', err);
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
        Logger.info('CommandTower', 'Adding new command:', newCommand);
        // Fix: Use correct ID generation to avoid conflicts in concurrent usage (though mostly single user here)
        // Original was Date.now()
        const newId = Date.now();
        // 使用用户选择的颜色，如果没选则使用指令库默认颜色
        const commandColor = newCommand.color || getStageDefaultColor(newCommand.stage);

        setCommands(prev => ({
            ...prev,
            [newCommand.stage]: [...(prev[newCommand.stage] || []), {
                id: newId,
                title: newCommand.title,
                content: newCommand.content,
                color: commandColor
            }]
        }));

        setNewCommand({ title: '', content: '', stage: '', color: freshColors[0].color });
        setShowAddCommandModal(false);
    };

    const handleDeleteCommand = (stageKey, id) => {
        if (confirm(t('common.delete_confirm') || "Are you sure?")) {
            Logger.info('CommandTower', 'Deleting command:', stageKey, id);
            setCommands(prev => ({
                ...prev,
                [stageKey]: prev[stageKey].filter(cmd => cmd.id !== id)
            }));
        }
    };

    const handleEditCommand = (stageKey, command) => {
        setEditingCommand({ stageKey, command: { ...command } });
    };

    const handleSaveEdit = () => {
        if (!editingCommand || !editingCommand.command.title.trim()) return;
        setCommands(prev => ({
            ...prev,
            [editingCommand.stageKey]: prev[editingCommand.stageKey].map(cmd =>
                cmd.id === editingCommand.command.id ? editingCommand.command : cmd
            )
        }));
        setEditingCommand(null);
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
        setNewStage({ key: '', label: '', icon: 'Layers', color: defaultStages[0].color });
        setShowAddStageModal(false);
        Logger.info('CommandTower', 'Added new stage:', newStageObj);
    };

    const handleDeleteStage = (stageKey) => {
        if (confirm(t('common.delete_stage_confirm') || "Delete this category and all its commands?")) {
            Logger.info('CommandTower', 'Deleting stage:', stageKey);
            setStages(prev => prev.filter(s => s.key !== stageKey));
            setCommands(prev => {
                const newCmds = { ...prev };
                delete newCmds[stageKey];
                return newCmds;
            });
        }
    };

    const handleStageRename = (stageKey, newLabel) => {
        if (!newLabel.trim()) return;
        setStages(prev => prev.map(s =>
            s.key === stageKey
                ? { ...s, customLabel: newLabel } // Store custom name in customLabel
                : s
        ));
        setEditingStage(null);
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

                    return (
                        <CommandStageColumn
                            key={stage.key}
                            stage={stage}
                            commands={filteredCommands}
                            searchQuery={searchQuery}
                            defaultCmdColor={getStageDefaultColor(stage.key)}
                            // Edit Stage Props
                            isEditing={editingStage?.key === stage.key}
                            editLabel={editingStage?.key === stage.key ? editingStage.label : ''}
                            setEditLabel={(val) => setEditingStage({ ...editingStage, label: val })}
                            onStartEditing={(key, label) => setEditingStage({ key, label })}
                            onRename={handleStageRename}
                            onCancelEdit={() => setEditingStage(null)}
                            onDeleteStage={handleDeleteStage}
                            // Command Props
                            onAddCommand={(stageKey) => {
                                setNewCommand({ title: '', content: '', stage: stageKey, color: getStageDefaultColor(stageKey) });
                                setShowAddCommandModal(true);
                            }}
                            onCopy={copyToClipboard}
                            onEditCommand={handleEditCommand}
                            onDeleteCommand={handleDeleteCommand}
                            copiedId={copiedId}
                        />
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
                        background: 'transparent',
                        borderColor: 'var(--border-subtle)'
                    }}
                    onClick={() => setShowAddStageModal(true)}
                >
                    <Plus size={32} color="#64748b" />
                    <span style={{
                        marginTop: '1rem',
                        color: '#94a3b8',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: '0.9rem'
                    }}>
                        {t('common.add_category') || "Add Category"}
                    </span>
                </button>
            </div>

            {/* Floating Action Button (Alternative Add) */}
            <button className="ct-fab" onClick={() => {
                const firstStageKey = stages[0]?.key || '';
                setNewCommand({ title: '', content: '', stage: firstStageKey, color: getStageDefaultColor(firstStageKey) });
                setShowAddCommandModal(true);
            }}>
                <Plus size={24} />
            </button>


            {/* Add Command Modal */}
            <Modal
                isOpen={showAddCommandModal}
                onClose={() => setShowAddCommandModal(false)}
                title={t('command_tower.add_command')}
                footer={
                    <>
                        <button className="btn" onClick={() => setShowAddCommandModal(false)}>{t('common.cancel')}</button>
                        <button className="btn btn-primary" onClick={handleAddCommand}>{t('common.add')}</button>
                    </>
                }
            >
                <div className="form-group">
                    <label>{t('command_tower.title')}</label>
                    <input
                        type="text"
                        value={newCommand.title}
                        onChange={e => setNewCommand({ ...newCommand, title: e.target.value })}
                        placeholder={t('command_tower.title_placeholder')}
                        autoFocus
                        className="project-input"
                    />
                </div>
                <div className="form-group">
                    <label>{t('command_tower.command')}</label>
                    <textarea
                        value={newCommand.content}
                        onChange={e => setNewCommand({ ...newCommand, content: e.target.value })}
                        placeholder={t('command_tower.command_placeholder')}
                        rows={3}
                        className="project-input"
                    />
                </div>
                <div className="form-group">
                    <label>{t('command_tower.stage')}</label>
                    <select
                        value={newCommand.stage}
                        onChange={e => setNewCommand({ ...newCommand, stage: e.target.value })}
                        className="project-input"
                    >
                        {stages.map(s => (
                            <option key={s.key} value={s.key}>{s.customLabel || (s.isCustom ? s.label : t(s.label))}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{t('common.color') || "颜色"}</label>
                    <div className="ct-color-picker">
                        {freshColors.map(c => (
                            <div
                                key={c.color}
                                className={`ct-color-option ${newCommand.color === c.color ? 'selected' : ''}`}
                                onClick={() => setNewCommand({ ...newCommand, color: c.color })}
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Add Stage Modal */}
            <Modal
                isOpen={showAddStageModal}
                onClose={() => setShowAddStageModal(false)}
                title={t('common.add_category') || "Add Category"}
                footer={
                    <>
                        <button className="btn" onClick={() => setShowAddStageModal(false)}>{t('common.cancel')}</button>
                        <button className="btn btn-primary" onClick={handleAddStage}>{t('common.add')}</button>
                    </>
                }
            >
                <div className="form-group">
                    <label>{t('common.name') || "Name"}</label>
                    <input
                        type="text"
                        value={newStage.label}
                        onChange={e => setNewStage({ ...newStage, label: e.target.value })}
                        placeholder="Category Name"
                        autoFocus
                        className="project-input"
                    />
                </div>
                <div className="form-group">
                    <label>{t('common.color') || "Color"}</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {defaultStages.map(ds => (
                            <div
                                key={ds.key}
                                onClick={() => setNewStage({ ...newStage, color: ds.color })}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: ds.color,
                                    cursor: 'pointer',
                                    border: newStage.color === ds.color ? '2px solid var(--text-primary)' : '2px solid transparent',
                                    boxShadow: newStage.color === ds.color ? '0 0 0 2px var(--bg-card)' : 'none'
                                }}
                                title={ds.key}
                            />
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Edit Command Modal */}
            <Modal
                isOpen={!!editingCommand}
                onClose={() => setEditingCommand(null)}
                title={t('common.edit')}
                footer={
                    <>
                        <button className="btn" onClick={() => setEditingCommand(null)}>{t('common.cancel')}</button>
                        <button className="btn btn-primary" onClick={handleSaveEdit}>{t('common.save')}</button>
                    </>
                }
            >
                {editingCommand && (
                    <>
                        <div className="form-group">
                            <label>{t('command_tower.title')}</label>
                            <input
                                type="text"
                                value={editingCommand.command.title}
                                onChange={e => setEditingCommand({
                                    ...editingCommand,
                                    command: { ...editingCommand.command, title: e.target.value }
                                })}
                                placeholder={t('command_tower.title_placeholder')}
                                autoFocus
                                className="project-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('command_tower.command')}</label>
                            <textarea
                                value={editingCommand.command.content}
                                onChange={e => setEditingCommand({
                                    ...editingCommand,
                                    command: { ...editingCommand.command, content: e.target.value }
                                })}
                                placeholder={t('command_tower.command_placeholder')}
                                rows={3}
                                className="project-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('common.color') || "颜色"}</label>
                            <div className="ct-color-picker">
                                {freshColors.map(c => (
                                    <div
                                        key={c.color}
                                        className={`ct-color-option ${editingCommand.command.color === c.color ? 'selected' : ''}`}
                                        onClick={() => setEditingCommand({
                                            ...editingCommand,
                                            command: { ...editingCommand.command, color: c.color }
                                        })}
                                        style={{ backgroundColor: c.color }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
