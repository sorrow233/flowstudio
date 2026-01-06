import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Target, Zap, Archive, Settings } from 'lucide-react';

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

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="logo-box"></div>
                    <span className="app-title">Flow</span>
                </div>

                <nav className="sidebar-nav">
                    <NavItem to="/" icon={Home} label="Dashboard" isActive={location.pathname === '/'} />
                    <div className="nav-divider"></div>
                    <NavItem to="/incubator" icon={Sparkles} label="Incubator" isActive={location.pathname.startsWith('/incubator')} />
                    <NavItem to="/vision-studio" icon={Target} label="Vision Studio" isActive={location.pathname.startsWith('/vision-studio')} />
                    <NavItem to="/command-tower" icon={Zap} label="Command Tower" isActive={location.pathname.startsWith('/command-tower')} />
                    <NavItem to="/archive" icon={Archive} label="Archive" isActive={location.pathname.startsWith('/archive')} />
                </nav>

                <div className="sidebar-footer">
                    <NavItem to="/settings" icon={Settings} label="Settings" isActive={location.pathname === '/settings'} />
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
