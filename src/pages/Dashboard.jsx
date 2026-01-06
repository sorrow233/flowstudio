import React from 'react';
import { Sparkles, Target, Zap, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModuleCard = ({ title, icon: Icon, description, to, color }) => (
    <Link to={to} className="module-card">
        <div className="module-header">
            <div className="module-icon" style={{ '--icon-color': color }}>
                <Icon size={24} color={color} />
            </div>
        </div>
        <div className="module-content">
            <h3 className="text-h3 module-title">{title}</h3>
            <p className="text-small module-desc">{description}</p>
        </div>
    </Link>
);

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="text-h1">Flow Studio</h1>
                <p className="text-body subtitle">
                    Your AI-Driven Personal Software Arsenal.
                </p>
            </div>

            <div className="dashboard-grid">
                <ModuleCard
                    title="Incubator"
                    icon={Sparkles}
                    description="Capture and analyze new ideas with AI."
                    to="/incubator"
                    color="var(--color-accent-vermilion)"
                />
                <ModuleCard
                    title="Vision Studio"
                    icon={Target}
                    description="Define project scope and milestones."
                    to="/vision-studio"
                    color="var(--color-accent-teal)"
                />
                <ModuleCard
                    title="Command Tower"
                    icon={Zap}
                    description="Execute tasks with AI Copilot."
                    to="/command-tower"
                    color="var(--color-accent-indigo)"
                />
                <ModuleCard
                    title="Archive"
                    icon={Archive}
                    description="Reusable blocks and retrospective logs."
                    to="/archive"
                    color="var(--text-secondary)"
                />
            </div>
        </div>
    );
}
