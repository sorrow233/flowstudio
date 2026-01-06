import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Home
            </Link>
            <h1>About Flow Studio</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Flow Studio is designed to be your personal software arsenal, merging the power of AI with structured project management workflows.
            </p>
        </div>
    );
}
