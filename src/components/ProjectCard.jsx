import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Trash2, ExternalLink, Target, Calendar, Edit3, Check, X, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import './ProjectCard.css';

export default function ProjectCard({
    item,
    onUpdate,
    onDelete,
    onMoveNext,
    onArchive,
    isArchived = false,
    accentColor,
    showMoveButton = true,
    variant = 'default'
}) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editData, setEditData] = useState({
        name: item.name || '',
        link: item.link || '',
        goal: item.goal || ''
    });

    const handleSave = () => {
        onUpdate(item.id, editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            name: item.name || '',
            link: item.link || '',
            goal: item.goal || ''
        });
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        if (isArchived) {
            // High risk action - confirm
            setShowDeleteConfirm(true);
        } else {
            // Check if we mean "Archive" (Soft Delete) or actual Delete.
            // If the UI shows Trash Icon for non-archived items, it usually means "Delete".
            // If the user hasn't archived it first, maybe we should ask?
            // "Are you sure you want to delete this active project?"
            setShowDeleteConfirm(true);
        }
    };

    const confirmDelete = () => {
        onDelete(item.id);
        setShowDeleteConfirm(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (isEditing) {
        return (
            <div className={`project-card project-card-editing variant-${variant}`} style={{ '--accent-color': accentColor }}>
                <div className="project-card-form">
                    {/* ... form content ... */}
                    <div className="project-form-row">
                        <input
                            type="text"
                            className="project-input project-input-name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder={t('common.project_name')}
                            autoFocus
                        />
                    </div>
                    <div className="project-form-row">
                        <ExternalLink size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input"
                            value={editData.link}
                            onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                            placeholder={t('common.project_link')}
                        />
                    </div>
                    <div className="project-form-row">
                        <Target size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input"
                            value={editData.goal}
                            onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
                            placeholder={t('common.project_goal')}
                        />
                    </div>
                    <div className="project-form-actions">
                        <button className="project-action-btn project-action-save" onClick={handleSave}>
                            <Check size={14} />
                            <span>{t('common.save')}</span>
                        </button>
                        <button className="project-action-btn project-action-cancel" onClick={handleCancel}>
                            <X size={14} />
                            <span>{t('common.cancel')}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic styles based on variant
    const cardStyle = {
        '--accent-color': accentColor,
        backgroundColor: variant === 'workshop' ? 'var(--bg-card)' : item.color
    };

    return (
        <div
            className={`project-card variant-${variant}`}
            style={cardStyle}
        >
            <div className="project-card-header">
                <h3 className="project-card-name">
                    {item.name || t('common.untitled')}
                </h3>
                <div className="project-card-actions">
                    <button
                        className="project-icon-btn"
                        onClick={() => setIsEditing(true)}
                        title={t('common.edit')}
                    >
                        <Edit3 size={14} />
                    </button>
                    {showMoveButton && !isArchived && (
                        <button
                            className="project-icon-btn project-icon-btn-primary"
                            onClick={() => onMoveNext(item)}
                            title={t('common.next_stage')}
                        >
                            <ArrowRight size={14} />
                        </button>
                    )}

                    {/* Archive / Restore Logic */}
                    {onArchive && !isArchived ? (
                        <button
                            className="project-icon-btn"
                            onClick={() => onArchive(item.id)}
                            title={t('common.archive')}
                        >
                            <Archive size={14} />
                        </button>
                    ) : null}

                    {onArchive && isArchived ? (
                        <button
                            className="project-icon-btn"
                            onClick={() => onArchive(item.id)} // Toggles back to active
                            title={t('common.restore')}
                        >
                            <RotateCcw size={14} />
                        </button>
                    ) : null}

                    {/* Delete is always available but maybe styled differently in archive */}
                    <button
                        className="project-icon-btn project-icon-btn-danger"
                        onClick={handleDeleteClick}
                        title={isArchived ? t('common.delete_forever') : t('common.delete')}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('common.confirm_delete') || "Confirm Deletion"}
                footer={
                    <>
                        <button className="project-action-btn project-action-cancel" onClick={() => setShowDeleteConfirm(false)}>
                            {t('common.cancel')}
                        </button>
                        <button className="project-action-btn project-action-delete" style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none' }} onClick={confirmDelete}>
                            <Trash2 size={14} /> {t('common.delete')}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center', padding: '10px' }}>
                    <AlertTriangle size={48} color="#ff4d4f" />
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                        {t('common.delete_warning') || "Are you sure you want to delete this project?"}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {item.name}
                    </p>
                    {isArchived && (
                        <p style={{ color: '#ff4d4f', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {t('common.delete_permanent_warning') || "This action cannot be undone."}
                        </p>
                    )}
                </div>
            </Modal>

            <div className="project-card-body">
                {item.link && (
                    <div className="project-card-info">
                        <ExternalLink size={12} />
                        <a
                            href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {item.link}
                        </a>
                    </div>
                )}
                {item.goal && (
                    <div className="project-card-info">
                        <Target size={12} />
                        <span className="project-goal">{item.goal}</span>
                    </div>
                )}
            </div>

            {item.createdAt && (
                <div className="project-card-footer">
                    <Calendar size={11} />
                    <span>{formatDate(item.createdAt)}</span>
                </div>
            )}
        </div>
    );
}
