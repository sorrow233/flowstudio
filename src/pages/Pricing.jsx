import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export default function PricingPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Home
            </Link>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Simple Pricing</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ padding: '2rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)' }}>
                    <h2>Free Starter</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>$0<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo</span></p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0' }}>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Check size={20} className="text-green-500" /> 3 Active Projects</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Check size={20} className="text-green-500" /> Basic AI Integration</li>
                    </ul>
                </div>
                <div style={{ padding: '2rem', border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-accent)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold' }}>POPULAR</span>
                    <h2>Pro Creator</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>$19<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo</span></p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0' }}>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Check size={20} className="text-green-500" /> Unlimited Projects</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Check size={20} className="text-green-500" /> Advanced AI Copilot</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Check size={20} className="text-green-500" /> Priority Support</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
