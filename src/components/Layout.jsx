import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Zap, Layers, Layout as LayoutIcon, Settings, LogOut, Sun, Moon, Laptop, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
    <Link
        to={to}
        className={`nav-item ${isActive ? 'active' : ''}`}
    >
        <Icon size={22} strokeWidth={1.5} />
        <span className="nav-label">{label}</span>
    </Link>
);

export default function Layout() {
    const location = useLocation();
    const { t } = useTranslation();
    const { isGuest, currentUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        // Enforce dark mode preference for this theme, but allow toggle if needed
        if (theme === 'dark') setTheme('light');
        else setTheme('dark');
    };

    return (
        <div className="app-layout">
            {/* Quantum Flux Floating Dock */}
            <aside className="app-sidebar">
                <Link to="/" className="sidebar-header">
                    <div className="logo-box"></div>
                    <span className="app-title">{t('app.title')}</span>
                </Link>

                <nav className="sidebar-nav">
                    <NavItem to="/app" icon={Home} label={t('nav.dashboard')} isActive={location.pathname === '/app'} />
                    <NavItem to="/app/backlog" icon={Layers} label={t('nav.backlog')} isActive={location.pathname.startsWith('/app/backlog')} />
                    <NavItem to="/app/workshop" icon={LayoutIcon} label={t('nav.workshop')} isActive={location.pathname.startsWith('/app/workshop')} />
                    <NavItem to="/app/command-tower" icon={Zap} label={t('nav.command_tower')} isActive={location.pathname.startsWith('/app/command-tower')} />
                </nav>

                <div className="sidebar-footer">
                    {/* Settings / System Actions */}
                    <Link to="/app/settings" className={`nav-item ${location.pathname === '/app/settings' ? 'active' : ''}`}>
                        <Settings size={22} strokeWidth={1.5} />
                        <span className="nav-label">{t('nav.settings')}</span>
                    </Link>

                    {/* User Profile Mini-Orb */}
                    {currentUser ? (
                        <div className="nav-item" onClick={logout} style={{ cursor: 'pointer', marginTop: 'auto' }}>
                            <div className="user-profile-mini">
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="prop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>
                                        {(currentUser.displayName || 'U').charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="nav-label">{t('auth.logout', 'Log Out')}</span>
                        </div>
                    ) : (
                        <NavItem to="/login" icon={User} label={t('auth.login', 'Sign In')} isActive={false} />
                    )}
                </div>
            </aside>

            {/* Main Content Render Area */}
            <main className="app-main">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
