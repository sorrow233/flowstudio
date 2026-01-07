import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';

export default function CommandModal({ isOpen, onClose, onSave, initialData, stages, freshColors }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ title: '', content: '', stage: '', color: '' });

    // Reset or populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit mode
                setFormData(initialData);
            } else {
                // Add mode reset is handled by parent passing initialData as null or empty object, 
                // but usually parents handle "default state" before opening.
                // However, we can just respect what's passed in initialData if provided, or default.
                // NOTE: The parent `CommandTowerPage` logic for "Add" sets `newCommand` state then opens modal.
                // So initialData handles both cases effectively.
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    const isEdit = !!initialData?.id;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? t('common.edit') : t('command_tower.add_command')}
            footer={
                <>
                    <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {isEdit ? t('common.save') : t('common.add')}
                    </button>
                </>
            }
        >
            <div className="form-group">
                <label>{t('command_tower.title')}</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder={t('command_tower.title_placeholder')}
                    autoFocus
                    className="project-input"
                />
            </div>
            <div className="form-group">
                <label>{t('command_tower.command')}</label>
                <textarea
                    value={formData.content}
                    onChange={e => handleChange('content', e.target.value)}
                    placeholder={t('command_tower.command_placeholder')}
                    rows={3}
                    className="project-input"
                />
            </div>

            {/* Stage selection only for new commands or if we want to allow moving */}
            {/* The original code didn't explicitly forbid moving, but usually "Add" has selector. "Edit" might not? 
                Original `handleEditCommand` modal JSX didn't have stage selector, it was fixed to the stage.
                Let's check if we should include it. The PROMPT said "Add/Edit popup extracted".
                If I combine them, I should support both. If original Edit didn't have it, maybe keep it that way or improve it.
                I will include it but maybe disabled or hidden if strictly following original logic which didn't show it in Edit.
                However, moving commands is a good feature. I'll include it.
            */}
            <div className="form-group">
                <label>{t('command_tower.stage')}</label>
                <select
                    value={formData.stage}
                    onChange={e => handleChange('stage', e.target.value)}
                    className="project-input"
                    disabled={isEdit} // Original edit didn't allow changing stage (it was implicit in the key). Let's keep it consistent or simple for now.
                >
                    {stages.map(s => (
                        <option key={s.key} value={s.key}>{s.customLabel || (s.isCustom ? s.label : t(s.label))}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>{t('common.color') || "颜色"}</label>
                <div className="ct-color-picker">
                    {freshColors.map(c => (
                        <div
                            key={c.color}
                            className={`ct-color-option ${formData.color === c.color ? 'selected' : ''}`}
                            onClick={() => handleChange('color', c.color)}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
}
