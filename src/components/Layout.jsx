import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Zap, Layers, Layout as LayoutIcon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="logo-box"></div>
                    <span className="app-title">{t('app.title')}</span>
                </div>

                <nav className="sidebar-nav">
                    <NavItem to="/" icon={Home} label={t('nav.dashboard')} isActive={location.pathname === '/'} />
                    <div className="nav-divider"></div>
                    <NavItem to="/backlog" icon={Layers} label={t('nav.backlog')} isActive={location.pathname.startsWith('/backlog')} />
                    <NavItem to="/workshop" icon={LayoutIcon} label={t('nav.workshop')} isActive={location.pathname.startsWith('/workshop')} />
                    <NavItem to="/command-tower" icon={Zap} label={t('nav.command_tower')} isActive={location.pathname.startsWith('/command-tower')} />
                </nav>

                <div className="sidebar-footer">
                    <div style={{ padding: '0 1rem 1rem 1rem' }}>
                        <LanguageSwitcher />
                    </div>
                    <NavItem to="/settings" icon={Settings} label={t('nav.settings')} isActive={location.pathname === '/settings'} />
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
