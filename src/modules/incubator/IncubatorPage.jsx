import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function IncubatorPage() {
    const [idea, setIdea] = useState('');

    const handleCapture = (e) => {
        e.preventDefault();
        if (!idea.trim()) return;
        alert(`Captured idea: ${idea}\n(AI Analysis trigger would happen here)`);
        setIdea('');
    }

    return (
        <div className="page-container incubator-page">
            <div className="page-header center">
                <h1 className="text-h2">Incubator</h1>
                <p className="text-small">Where ideas are born and analyzed.</p>
            </div>

            <div className="card incubate-card">
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
                    />
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary gap-2">
                            <span>Ignite Idea</span>
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
