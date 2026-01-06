import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export default function BacklogPage() {
    const { t } = useTranslation();

    // Mock projects - each with a color for now (can be replaced with images)
    const [projects] = useState([
        { id: 1, name: 'AI Code Reviewer', color: '#a8d5ba' },
        { id: 2, name: 'Voice Command System', color: '#f5e6c8' },
        { id: 3, name: 'Dashboard Analytics', color: '#d4e4f7' },
        { id: 4, name: 'Mobile App Sync', color: '#f7d4d4' },
    ]);

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.backlog')}</h1>
                <div className="works-divider"></div>
            </header>

            <div className="works-grid">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="works-card"
                        style={{ backgroundColor: project.color }}
                    >
                        <div className="works-card-overlay">
                            <span className="works-card-name">{project.name}</span>
                        </div>
                    </div>
                ))}

                {/* Add New Project Card */}
                <div className="works-card works-card-add">
                    <Plus size={48} strokeWidth={1} />
                    <span>New Idea</span>
                </div>
            </div>
        </div>
    );
}
