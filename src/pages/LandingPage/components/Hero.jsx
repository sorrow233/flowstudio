import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    const { t } = useTranslation();
    return (
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
    );
};

export default Hero;
