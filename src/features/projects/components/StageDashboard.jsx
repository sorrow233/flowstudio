import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, AlertTriangle, Clock, Terminal, ChevronRight } from 'lucide-react';
import CommandItem from '@/modules/command-tower/components/CommandItem';
import { validateForNextStage, calculateStageProgress } from '../domain';
import './StageDashboard.css';

export default function StageDashboard({
    project,
    stageCommands = [],
    onToggleCompletion,
    onAdvanceStage
}) {
    const { t } = useTranslation();

    const mandatoryCommands = stageCommands.filter(c => c.category === 'mandatory' || !c.category);
    const periodicCommands = stageCommands.filter(c => c.category === 'periodic');
    const troubleshootingCommands = stageCommands.filter(c => c.category === 'troubleshooting');

    const progress = calculateStageProgress(project, stageCommands);
    const validation = validateForNextStage(project, project.stage, stageCommands); // Check validation for *leaving* current stage? No, validation is for *entering* next.
    // Actually we want to check if they can *advance*.
    // The validation function logic I wrote was: if (missingMandatory) return valid: false.
    // And it checks completedIds against mandatoryCommands.

    // So we need to calculate 'canAdvance' based on moving FROM current TO next.
    // But wait, `validateForNextStage` logic inside `domain.js` needs nextStage. 
    // And I implemented it to check *current* stage completion.
    // So I need to pass the *next* stage to it? Or just ANY stage that triggers the check?
    // Let's re-read my domain logic.
    // "if (nextStage === ...)" checks Name/Link.
    // "mandatoryCommands = stageCommands.filter..."
    // "completedIds = ..."
    // It uses `project.stage` as `currentStage`.

    // So if I call `validateForNextStage(project, 'any_next_stage', stageCommands)`, it will run the mandatory check on `currentStage`.
    // Correct.

    const canAdvance = validateForNextStage(project, 'dummy_next_stage', stageCommands).valid;

    return (
        <div className="stage-dashboard">
            {/* Progress Header */}
            <div className="stage-progress-header">
                <div className="progress-info">
                    <h3>{t(`modules.workshop.stages.${project.stage}`) || project.stage} Stage Progress</h3>
                    <span className="progress-percentage">{progress}% Complete</span>
                </div>
                <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="stage-columns">
                {/* 1. Mandatory */}
                <div className="stage-column mandatory-column">
                    <div className="column-header">
                        <AlertTriangle size={18} className="text-warning" />
                        <h4>{t('project.stage.mandatory') || "Mandatory"}</h4>
                        <span className="badge-count">{mandatoryCommands.length}</span>
                    </div>
                    <div className="column-content">
                        {mandatoryCommands.length === 0 ? (
                            <p className="empty-text">No mandatory commands.</p>
                        ) : (
                            mandatoryCommands.map(cmd => {
                                const isCompleted = (project.completedCommandIds || []).includes(cmd.id);
                                return (
                                    <div key={cmd.id} className={`dashboard-card ${isCompleted ? 'completed' : ''}`}>
                                        <div className="card-header-row">
                                            <button
                                                className={`btn-check ${isCompleted ? 'checked' : ''}`}
                                                onClick={() => onToggleCompletion(project.id, cmd.id)}
                                            >
                                                {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </button>
                                            <span className="card-title">{cmd.title}</span>
                                        </div>
                                        <div className="card-snippet">
                                            <code>{cmd.content}</code>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. Periodic */}
                <div className="stage-column periodic-column">
                    <div className="column-header">
                        <Clock size={18} className="text-info" />
                        <h4>{t('project.stage.periodic') || "Periodic"}</h4>
                        <span className="badge-count">{periodicCommands.length}</span>
                    </div>
                    <div className="column-content">
                        {periodicCommands.map(cmd => (
                            <div key={cmd.id} className="dashboard-card">
                                <span className="card-title">{cmd.title}</span>
                                <div className="card-snippet">
                                    <code>{cmd.content}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Troubleshooting */}
                <div className="stage-column troubleshooting-column">
                    <div className="column-header">
                        <Terminal size={18} className="text-secondary" />
                        <h4>{t('project.stage.troubleshooting') || "Troubleshooting"}</h4>
                        <span className="badge-count">{troubleshootingCommands.length}</span>
                    </div>
                    <div className="column-content">
                        {troubleshootingCommands.map(cmd => (
                            <div key={cmd.id} className="dashboard-card compact">
                                <span className="card-title">{cmd.title}</span>
                                <div className="card-snippet click-to-copy" onClick={() => navigator.clipboard.writeText(cmd.content)}>
                                    <code>{cmd.content}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="stage-footer">
                <button
                    className={`btn-advance-stage ${canAdvance ? 'active' : 'disabled'}`}
                    onClick={() => canAdvance && onAdvanceStage(project.id, stageCommands)}
                    disabled={!canAdvance}
                    title={!canAdvance ? "Complete all mandatory commands to proceed" : "Advance to next stage"}
                >
                    Advanc Stage
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
