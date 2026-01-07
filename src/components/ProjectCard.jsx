import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Trash2, ExternalLink, Target, Calendar, Edit3, Check, X, Archive, RotateCcw, AlertTriangle, Image, Palette, FastForward } from 'lucide-react';
import Modal from './Modal';
import './ProjectCard.css';

// 现代清新的默认渐变色背景
// 现代高级感渐变色背景 - Premium Aurora & Mesh Gradients
const DEFAULT_BACKGROUNDS = [
    { id: 'gradient-1', type: 'gradient', value: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', name: '云雾白' },
    { id: 'gradient-2', type: 'gradient', value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', name: '清透蓝' },
    { id: 'gradient-3', type: 'gradient', value: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)', name: '初春绿' },
    { id: 'gradient-4', type: 'gradient', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', name: '薄荷海' },
    { id: 'gradient-5', type: 'gradient', value: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', name: '晚霞紫' },
    { id: 'gradient-6', type: 'gradient', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', name: '梦幻紫' },
    { id: 'gradient-7', type: 'gradient', value: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', name: '霓虹粉' },
    { id: 'gradient-8', type: 'gradient', value: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)', name: '冰川蓝' },
    { id: 'gradient-9', type: 'gradient', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', name: '极简灰' },
    { id: 'gradient-10', type: 'gradient', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: '马卡龙' },
    { id: 'gradient-11', type: 'gradient', value: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)', name: '香槟金' },
    { id: 'gradient-12', type: 'gradient', value: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', name: '初恋粉' },
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
    const [showMoveConfirm, setShowMoveConfirm] = useState(false);
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
                            onClick={() => setShowMoveConfirm(true)}
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

            {/* Move to Next Stage Confirmation Modal */}
            <Modal
                isOpen={showMoveConfirm}
                onClose={() => setShowMoveConfirm(false)}
                title={t('common.confirm_move') || "确认推进"}
                footer={
                    <>
                        <button className="project-action-btn project-action-cancel" onClick={() => setShowMoveConfirm(false)}>
                            {t('common.cancel')}
                        </button>
                        <button
                            className="project-action-btn project-action-save"
                            onClick={() => {
                                onMoveNext(item);
                                setShowMoveConfirm(false);
                            }}
                        >
                            <FastForward size={14} /> {t('common.confirm') || '确认'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center', padding: '10px' }}>
                    <FastForward size={48} color="var(--color-accent-sora)" />
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                        {t('common.move_to_next_stage') || "确定要将此项目推进到下一阶段吗？"}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {item.name}
                    </p>
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
