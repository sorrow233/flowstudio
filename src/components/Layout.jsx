import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Zap, Layers, Layout as LayoutIcon, Settings, LogOut, Sun, Moon, Laptop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
    <Link
        to={to}
        className={`nav-item ${isActive ? 'active' : ''}`}
    >
        <Icon size={20} />
        <span className="nav-label">{label}</span>
    </Link>
);

export default function Layout() {
    const location = useLocation();
    const { t } = useTranslation();
    const { isGuest, currentUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const getThemeIcon = () => {
        if (theme === 'light') return Sun;
        if (theme === 'dark') return Moon;
        return Laptop;
    };

    const ThemeIcon = getThemeIcon();

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="app-sidebar">
                <Link to="/" className="sidebar-header">
                    <div className="logo-box"></div>
                    <span className="app-title">{t('app.title')}</span>
                </Link>

                <nav className="sidebar-nav">
                    <NavItem to="/app" icon={Home} label={t('nav.dashboard')} isActive={location.pathname === '/app'} />
                    <div className="nav-divider"></div>
                    <NavItem to="/app/backlog" icon={Layers} label={t('nav.backlog')} isActive={location.pathname.startsWith('/app/backlog')} />
                    <NavItem to="/app/workshop" icon={LayoutIcon} label={t('nav.workshop')} isActive={location.pathname.startsWith('/app/workshop')} />
                    <NavItem to="/app/command-tower" icon={Zap} label={t('nav.command_tower')} isActive={location.pathname.startsWith('/app/command-tower')} />
                </nav>

                <div className="sidebar-footer">
                    <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', gap: '8px' }}>
                        <LanguageSwitcher />
                        <button
                            className="nav-item"
                            onClick={toggleTheme}
                            style={{
                                border: '1px solid var(--border-subtle)',
                                background: 'transparent',
                                padding: '6px',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                            title={`Current theme: ${theme}`}
                        >
                            <ThemeIcon size={18} />
                        </button>
                    </div>

                    {currentUser ? (
                        <div className="user-profile-section" style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div className="user-avatar" style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    overflow: 'hidden'
                                }}>
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                                        {currentUser.displayName || 'User'}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {currentUser.email}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="nav-item"
                                style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', justifyContent: 'flex-start' }}
                            >
                                <LogOut size={20} />
                                <span className="nav-label">{t('auth.logout', 'Log Out')}</span>
                            </button>
                        </div>
                    ) : (
                        isGuest && (
                            <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                <NavItem to="/login" icon={LayoutIcon} label={t('auth.login', 'Sign In')} isActive={false} />
                            </div>
                        )
                    )}

                    {!currentUser && <NavItem to="/app/settings" icon={Settings} label={t('nav.settings')} isActive={location.pathname === '/app/settings'} />}
                </div>
            </aside>

            {/* Main Content */}
            <main className="app-main">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
