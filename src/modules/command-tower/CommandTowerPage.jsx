import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Lightbulb, Rocket, Sprout, TrendingUp, Award, DollarSign } from 'lucide-react';

export default function CommandTowerPage() {
    const { t } = useTranslation();

    // Commands organized by stage
    const [commands, setCommands] = useState({
        inspiration: [
            { id: 1, title: 'Code Review Prompt', content: 'Review this code for best practices...' }
        ],
        pending: [
            { id: 2, title: 'Deploy Pipeline', content: 'npm run deploy:main' }
        ],
        early: [
            { id: 3, title: 'Git Status', content: 'git status' }
        ],
        growth: [
            { id: 4, title: 'Full Scan', content: '/filescan' }
        ],
        advanced: [],
        commercial: []
    });

    const stageConfig = [
        { key: 'inspiration', icon: <Lightbulb size={18} />, label: t('modules.backlog.sections.inspiration') },
        { key: 'pending', icon: <Rocket size={18} />, label: t('modules.backlog.sections.pending') },
        { key: 'early', icon: <Sprout size={18} />, label: t('modules.workshop.stages.early') },
        { key: 'growth', icon: <TrendingUp size={18} />, label: t('modules.workshop.stages.growth') },
        { key: 'advanced', icon: <Award size={18} />, label: t('modules.workshop.stages.advanced') },
        { key: 'commercial', icon: <DollarSign size={18} />, label: t('modules.workshop.stages.commercial') }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.command_tower')}</h1>
                <div className="works-divider"></div>
            </header>

            {stageConfig.map(({ key, icon, label }) => (
                <section key={key} className="works-section">
                    <div className="works-section-header">
                        {icon}
                        <h2 className="works-section-title">{label}</h2>
                    </div>
                    <div className="works-grid-Refined command-grid">
                        {commands[key].map((cmd) => (
                            <div
                                key={cmd.id}
                                className="command-card"
                                onClick={() => copyToClipboard(cmd.content)}
                                title="Click to copy"
                            >
                                <h3 className="command-card-title">{cmd.title}</h3>
                                <code className="command-card-content">{cmd.content}</code>
                            </div>
                        ))}
                        <div className="command-card command-card-add">
                            <Plus size={24} />
                            <span>Add</span>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
