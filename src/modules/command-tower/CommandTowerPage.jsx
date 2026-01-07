import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandTower } from '@/features/command-tower/hooks/useCommandTower';
import { Plus } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import Modal from '@/components/Modal';
import { Logger } from '@/utils/logger';
import CommandStageColumn from './components/CommandStageColumn';
import { generateId } from '@/features/command-tower/api/local';
import './CommandTowerPage.css';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState(null);
    const [showAddCommandModal, setShowAddCommandModal] = useState(false);
    const [showAddStageModal, setShowAddStageModal] = useState(false);
    const [editingCommand, setEditingCommand] = useState(null); // { stageKey, command }
    const [editingStage, setEditingStage] = useState(null); // { key, label }

    // --- State Management ---
    const {
        stages,
        commands,
        addCommand,
        updateCommand,
        deleteCommand,
        addStage,
        updateStage,
        deleteStage
    } = useCommandTower();

    // Default Stages no longer needed here as they are in API layer, 
    // but color references might be needed for UI logic if not in stage object.
    // However, the stages from hook should have everything.

    // Fallback/Default colors for UI picker usage
    const defaultStageColors = [
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];

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
    const [newStage, setNewStage] = useState({ key: '', label: '', icon: 'Layers', color: defaultStageColors[0] });
    const [searchQuery, setSearchQuery] = useState('');



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
        if (!newCommand.title?.trim() || !newCommand.content?.trim() || !newCommand.stage) return;
        Logger.info('CommandTower', 'Adding new command:', newCommand);

        // 使用用户选择的颜色，如果没选则使用指令库默认颜色
        const commandColor = newCommand.color || getStageDefaultColor(newCommand.stage);

        addCommand({
            stageKey: newCommand.stage,
            command: {
                title: newCommand.title,
                content: newCommand.content,
                color: commandColor
            }
        });

        setNewCommand({ title: '', content: '', stage: '', color: freshColors[0].color });
        setShowAddCommandModal(false);
    };

    const handleDeleteCommand = (stageKey, id) => {
        if (confirm(t('common.delete_confirm') || "Are you sure?")) {
            Logger.info('CommandTower', 'Deleting command:', stageKey, id);
            deleteCommand({ stageKey, commandId: id });
        }
    };

    const handleEditCommand = (stageKey, command) => {
        setEditingCommand({ stageKey, command: { ...command } });
    };

    const handleSaveEdit = () => {
        if (!editingCommand || !editingCommand.command.title?.trim()) return;
        updateCommand({
            stageKey: editingCommand.stageKey,
            command: editingCommand.command
        });
        setEditingCommand(null);
    };

    const handleAddStage = () => {
        if (!newStage.label?.trim()) return;
        const key = `custom_${generateId()}`; // Use nanoid for unique key
        // Let's stick to simple generation here or move to nanoid if strict. 
        // Since key is used for filtering, simple unique string is fine.

        const newStageObj = {
            key,
            label: newStage.label,
            icon: 'Layers',
            color: newStage.color,
            isCustom: true
        };

        addStage(newStageObj);

        setNewStage({ key: '', label: '', icon: 'Layers', color: defaultStageColors[0] });
        setShowAddStageModal(false);
        Logger.info('CommandTower', 'Added new stage:', newStageObj);
    };

    const handleDeleteStage = (stageKey) => {
        if (confirm(t('common.delete_stage_confirm') || "Delete this category and all its commands?")) {
            Logger.info('CommandTower', 'Deleting stage:', stageKey);
            deleteStage(stageKey);
        }
    };

    const handleStageRename = (stageKey, newLabel) => {
        if (!newLabel?.trim()) return;
        updateStage({
            key: stageKey,
            updates: { customLabel: newLabel }
        });
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
                        {defaultStageColors.map(color => (
                            <div
                                key={color}
                                onClick={() => setNewStage({ ...newStage, color: color })}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: color,
                                    cursor: 'pointer',
                                    border: newStage.color === color ? '2px solid var(--text-primary)' : '2px solid transparent',
                                    boxShadow: newStage.color === color ? '0 0 0 2px var(--bg-card)' : 'none'
                                }}
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
