import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="landing-footer">
            <p>&copy; {new Date().getFullYear()} Flow Studio. All rights reserved.</p>
            <div className="footer-links">
                <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                <Link to="/about">{t('landing.about', 'About')}</Link>
                <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
            </div>
        </footer>
    );
};

export default Footer;
