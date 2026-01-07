import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Check, Layers } from 'lucide-react';
import Modal from './Modal';
import { useCommandTower } from '@/modules/command-tower/hooks/useCommandTower';
import SearchInput from '@/components/SearchInput';
import './CommandSelectorModal.css';

export default function CommandSelectorModal({ isOpen, onClose, onSelect }) {
    const { t } = useTranslation();
    const { stages, commands } = useCommandTower();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCmd, setSelectedCmd] = useState(null);

    const handleSelect = () => {
        if (selectedCmd) {
            onSelect(selectedCmd);
            onClose();
            setSelectedCmd(null);
        }
    };

    // Filter commands
    const filteredStages = stages.map(stage => {
        const stageCmds = commands[stage.key] || [];
        const filtered = stageCmds.filter(cmd =>
            cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cmd.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...stage, commands: filtered };
    }).filter(stage => stage.commands.length > 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('common.select_command') || "Select Command"}
            width="600px"
            footer={
                <>
                    <button className="project-action-btn project-action-cancel" onClick={onClose}>
                        {t('common.cancel')}
                    </button>
                    <button
                        className="project-action-btn project-action-save"
                        disabled={!selectedCmd}
                        onClick={handleSelect}
                    >
                        <Check size={14} />
                        {t('common.confirm') || "Pin Command"}
                    </button>
                </>
            }
        >
            <div className="command-selector-container">
                <div style={{ marginBottom: '1rem' }}>
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('common.search_commands') || "Search commands..."}
                        onClear={() => setSearchQuery('')}
                    />
                </div>

                <div className="command-selector-list">
                    {filteredStages.length === 0 ? (
                        <div className="empty-state">
                            <Layers size={48} color="var(--text-tertiary)" />
                            <p>{t('common.no_commands_found') || "No commands found"}</p>
                        </div>
                    ) : (
                        filteredStages.map(stage => (
                            <div key={stage.key} className="command-selector-stage">
                                <h4 className="stage-header" style={{ color: stage.defaultCmdColor?.includes('gradient') ? '#888' : stage.defaultCmdColor }}>
                                    {t(stage.label) || stage.customLabel || stage.label}
                                </h4>
                                <div className="stage-commands-grid">
                                    {stage.commands.map(cmd => (
                                        <div
                                            key={cmd.id}
                                            className={`command-selector-item ${selectedCmd?.id === cmd.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedCmd(cmd)}
                                            style={{
                                                borderColor: selectedCmd?.id === cmd.id ? 'var(--color-primary)' : 'transparent',
                                                borderLeft: `4px solid ${cmd.color || stage.defaultCmdColor}`
                                            }}
                                        >
                                            <div className="cmd-title">{cmd.title}</div>
                                            <div className="cmd-content">{cmd.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
}
