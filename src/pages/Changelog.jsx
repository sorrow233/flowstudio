import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ChangelogPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Home
            </Link>
            <h1>Changelog</h1>

            <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: '2rem', marginTop: '2rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>v2.1.2</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>2026-01-06</span>
                    <ul style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                        <li>Added Public Landing Page.</li>
                        <li>Fixed White Screen of Death on missing configuration.</li>
                        <li>Implemented Pricing and About pages.</li>
                    </ul>
                </div>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>v2.1.1</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>2026-01-06</span>
                    <ul style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                        <li>Integrated Firebase Authentication.</li>
                        <li>Supported Google Sign-In and Restricted Email Registration.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
