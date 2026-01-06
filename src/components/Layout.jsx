import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Target, Zap, Archive, Settings } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'}`}
        style={{ textDecoration: 'none' }}
    >
        <Icon size={20} />
        <span className="text-body font-medium">{label}</span>
    </Link>
);

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border-subtle)] flex flex-col p-4 bg-[var(--bg-card)]">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded bg-[var(--color-accent)]"></div>
                    <span className="text-h3 font-bold tracking-tight">Flow</span>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    <NavItem to="/" icon={Home} label="Dashboard" isActive={location.pathname === '/'} />
                    <div className="my-2 border-b border-[var(--border-subtle)]"></div>
                    <NavItem to="/incubator" icon={Sparkles} label="Incubator" isActive={location.pathname.startsWith('/incubator')} />
                    <NavItem to="/vision-studio" icon={Target} label="Vision Studio" isActive={location.pathname.startsWith('/vision-studio')} />
                    <NavItem to="/command-tower" icon={Zap} label="Command Tower" isActive={location.pathname.startsWith('/command-tower')} />
                    <NavItem to="/archive" icon={Archive} label="Archive" isActive={location.pathname.startsWith('/archive')} />
                </nav>

                <div className="mt-auto">
                    <NavItem to="/settings" icon={Settings} label="Settings" isActive={location.pathname === '/settings'} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="container py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
