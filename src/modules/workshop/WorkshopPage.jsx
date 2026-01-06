import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, CheckSquare, Clock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WorkshopPage() {
    const { t } = useTranslation();

    // Mock active projects
    const [projects] = useState([
        {
            id: 101,
            name: 'Flow Studio v2.1',
            status: 'coding',
            progress: 65,
            logs: ['Refactoring modules', 'Updating UI components']
        },
        {
            id: 102,
            name: 'I18n Optimization',
            status: 'testing',
            progress: 90,
            logs: ['Verifying Japanese locale', 'Fixing routing']
        }
    ]);

    return (
        <div className="page-container workshop-page">
            <div className="page-header center fade-in-up">
                <h1 className="text-h2 font-serif">{t('nav.workshop')}</h1>
                <p className="text-small text-muted tracking-wide uppercase">{t('modules.workshop.subtitle')}</p>
            </div>

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
                {projects.map((project, index) => (
                    <div
                        key={project.id}
                        className="card glass-panel relative overflow-hidden"
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        {/* Status Pulse */}
                        {project.status === 'coding' && (
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-mono text-green-500 uppercase">Active</span>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Layout size={24} className="text-primary" />
                                <h3 className="text-2xl font-light">{project.name}</h3>
                            </div>

                            <div className="mt-6 mb-2 flex justify-between text-xs font-mono text-muted">
                                <span>PROGRESS</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>

                            <div className="mt-6 bg-black/20 rounded p-4 font-mono text-xs text-muted/80">
                                <div className="flex items-center gap-2 mb-2 text-primary/80">
                                    <Zap size={14} />
                                    <span>LATEST ACTIVITY</span>
                                </div>
                                {project.logs.map((log, i) => (
                                    <div key={i} className="pl-4 border-l-2 border-border/20 py-1">
                                        {`> ${log}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
