import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, Loader2, Play, CheckCircle } from 'lucide-react';
import { analyzeIdea } from '../../services/ai';

export default function IncubatorPage() {
    const { t } = useTranslation();
    const [idea, setIdea] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleCapture = async (e) => {
        e.preventDefault();
        if (!idea.trim()) return;

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const result = await analyzeIdea(idea);
            setAnalysis(result);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <div className="page-container incubator-page">
            <div className="page-header center">
                <h1 className="text-h2">{t('nav.incubator')}</h1>
                <p className="text-small">{t('modules.incubator.subtitle')}</p>
            </div>

            {/* Input Card */}
            <div className={`card incubate-card ${analysis ? 'compact' : ''}`}>
                <div className="card-header highlight">
                    <Sparkles size={20} />
                    <h3 className="text-h3 font-bold">{t('modules.incubator.quick_capture')}</h3>
                </div>
                <form onSubmit={handleCapture} className="incubate-form">
                    <textarea
                        className="input-textarea"
                        placeholder={t('modules.incubator.placeholder')}
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary gap-2" disabled={isAnalyzing || !idea.trim()}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>{t('modules.incubator.analyzing')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('modules.incubator.ignite')}</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Analysis Result Card */}
            {analysis && (
                <div className="card analysis-card slide-up">
                    <div className="analysis-header">
                        <h3 className="text-h3">{t('modules.incubator.analysis_brief')}</h3>
                        <div className="badge">{analysis.commercial.score}{t('modules.incubator.tier_opportunity')}</div>
                    </div>

                    <div className="analysis-section">
                        <p className="text-h2 summary-text">"{analysis.summary}"</p>
                    </div>

                    <div className="analysis-grid">
                        <div className="info-box">
                            <span className="label">{t('modules.incubator.monetization')}</span>
                            <span className="value">{analysis.commercial.monetization}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">{t('modules.incubator.timeline')}</span>
                            <span className="value">{analysis.tech.estimatedTimeline}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">{t('modules.incubator.complexity')}</span>
                            <span className="value">{analysis.tech.complexity}</span>
                        </div>
                    </div>

                    <div className="analysis-stack">
                        <span className="label">{t('modules.incubator.recommended_stack')}</span>
                        <div className="tags">
                            {analysis.tech.stack.map(tech => (
                                <span key={tech} className="tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="analysis-steps">
                        <span className="label">{t('modules.incubator.next_steps')}</span>
                        <ul className="step-list">
                            {analysis.steps.map((step, idx) => (
                                <li key={idx} className="step-item">
                                    <CheckCircle size={16} className="step-icon" />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="analysis-actions">
                        <button className="btn btn-primary gap-2">
                            <Play size={16} />
                            <span>{t('modules.incubator.start_project')}</span>
                        </button>
                        <button className="btn gap-2" onClick={() => setAnalysis(null)}>
                            <span>{t('modules.incubator.discard')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
