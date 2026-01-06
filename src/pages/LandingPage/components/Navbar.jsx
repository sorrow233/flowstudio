import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();
    return (
        <nav className="landing-nav">
            <Link to="/" className="landing-logo">Flow Studio</Link>
            <div className="landing-links">
                <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                <Link to="/about">{t('landing.about', 'About')}</Link>
                <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
                <LanguageSwitcher />
                <Link to="/login" className="btn-login">{t('auth.login', 'Log In')}</Link>
            </div>
        </nav>
    );
};

export default Navbar;
