import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ExternalLink, Target, Check, X } from 'lucide-react';
import './ProjectCard.css';

export default function AddProjectCard({ onAdd, accentColor, addLabel }) {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        link: '',
        goal: ''
    });

    const handleSubmit = () => {
        if (!formData.name.trim()) return;
        onAdd(formData);
        setFormData({ name: '', link: '', goal: '' });
        setIsAdding(false);
    };

    const handleCancel = () => {
        setFormData({ name: '', link: '', goal: '' });
        setIsAdding(false);
    };

    if (isAdding) {
        return (
            <div className="project-card project-card-editing" style={{ '--accent-color': accentColor }}>
                <div className="project-card-form">
                    <div className="project-form-row">
                        <input
                            type="text"
                            className="project-input project-input-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('common.project_name')}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>
                    <div className="project-form-row">
                        <ExternalLink size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder={t('common.project_link')}
                        />
                    </div>
                    <div className="project-form-row">
                        <Target size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            placeholder={t('common.project_goal')}
                        />
                    </div>
                    <div className="project-form-actions">
                        <button className="project-action-btn project-action-save" onClick={handleSubmit}>
                            <Check size={14} />
                            <span>{t('common.add')}</span>
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

    return (
        <div
            className="project-card project-card-add"
            onClick={() => setIsAdding(true)}
        >
            <Plus size={24} />
            <span>{addLabel || t('common.add_project')}</span>
        </div>
    );
}
