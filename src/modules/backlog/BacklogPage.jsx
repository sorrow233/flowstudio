import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, PlayCircle, ArrowRight, Clock, Star } from 'lucide-react';

export default function BacklogPage() {
    const { t } = useTranslation();

    // Mock data for UI demonstration
    const [backlogItems] = useState([
        { id: 1, title: 'AI Code Reviewer', tag: 'Core', priority: 'High', date: '2024-01-15' },
        { id: 2, title: 'Voice Command Integration', tag: 'Experimental', priority: 'Medium', date: '2024-02-01' },
        { id: 3, title: 'Cloudflare Analytics Dashboard', tag: 'Analytics', priority: 'Low', date: '2024-02-10' },
    ]);

    return (
        <div className="page-container backlog-page">
            <div className="page-header center fade-in-up">
                <h1 className="text-h2 font-serif">{t('nav.backlog')}</h1>
                <p className="text-small text-muted tracking-wide uppercase">{t('modules.backlog.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {backlogItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="card glass-panel hover-lift"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="card-header flex justify-between items-start mb-4">
                            <span className="badge badge-outline text-xs">{item.tag}</span>
                            {item.priority === 'High' && <Star size={16} className="text-accent fill-current" />}
                        </div>

                        <h3 className="text-xl font-medium mb-2">{item.title}</h3>

                        <div className="flex items-center text-muted text-xs mb-6 gap-2">
                            <Clock size={12} />
                            <span>{item.date}</span>
                        </div>

                        <div className="card-footer border-t border-border/10 pt-4 flex justify-between items-center">
                            <span className="text-xs text-muted font-mono">ID: #{item.id.toString().padStart(3, '0')}</span>
                            <button className="btn-icon rounded-full hover:bg-primary/10 transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Placeholder */}
                <div className="card border-dashed border-2 border-border/30 flex flex-col items-center justify-center p-8 text-muted hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="p-4 rounded-full bg-surface-2 group-hover:scale-110 transition-transform mb-4">
                        <Layers size={24} />
                    </div>
                    <span className="text-sm font-medium">Add New Item</span>
                </div>
            </div>

            <div className="fixed bottom-8 right-8">
                <button className="btn btn-primary rounded-full shadow-lg px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform">
                    <PlayCircle size={20} />
                    <span className="font-medium">{t('modules.backlog.start_sprint')}</span>
                </button>
            </div>
        </div>
    );
}
