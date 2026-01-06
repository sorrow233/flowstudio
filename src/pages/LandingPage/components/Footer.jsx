import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="landing-footer">
            <div className="footer-content">
                <div className="footer-links">
                    <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                    <Link to="/about">{t('landing.about', 'About')}</Link>
                    <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                </div>
                <p className="copyright">
                    &copy; {new Date().getFullYear()} Flow Studio. {t('landing.all_rights_reserved', 'All rights reserved.')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
