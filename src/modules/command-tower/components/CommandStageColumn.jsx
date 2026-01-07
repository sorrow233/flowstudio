import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus, Trash2, Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign, Layers
} from 'lucide-react';
import CommandItem from './CommandItem';

// Helper to render icons based on string name
const getIcon = (iconName) => {
    const props = { size: 20, style: { color: 'var(--text-primary)' } };
    const icons = { Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign, Layers };
    const IconComponent = icons[iconName] || Layers;
    return <IconComponent {...props} />;
};

export default function CommandStageColumn({
    stage,
    commands,
    onRename,
    onDeleteStage,
    onAddCommand,
    onEditCommand,
    onDeleteCommand,
    onCopyCommand,
    copiedId
}) {
    const { t } = useTranslation();
    const [isRenaming, setIsRenaming] = useState(false);
    const [editLabel, setEditLabel] = useState('');

    const displayLabel = stage.customLabel || (stage.isCustom ? stage.label : t(stage.label));

    const startRenaming = () => {
        setEditLabel(displayLabel);
        setIsRenaming(true);
    };

    const handleRenameSubmit = () => {
        onRename(stage.key, editLabel);
        setIsRenaming(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') setIsRenaming(false);
    };

    return (
        <div className="ct-stage-card">
            <div className="ct-stage-header">
                <div className="ct-stage-info">
                    <div className="ct-stage-icon">
                        {getIcon(stage.icon)}
                    </div>

                    {isRenaming ? (
                        <input
                            autoFocus
                            className="ct-stage-title-input"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <span
                            className="ct-stage-title"
                            onClick={startRenaming}
                            title="Click to rename"
                        >
                            {displayLabel}
                        </span>
                    )}

                    <span className="ct-stage-count">{commands.length}</span>
                </div>
                <div className="ct-stage-actions">
                    {stage.isCustom && (
                        <button
                            className="ct-stage-action-btn"
                            onClick={() => onDeleteStage(stage.key)}
                            title={t('common.delete')}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button
                        className="ct-stage-action-btn"
                        onClick={() => onAddCommand(stage.key)}
                        title={t('common.add')}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="ct-command-list">
                {commands.length > 0 ? (
                    commands.map(cmd => (
                        <CommandItem
                            key={cmd.id}
                            command={cmd}
                            onCopy={onCopyCommand}
                            onEdit={onEditCommand}
                            onDelete={(id) => onDeleteCommand(stage.key, id)}
                            isCopied={copiedId === cmd.id}
                        />
                    ))
                ) : (
                    <div className="ct-empty-stage">
                        {t('common.empty_stage_hint') || "No commands yet"}
                    </div>
                )}
            </div>
        </div>
    );
}
