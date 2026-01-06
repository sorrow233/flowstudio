import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Lightbulb, Rocket } from 'lucide-react';

export default function BacklogPage() {
    const { t } = useTranslation();

    const [inspirationItems] = useState([
        { id: 1, name: 'AI Storyteller', color: '#ffd1dc' }, // Pastel Pink
        { id: 2, name: 'Crypto Tracker', color: '#c1e1c1' }, // Pastel Green
    ]);

    const [pendingItems] = useState([
        { id: 3, name: 'Flow Studio Mobile', color: '#ffaaa5' }, // Red-ish
        { id: 4, name: 'Database Optimization', color: '#a8e6cf' }, // Teal-ish
        { id: 5, name: 'User Authentication', color: '#dcedc1' }, // Light Green
    ]);

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.backlog')}</h1>
                <div className="works-divider"></div>
            </header>

            {/* Inspiration Pool */}
            <section className="works-section">
                <div className="works-section-header">
                    <Lightbulb size={20} className="text-yellow-400" />
                    <h2 className="works-section-title">{t('modules.backlog.sections.inspiration')}</h2>
                </div>
                <div className="works-grid-Refined">
                    {inspirationItems.map((item) => (
                        <div
                            key={item.id}
                            className="works-card edit-mode"
                            style={{ backgroundColor: item.color }}
                            title="Click to Edit Idea"
                        >
                            <div className="works-card-overlay">
                                <span className="works-card-name">{item.name}</span>
                            </div>
                        </div>
                    ))}
                    <div className="works-card works-card-add">
                        <Plus size={32} />
                        <span>Add Idea</span>
                    </div>
                </div>
            </section>

            {/* Pending Development */}
            <section className="works-section">
                <div className="works-section-header">
                    <Rocket size={20} className="text-red-400" />
                    <h2 className="works-section-title">{t('modules.backlog.sections.pending')}</h2>
                </div>
                <div className="works-grid-Refined">
                    {pendingItems.map((item) => (
                        <div
                            key={item.id}
                            className="works-card"
                            style={{ backgroundColor: item.color }}
                            title="Click to Plan Project"
                        >
                            <div className="works-card-overlay">
                                <span className="works-card-name">{item.name}</span>
                            </div>
                        </div>
                    ))}
                    <div className="works-card works-card-add">
                        <Plus size={32} />
                        <span>Add Project</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
