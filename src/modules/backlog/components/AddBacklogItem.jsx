import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Target, Check, X, Zap } from 'lucide-react';
import '@/components/ProjectCard.css';

export default function AddBacklogItem({ onAdd, accentColor, addLabel }) {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '', // Maps to Project Objective (项目目标)
        goal: ''  // Maps to Objective Driven (目标驱动)
    });

    const handleSubmit = () => {
        if (!formData.name.trim()) return;
        // Backlog items don't have a link in this simplified view
        onAdd({
            name: formData.name,
            goal: formData.goal,
            link: ''
        });
        setFormData({ name: '', goal: '' });
        setIsAdding(false);
    };

    const handleCancel = () => {
        setFormData({ name: '', goal: '' });
        setIsAdding(false);
    };

    if (isAdding) {
        return (
            <div className="project-card project-card-editing" style={{ '--accent-color': accentColor }}>
                <div className="project-card-form">
                    <div className="project-form-row">
                        <Target size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input project-input-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('module.backlog.add_objective_placeholder')}
                            title={t('module.backlog.add_objective')}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    <div className="project-form-row">
                        <Zap size={14} className="project-form-icon" />
                        <input
                            type="text"
                            className="project-input"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            placeholder={t('module.backlog.add_driven_placeholder')}
                            title={t('module.backlog.add_driven')}
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
            <span>{addLabel || t('common.add_idea')}</span>
        </div>
    );
}
