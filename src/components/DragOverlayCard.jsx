import React from 'react';
import { ExternalLink, Target, Calendar } from 'lucide-react';
import './ProjectCard.css';

export default function DragOverlayCard({ item, accentColor }) {
    if (!item) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div
            className="project-card drag-overlay-card"
            style={{ '--accent-color': accentColor, backgroundColor: item.color }}
        >
            <div className="project-card-header">
                <h3 className="project-card-name">
                    {item.name || '未命名'}
                </h3>
            </div>

            <div className="project-card-body">
                {item.link && (
                    <div className="project-card-info">
                        <ExternalLink size={12} />
                        <span className="project-link">{item.link}</span>
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
