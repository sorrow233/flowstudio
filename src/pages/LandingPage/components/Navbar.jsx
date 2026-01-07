import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="landing-nav-floating"
        >
            <div className="nav-content">
                <Link to="/" className="landing-logo" onClick={() => console.log('[Navbar] "Flow Studio Logo" clicked')}>
                    <div className="logo-dot" />
                    <span>Flow Studio</span>
                </Link>

                <div className="landing-links">
                    <Link to="/changelog" className="nav-link">{t('landing.changelog', 'Changelog')}</Link>
                    <div className="nav-divider" />
                    <LanguageSwitcher />

                    {currentUser ? (
                        <Link to="/app" className="btn-dashboard-mini" onClick={() => console.log('[Navbar] "Go to Workshop" clicked')}>
                            <div className="user-avatar-mini">
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="User" />
                                ) : (
                                    (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
                                )}
                            </div>
                            <span>{t('landing.dashboard', 'Go to Workshop')}</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="btn-login-zen" onClick={() => console.log('[Navbar] "Sign In" clicked')}>
                            {t('auth.login', 'Sign In')}
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
