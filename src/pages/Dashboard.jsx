import React from 'react';
import { Sparkles, Target, Zap, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModuleCard = ({ title, icon: Icon, description, to, color }) => (
    <Link to={to} className="card flex flex-col gap-4 hover:border-[color:var(--text-primary)] transition-colors text-inherit no-underline">
        <div className="flex items-center justify-between">
            <div className="p-2 rounded-full" style={{ backgroundColor: `var(--bg-app)` }}>
                <Icon size={24} color={color} />
            </div>
        </div>
        <div>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>{title}</h3>
            <p className="text-small">{description}</p>
        </div>
    </Link>
);

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-h1">Flow Studio</h1>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Your AI-Driven Personal Software Arsenal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
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
