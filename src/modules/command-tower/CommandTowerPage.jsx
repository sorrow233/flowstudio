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
    const [showAddStageModal, setShowAddStageModal] = useState(false);
    const [editingStage, setEditingStage] = useState(null); // { key, label }
    const [searchQuery, setSearchQuery] = useState('');

    // --- State Management ---
    const {
        stages,
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

    const [newStage, setNewStage] = useState({ key: '', label: '', icon: 'Layers', color: defaultStageColors[0] });

    // --- Handlers ---

    const handleAddStage = () => {
        if (!newStage.label?.trim()) return;
        const key = `custom_${generateId()}`; // Use nanoid for unique key

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
        if (confirm(t('common.delete_stage_confirm') || "Delete this category?")) {
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
                    return (
                        <CommandStageColumn
                            key={stage.key}
                            stage={stage}
                            searchQuery={searchQuery}
                            // Edit Stage Props
                            isEditing={editingStage?.key === stage.key}
                            editLabel={editingStage?.key === stage.key ? editingStage.label : ''}
                            setEditLabel={(val) => setEditingStage({ ...editingStage, label: val })}
                            onStartEditing={(key, label) => setEditingStage({ key, label })}
                            onRename={handleStageRename}
                            onCancelEdit={() => setEditingStage(null)}
                            onDeleteStage={handleDeleteStage}
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
        </div>
    );
}
