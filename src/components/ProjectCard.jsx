import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Trash2, ExternalLink, Target, Calendar, Edit3, Check, X, Archive, RotateCcw, AlertTriangle, Image, Palette } from 'lucide-react';
import Modal from './Modal';
import './ProjectCard.css';

// 现代清新的默认渐变色背景
const DEFAULT_BACKGROUNDS = [
    { id: 'gradient-1', type: 'gradient', value: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', name: '清新薄荷' },
    { id: 'gradient-2', type: 'gradient', value: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', name: '天空蓝' },
    { id: 'gradient-3', type: 'gradient', value: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', name: '暖阳橙' },
    { id: 'gradient-4', type: 'gradient', value: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)', name: '樱花粉' },
    { id: 'gradient-5', type: 'gradient', value: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)', name: '薰衣草' },
    { id: 'gradient-6', type: 'gradient', value: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)', name: '青碧' },
    { id: 'gradient-7', type: 'gradient', value: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)', name: '柠檬黄' },
    { id: 'gradient-8', type: 'gradient', value: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)', name: '银灰' },
    { id: 'gradient-9', type: 'gradient', value: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)', name: '靛蓝' },
    { id: 'gradient-10', type: 'gradient', value: 'linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%)', name: '极简白' },
];

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
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
    const fileInputRef = useRef(null);
    const [editData, setEditData] = useState({
        name: item.name || '',
        link: item.link || '',
        goal: item.goal || '',
        backgroundImage: item.backgroundImage || '',
        backgroundType: item.backgroundType || 'gradient', // 'gradient' | 'image'
        backgroundValue: item.backgroundValue || DEFAULT_BACKGROUNDS[0].value
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

    // 处理背景选择
    const handleBackgroundSelect = (bg) => {
        const newData = {
            ...editData,
            backgroundType: bg.type,
            backgroundValue: bg.value,
            backgroundImage: bg.type === 'image' ? bg.value : ''
        };
        setEditData(newData);
        onUpdate(item.id, newData);
        setShowBackgroundPicker(false);
    };

    // 处理图片上传
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                const newData = {
                    ...editData,
                    backgroundType: 'image',
                    backgroundValue: imageUrl,
                    backgroundImage: imageUrl
                };
                setEditData(newData);
                onUpdate(item.id, newData);
                setShowBackgroundPicker(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // 移除背景
    const handleRemoveBackground = () => {
        const newData = {
            ...editData,
            backgroundType: 'gradient',
            backgroundValue: DEFAULT_BACKGROUNDS[0].value,
            backgroundImage: ''
        };
        setEditData(newData);
        onUpdate(item.id, newData);
        setShowBackgroundPicker(false);
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

    // 获取背景样式
    const getBackgroundStyle = () => {
        const bgType = item.backgroundType || 'gradient';
        const bgValue = item.backgroundValue || DEFAULT_BACKGROUNDS[0].value;

        if (bgType === 'image' && bgValue) {
            return {
                backgroundImage: `url(${bgValue})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        return {
            background: bgValue
        };
    };

    // Dynamic styles based on variant
    const cardStyle = {
        '--accent-color': accentColor,
        ...(variant === 'workshop' ? { backgroundColor: 'var(--bg-card)' } : getBackgroundStyle())
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
                        onClick={() => setShowBackgroundPicker(true)}
                        title={t('common.change_background') || '更换背景'}
                    >
                        <Image size={14} />
                    </button>
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

            {/* Background Picker Modal */}
            <Modal
                isOpen={showBackgroundPicker}
                onClose={() => setShowBackgroundPicker(false)}
                title={t('common.change_background') || "更换背景"}
            >
                <div className="background-picker">
                    <div className="background-picker-section">
                        <h4 className="background-picker-title">
                            <Palette size={14} />
                            {t('common.preset_colors') || '预设配色'}
                        </h4>
                        <div className="background-picker-grid">
                            {DEFAULT_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    className={`background-picker-item ${item.backgroundValue === bg.value ? 'active' : ''}`}
                                    style={{ background: bg.value }}
                                    onClick={() => handleBackgroundSelect(bg)}
                                    title={bg.name}
                                >
                                    {item.backgroundValue === bg.value && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="background-picker-section">
                        <h4 className="background-picker-title">
                            <Image size={14} />
                            {t('common.custom_image') || '自定义图片'}
                        </h4>
                        <div className="background-picker-actions">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="background-picker-upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image size={14} />
                                {t('common.upload_image') || '上传图片'}
                            </button>
                            {item.backgroundType === 'image' && (
                                <button
                                    className="background-picker-remove-btn"
                                    onClick={handleRemoveBackground}
                                >
                                    <X size={14} />
                                    {t('common.remove_image') || '移除图片'}
                                </button>
                            )}
                        </div>
                        {item.backgroundType === 'image' && item.backgroundValue && (
                            <div className="background-picker-preview">
                                <img src={item.backgroundValue} alt="背景预览" />
                            </div>
                        )}
                    </div>
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
