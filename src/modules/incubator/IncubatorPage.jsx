import React, { useState } from 'react';
import { Send, Sparkles, Loader2, Play, CheckCircle } from 'lucide-react';
import { analyzeIdea } from '../../services/ai';

export default function IncubatorPage() {
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
                <h1 className="text-h2">Incubator</h1>
                <p className="text-small">Where ideas are born and analyzed.</p>
            </div>

            {/* Input Card */}
            <div className={`card incubate-card ${analysis ? 'compact' : ''}`}>
                <div className="card-header highlight">
                    <Sparkles size={20} />
                    <h3 className="text-h3 font-bold">Quick Capture</h3>
                </div>
                <form onSubmit={handleCapture} className="incubate-form">
                    <textarea
                        className="input-textarea"
                        placeholder="I want to build a software that..."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary gap-2" disabled={isAnalyzing || !idea.trim()}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ignite Idea</span>
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
                        <h3 className="text-h3">AI Analysis Brief</h3>
                        <div className="badge">{analysis.commercial.score}-Tier Opportunity</div>
                    </div>

                    <div className="analysis-section">
                        <p className="text-h2 summary-text">"{analysis.summary}"</p>
                    </div>

                    <div className="analysis-grid">
                        <div className="info-box">
                            <span className="label">Monetization</span>
                            <span className="value">{analysis.commercial.monetization}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Timeline</span>
                            <span className="value">{analysis.tech.estimatedTimeline}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Complexity</span>
                            <span className="value">{analysis.tech.complexity}</span>
                        </div>
                    </div>

                    <div className="analysis-stack">
                        <span className="label">Recommended Stack:</span>
                        <div className="tags">
                            {analysis.tech.stack.map(tech => (
                                <span key={tech} className="tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="analysis-steps">
                        <span className="label">Next Steps:</span>
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
                            <span>Start Project</span>
                        </button>
                        <button className="btn gap-2" onClick={() => setAnalysis(null)}>
                            <span>Discard</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
