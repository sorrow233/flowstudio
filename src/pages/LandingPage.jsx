import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowRight, CheckCircle2, Zap, Shield, Globe } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
    const { t } = useTranslation();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="landing-logo">Flow Studio</div>
                <div className="landing-links">
                    <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                    <Link to="/about">{t('landing.about', 'About')}</Link>
                    <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
                    <LanguageSwitcher />
                    <Link to="/login" className="btn-login">{t('auth.login', 'Log In')}</Link>
                </div>
            </nav>

            <section className="hero-section">
                <h1>{t('landing.hero_title', 'Your AI-Driven Personal Software Arsenal')}</h1>
                <p className="hero-subtitle">
                    {t('landing.hero_subtitle', 'From idea to realization, Flow Studio manages your entire development lifecycle with AI-powered tools.')}
                </p>
                <div className="hero-cta">
                    <Link to="/app" className="btn-cta">
                        {t('landing.start_free', 'Start for Free')} <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon"><Zap size={32} /></div>
                    <h3>{t('nav.backlog', 'Backlog')}</h3>
                    <p>{t('dashboard.backlog_desc', 'Manage approved ideas pending development.')}</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Globe size={32} /></div>
                    <h3>{t('nav.workshop', 'Workshop')}</h3>
                    <p>{t('dashboard.workshop_desc', 'Track active projects and tasks.')}</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Shield size={32} /></div>
                    <h3>{t('nav.command_tower', 'Command Tower')}</h3>
                    <p>{t('dashboard.command_tower_desc', 'Execute tasks with AI Copilot.')}</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Flow Studio. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                    <Link to="/about">{t('landing.about', 'About')}</Link>
                    <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
                </div>
            </footer>
        </div>
    );
}
