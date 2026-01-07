import React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Edit2, Trash2 } from 'lucide-react';

export default function CommandItem({ command, onCopy, onEdit, onDelete, isCopied }) {
    const { t } = useTranslation();

    return (
        <div
            className="ct-command-item"
            style={{
                '--cmd-color': command.color,
                backgroundColor: '#ffffff'
            }}
        >
            <div
                className="ct-command-main"
                onClick={() => onCopy(command.content, command.id)}
                title={t('common.click_to_copy')}
            >
                <span className="ct-command-title">{command.title}</span>
                <span className="ct-copy-indicator">
                    {isCopied ? (
                        <Check size={14} color="#4ade80" />
                    ) : (
                        <Copy size={14} color="#64748b" />
                    )}
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
