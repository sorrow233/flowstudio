import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="hero-section">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="hero-badge"
            >
                <Sparkles size={14} />
                <span>{t('landing.new_era', 'A New Era of Personal Software')}</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-h1"
            >
                {t('landing.hero_title', 'Master Your Ideas in a Digital Zen')}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="hero-subtitle"
            >
                {t('landing.hero_subtitle', 'Flow Studio is where creativity meets engineering. A workspace designed for deep focus and effortless software generation.')}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="hero-cta"
            >
                <Link to="/app" className="btn-cta-premium">
                    {t('landing.get_started', 'Explore the Workshop')}
                    <div className="btn-arrow">
                        <ArrowRight size={18} />
                    </div>
                </Link>
                <button className="btn-secondary-glass">
                    {t('landing.watch_demo', 'Watch Process')}
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                className="hero-background-glow"
            />
        </section>
    );
};

export default Hero;
