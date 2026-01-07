import React from 'react';
import { CheckCircle, Circle, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CriticalPathModule({ commands = [], completedIds = [], onToggle }) {
    const { t } = useTranslation();

    return (
        <div className="phase-module critical-module">
            <div className="module-header">
                <div className="module-title-group">
                    <div className="icon-badge critical">
                        <Flame size={18} />
                    </div>
                    <div>
                        <h4>{t('phase.critical.title') || "Critical Path"}</h4>
                        <span className="module-subtitle">{t('phase.critical.subtitle') || "Must-do for this stage"}</span>
                    </div>
                </div>
                <span className="count-badge">{commands.length}</span>
            </div>

            <div className="module-content">
                {commands.length === 0 ? (
                    <div className="empty-state">
                        <p>No critical tasks for this stage.</p>
                    </div>
                ) : (
                    commands.map(cmd => {
                        const isCompleted = completedIds.includes(cmd.id);
                        return (
                            <div key={cmd.id} className={`task-card ${isCompleted ? 'completed' : ''}`}>
                                <div className="task-header">
                                    <button
                                        className={`btn-check-task ${isCompleted ? 'checked' : ''}`}
                                        onClick={() => onToggle(cmd.id)}
                                    >
                                        {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                                    </button>
                                    <span className="task-name">{cmd.title}</span>
                                </div>
                                <div className="task-cmd-preview">
                                    <code>{cmd.content}</code>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
