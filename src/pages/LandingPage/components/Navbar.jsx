import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    return (
        <nav className="landing-nav">
            <Link to="/" className="landing-logo">Flow Studio</Link>
            <div className="landing-links">
                <Link to="/pricing">{t('landing.pricing', 'Pricing')}</Link>
                <Link to="/about">{t('landing.about', 'About')}</Link>
                <Link to="/changelog">{t('landing.changelog', 'Changelog')}</Link>
                <LanguageSwitcher />
                {currentUser ? (
                    <Link to="/app" className="btn-login" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            overflow: 'hidden'
                        }}>
                            {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <span>{t('landing.dashboard', 'Dashboard')}</span>
                    </Link>
                ) : (
                    <Link to="/login" className="btn-login">{t('auth.login', 'Log In')}</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
