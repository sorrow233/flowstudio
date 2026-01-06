import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export default function WorkshopPage() {
    const { t } = useTranslation();

    // Mock active projects
    const [projects] = useState([
        { id: 101, name: 'Flow Studio v2.1', color: '#1a1a2e', textColor: '#ffffff' },
        { id: 102, name: 'I18n System', color: '#f0f0f0', textColor: '#1a1a1a' },
    ]);

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.workshop')}</h1>
                <div className="works-divider"></div>
            </header>

            <div className="works-grid">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="works-card"
                        style={{ backgroundColor: project.color }}
                    >
                        <div className="works-card-overlay" style={{ color: project.textColor }}>
                            <span className="works-card-name">{project.name}</span>
                        </div>
                    </div>
                ))}

                {/* Add New Project Card */}
                <div className="works-card works-card-add">
                    <Plus size={48} strokeWidth={1} />
                    <span>Start Project</span>
                </div>
            </div>
        </div>
    );
}
