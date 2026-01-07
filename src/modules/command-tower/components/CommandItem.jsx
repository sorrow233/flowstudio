import React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Edit2, Trash2, Circle, CheckCircle2 } from 'lucide-react';

return (
    <div
        className={`ct-command-item ${isSelected ? 'is-selected' : ''}`}
        style={{
            '--cmd-color': command.color,
            backgroundColor: isSelected ? 'var(--bg-active)' : '#ffffff',
            border: isSelected ? `2px solid ${command.color}` : '1px solid transparent'
        }}
        onClick={() => onToggleSelect(command)}
    >
        <div className="ct-command-main">
            {/* Selection Indicator */}
            <div className="ct-select-indicator" style={{ marginRight: '8px', cursor: 'pointer' }}>
                {isSelected ? (
                    <CheckCircle2 size={18} color={command.color} fill="currentColor" className="text-white" />
                ) : (
                    <Circle size={18} color="#cbd5e1" />
                )}
            </div>
            <div className="ct-command-content-wrapper">
                <span className="ct-command-title">{command.title}</span>
                {command.tags && command.tags.length > 0 && (
                    <div className="ct-command-tags">
                        {command.tags.map(tag => (
                            <span key={tag} className="ct-tag-pill">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
            <span
                className="ct-copy-indicator"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent selection toggle when copying
                    onCopy(command.content, command.id);
                }}
                title={t('common.click_to_copy')}
            >
                {isCopied ? <Check size={14} color="#4ade80" /> : <Copy size={14} color="#64748b" />}
            </span>
        </div>
        <div className="ct-command-actions">
            <button
                className="ct-action-btn ct-edit-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(command);
                }}
                title={t('common.edit')}
            >
                <Edit2 size={12} />
            </button>
            <button
                className="ct-action-btn ct-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(command.id);
                }}
                title={t('common.delete')}
            >
                <Trash2 size={12} />
            </button>
        </div>
    </div>
);
}
