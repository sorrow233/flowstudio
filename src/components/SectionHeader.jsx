import React from 'react';
import './ProjectCard.css';

export default function SectionHeader({ icon, title, count }) {
    return (
        <div className="project-section-header">
            <div className="project-section-icon">
                {icon}
            </div>
            <h2 className="project-section-title">{title}</h2>
            {count !== undefined && (
                <span className="project-section-count">{count}</span>
            )}
        </div>
    );
}
