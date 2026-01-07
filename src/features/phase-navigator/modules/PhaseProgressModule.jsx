import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Unlock, ChevronRight, Trophy } from 'lucide-react';

export default function PhaseProgressModule({ progress, canAdvance, onAdvance, nextStageName }) {
    const { t } = useTranslation();

    return (
        <div className="phase-module progress-module">
            <div className="progress-circular">
                <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="circle"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">{progress}%</text>
                </svg>
            </div>

            <div className="progress-content">
                <div className="progress-status">
                    {progress === 100 ? (
                        <>
                            <Trophy size={20} className="text-warning bounce" />
                            <h4>{t('phase.progress.ready') || "Stage Complete!"}</h4>
                        </>
                    ) : (
                        <>
                            <Lock size={20} className="text-tertiary" />
                            <h4>{t('phase.progress.locked') || "Level In Progress"}</h4>
                        </>
                    )}
                </div>

                <button
                    className={`btn-advance-phase ${canAdvance ? 'unlocked' : 'locked'}`}
                    onClick={canAdvance ? onAdvance : undefined}
                    disabled={!canAdvance}
                >
                    <span>{t('phase.action.advance') || "Enter Next Stage"}</span>
                    {canAdvance ? <Unlock size={16} /> : <Lock size={16} />}
                </button>

                {nextStageName && (
                    <span className="next-stage-preview">
                        Next: {t(`modules.workshop.stages.${nextStageName}`) || nextStageName}
                    </span>
                )}
            </div>
        </div>
    );
}
