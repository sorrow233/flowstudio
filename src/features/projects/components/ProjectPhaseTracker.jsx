import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { STAGES } from '../domain';
import './ProjectPhaseTracker.css';

const STAGE_ORDER = [
    STAGES.INSPIRATION,
    STAGES.PENDING,
    STAGES.EARLY,
    STAGES.GROWTH,
    STAGES.ADVANCED,
    STAGES.COMMERCIAL
];

export default function ProjectPhaseTracker({ currentStage }) {
    const { t } = useTranslation();
    const currentIndex = STAGE_ORDER.indexOf(currentStage);

    return (
        <div className="phase-tracker-container">
            {STAGE_ORDER.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isLocked = index > currentIndex;

                return (
                    <React.Fragment key={stage}>
                        <div className={`phase-step ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                            <div className="step-icon">
                                {isCompleted ? (
                                    <Check size={14} />
                                ) : isLocked ? (
                                    <Lock size={14} />
                                ) : (
                                    <span className="step-number">{index + 1}</span>
                                )}
                            </div>
                            <span className="step-label">
                                {t(`modules.workshop.stages.${stage}`) || stage}
                            </span>
                        </div>
                        {index < STAGE_ORDER.length - 1 && (
                            <div className={`phase-connector ${index < currentIndex ? 'active' : ''}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
