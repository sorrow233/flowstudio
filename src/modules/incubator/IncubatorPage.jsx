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
        <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-h2">Incubator</h1>
                <p className="text-small">Where ideas are born and analyzed.</p>
            </div>

            <div className="card flex flex-col gap-4 p-6 shadow-lg" style={{ borderColor: 'var(--color-accent)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                    <Sparkles size={20} />
                    <h3 className="text-h3 font-bold">Quick Capture</h3>
                </div>
                <form onSubmit={handleCapture} className="flex flex-col gap-4">
                    <textarea
                        className="w-full bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-md p-3 focus:outline-none transition-colors min-h-[120px] resize-none text-body"
                        style={{
                            borderColor: 'var(--border-subtle)',
                            fontFamily: 'inherit'
                        }}
                        placeholder="I want to build a software that..."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                    />
                    <div className="flex justify-end">
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
