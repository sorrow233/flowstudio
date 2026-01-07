import React from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CyclicalModule({ commands = [], onRun }) {
    const { t } = useTranslation();

    return (
        <div className="phase-module cyclical-module">
            <div className="module-header">
                <div className="module-title-group">
                    <div className="icon-badge cyclical">
                        <RefreshCw size={18} />
                    </div>
                    <div>
                        <h4>{t('phase.cyclical.title') || "Routine Maintenance"}</h4>
                        <span className="module-subtitle">{t('phase.cyclical.subtitle') || "Keep it healthy"}</span>
                    </div>
                </div>
                <span className="count-badge">{commands.length}</span>
            </div>

            <div className="module-content">
                {commands.length === 0 ? (
                    <div className="empty-state">
                        <p>No routine tasks.</p>
                    </div>
                ) : (
                    commands.map(cmd => (
                        <div key={cmd.id} className="task-card routine">
                            <div className="task-header">
                                <span className="task-name">{cmd.title}</span>
                                {/* Simulating state: a 'dot' that clears when run could be added later */}
                                <div className="status-dot warning animate-pulse" title="Due for run" />
                            </div>
                            <div className="task-cmd-preview click-to-run" onClick={() => onRun(cmd)}>
                                <code>{cmd.content}</code>
                                <Play size={12} className="run-icon" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
