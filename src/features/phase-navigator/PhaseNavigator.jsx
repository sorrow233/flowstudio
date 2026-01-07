import React from 'react';
import { useTranslation } from 'react-i18next';
import { getNextStage } from '../domain'; // Need to ensure domain logic is imported or passed
import CriticalPathModule from './modules/CriticalPathModule';
import CyclicalModule from './modules/CyclicalModule';
import TroubleshootingModule from './modules/TroubleshootingModule';
import PhaseProgressModule from './modules/PhaseProgressModule';
import { STAGES } from '@/features/projects/domain';
import { calculateStageProgress, validateForNextStage } from '@/features/projects/domain';
import './PhaseNavigator.css';

const STAGE_ORDER = [
    STAGES.INSPIRATION,
    STAGES.PENDING,
    STAGES.EARLY,
    STAGES.GROWTH,
    STAGES.ADVANCED,
    STAGES.COMMERCIAL
];

export default function PhaseNavigator({
    project,
    stageCommands = [],
    onToggleCompletion,
    onAdvanceStage
}) {
    const { t } = useTranslation();
    const currentStageIndex = STAGE_ORDER.indexOf(project.stage);

    // Filter commands by category
    const mandatoryCommands = stageCommands.filter(c => c.category === 'mandatory' || !c.category);
    const cyclicalCommands = stageCommands.filter(c => c.category === 'periodic');
    const troubleCommands = stageCommands.filter(c => c.category === 'troubleshooting');

    // Progress Logic
    const progress = calculateStageProgress(project, stageCommands);

    // Gating Logic
    // We check validation for *leaving* current stage to *next* stage.
    // For now we assume linear progression.
    const nextStage = STAGES[Object.keys(STAGES)[currentStageIndex + 1]] || STAGE_ORDER[currentStageIndex + 1];

    // We use a dummy next stage for validation if we are just checking "can I leave?".
    // But `validateForNextStage` checks mandatory commands of CURRENT stage.
    // So we can pass nextStage or anything.
    const canAdvance = validateForNextStage(project, nextStage, stageCommands).valid;

    // Timeline Rendering
    const renderTimeline = () => (
        <div className="phase-timeline-scroll">
            <div className="phase-timeline">
                {STAGE_ORDER.map((stage, index) => {
                    const isPast = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    return (
                        <div key={stage} className={`timeline-node ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                            <div className="node-dot" />
                            <span className="node-label">{t(`modules.workshop.stages.${stage}`) || stage}</span>
                            {index < STAGE_ORDER.length - 1 && <div className="node-line" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="phase-navigator-container">
            {/* 1. Header & Timeline */}
            <div className="navigator-header">
                <h3>{t('phase.navigator.title') || "Phase Navigator"}</h3>
                {renderTimeline()}
            </div>

            {/* 2. Main Grid Layout */}
            <div className="navigator-grid">
                {/* Left Col: Critical Path (Crucial) */}
                <div className="grid-area-critical">
                    <CriticalPathModule
                        commands={mandatoryCommands}
                        completedIds={project.completedCommandIds || []}
                        onToggle={(cmdId) => onToggleCompletion(project.id, cmdId)}
                    />
                </div>

                {/* Right Top: Progress & Gating */}
                <div className="grid-area-progress">
                    <PhaseProgressModule
                        progress={progress}
                        canAdvance={canAdvance}
                        onAdvance={() => onAdvance(project.id, stageCommands)}
                        nextStageName={nextStage}
                    />
                </div>

                {/* Right Mid: Cyclical (Routine) */}
                <div className="grid-area-cyclical">
                    <CyclicalModule
                        commands={cyclicalCommands}
                        onRun={(cmd) => console.log('Run cyclical:', cmd.title)} // Placeholder for now
                    />
                </div>

                {/* Right Bottom: Troubleshooting (FAQ) */}
                <div className="grid-area-trouble">
                    <TroubleshootingModule
                        commands={troubleCommands}
                        onCopy={(content) => navigator.clipboard.writeText(content)}
                    />
                </div>
            </div>
        </div>
    );
}
