import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';

export default function StageModal({ isOpen, onClose, onSave, defaultStages }) {
    const { t } = useTranslation();
    const [label, setLabel] = useState('');
    const [color, setColor] = useState(defaultStages[0]?.color || '');

    const handleSave = () => {
        onSave({ label, color });
        setLabel(''); // Reset after save
        setColor(defaultStages[0]?.color || '');
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('common.add_category') || "Add Category"}
            footer={
                <>
                    <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
                    <button className="btn btn-primary" onClick={handleSave}>{t('common.add')}</button>
                </>
            }
        >
            <div className="form-group">
                <label>{t('common.name') || "Name"}</label>
                <input
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="Category Name"
                    autoFocus
                    className="project-input"
                />
            </div>
            <div className="form-group">
                <label>{t('common.color') || "Color"}</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {defaultStages.map(ds => (
                        <div
                            key={ds.key}
                            onClick={() => setColor(ds.color)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: ds.color,
                                cursor: 'pointer',
                                border: color === ds.color ? '2px solid var(--text-primary)' : '2px solid transparent',
                                boxShadow: color === ds.color ? '0 0 0 2px var(--bg-card)' : 'none'
                            }}
                            title={ds.key}
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
}
