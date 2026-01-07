import React from 'react';
import { Copy, Check, Edit2, Trash2 } from 'lucide-react';

export default function CommandItem({
    command,
    onCopy,
    isCopied,
    onEdit,
    onDelete,
    showActions = true
}) {
    return (
        <div className="command-item-card" style={{ borderLeft: `4px solid ${command.color || 'var(--color-primary)'}` }}>
            <div className="cmd-card-header">
                <span className="cmd-title">{command.title}</span>
                <div className="cmd-actions">
                    {showActions && (
                        <>
                            <button className="btn-icon-sm" onClick={() => onEdit(command)}>
                                <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-danger" onClick={() => onDelete(command.id)}>
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div
                className="cmd-code-block"
                onClick={() => onCopy(command.content, command.id)}
                title="Click to copy"
            >
                <code>{command.content}</code>
                <div className="copy-indicator">
                    {isCopied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </div>
            </div>

            {/* Tags if any */}
            {command.tags && command.tags.length > 0 && (
                <div className="cmd-tags">
                    {command.tags.map(tag => (
                        <span key={tag} className="cmd-tag">{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
