import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import SearchInput from '@/components/SearchInput';
import { Logger } from '@/utils/logger';
import './CommandTowerPage.css';

import { useCommandTower, freshColors } from './hooks/useCommandTower';
import CommandStageColumn from './components/CommandStageColumn';
import CommandModal from './components/CommandModal';
import StageModal from './components/StageModal';

export default function CommandTowerPage() {
    const { t } = useTranslation();

    // --- Hook ---
    const {
        stages,
        commands,
        defaultStages,
        actions
    } = useCommandTower();

    // --- UI State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [commandModal, setCommandModal] = useState({ isOpen: false, data: null }); // data: null (add) or object (edit/add with preset)
    const [stageModal, setStageModal] = useState({ isOpen: false });

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
    const openAddCommand = (stageKey) => {
        setCommandModal({
            isOpen: true,
            data: {
                title: '',
                content: '',
                stage: stageKey,
                color: actions.getStageDefaultColor(stageKey)
            }
        });
    };

    const openEditCommand = (command) => {
        // Find which stage this command belongs to? 
        // The command object itself might not have stageKey if stored in array by stage.
        // But `CommandItem` is rendered within `CommandStageColumn` which knows the stage.
        // My hook structure: `commands` is `{ stageKey: [cmds] }`.
        // The command object inside often doesn't have `stage` property unless we added it on save.
        // `handleAddCommand` in original code: `setCommands... [newCommand.stage]: ...`
        // It pushed `{ id, title, content, color }`. No `stage` key in the object.
        // So I need to pass the stage key or ensure `CommandModal` knows it.
        // Let's pass it when opening.
        // Wait, `CommandItem` triggers `onEdit`. But `CommandItem` doesn't know its stage unless passed.
        // `CommandStageColumn` passes `cmd` to `CommandItem`.
        // I can wrap the `onEdit` in `CommandStageColumn` to include stage key.
        // `onEditCommand={(cmd) => onEditCommand(stage.key, cmd)}`
        // Yes, let's do that in the render loop below.
        // Actually, the `CommandStageColumn` I wrote calls `onEdit(command)`.
        // So `onEditCommand` prop of Column should be `(cmd) => openEditCommand(stage.key, cmd)`.

        // Let's adjust `openEditCommand` signature.
    };

    // Adjusted handler
    const handleEditClick = (stageKey, command) => {
        setCommandModal({
            isOpen: true,
            data: { ...command, stage: stageKey }
            // We inject stage so Modal selects it. 
            // Note: `CommandModal` uses `formData.stage`. 
            // Hook's `updateCommand` needs `stageKey` anyway.
        });
    };

    const handleSaveCommand = (formData) => {
        if (formData.id) {
            // Edit
            actions.updateCommand(formData.stage, formData);
        } else {
            // Add
            actions.addCommand(formData);
        }
        setCommandModal({ isOpen: false, data: null });
    };

    const handleSaveStage = (stageData) => {
        actions.addStage(stageData);
        setStageModal({ isOpen: false });
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
                        <CommandStageColumn
                            key={stage.key}
                            stage={stage}
                            commands={filteredCommands}
                            copiedId={copiedId}
                            onRename={actions.renameStage}
                            onDeleteStage={actions.deleteStage}
                            onAddCommand={openAddCommand}
                            onEditCommand={(cmd) => handleEditClick(stage.key, cmd)}
                            onDeleteCommand={actions.deleteCommand}
                            onCopyCommand={copyToClipboard}
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
                    onClick={() => setStageModal({ isOpen: true })}
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

            {/* Floating Action Button */}
            <button className="ct-fab" onClick={() => {
                const firstStageKey = stages[0]?.key || '';
                openAddCommand(firstStageKey);
            }}>
                <Plus size={24} />
            </button>

            {/* Modals */}
            <CommandModal
                isOpen={commandModal.isOpen}
                onClose={() => setCommandModal({ isOpen: false, data: null })}
                onSave={handleSaveCommand}
                initialData={commandModal.data}
                stages={stages}
                freshColors={freshColors}
            />

            <StageModal
                isOpen={stageModal.isOpen}
                onClose={() => setStageModal({ isOpen: false })}
                onSave={handleSaveStage}
                defaultStages={defaultStages}
            />
        </div>
    );
}
