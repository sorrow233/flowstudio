import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import { useProject, STAGES } from '@/contexts/ProjectContext';

export default function BacklogPage() {
    const { t } = useTranslation();
    const { items, addItem, moveItemNext } = useProject();

    const inspirationItems = items.filter(item => item.stage === STAGES.INSPIRATION);
    const pendingItems = items.filter(item => item.stage === STAGES.PENDING);

    return (
        <div className="works-page">
            <header className="works-header">
                <h1 className="works-title">{t('nav.backlog')}</h1>
                <div className="works-divider"></div>
            </header>

            {/* Inspiration Pool */}
            <section className="works-section">
                <div className="works-section-header">
                    <Lightbulb size={20} style={{ color: 'var(--color-accent-teal)' }} />
                    <h2 className="works-section-title">{t('modules.backlog.sections.inspiration')}</h2>
                </div>
                <div className="works-grid-Refined">
                    {inspirationItems.map((item) => (
                        <div
                            key={item.id}
                            className="works-card edit-modegroup relative group"
                            style={{ backgroundColor: item.color }}
                        >
                            <div className="works-card-overlay flex flex-col justify-between h-full p-4">
                                <span className="works-card-name text-lg font-medium">{item.name || 'Untitled Idea'}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveItemNext(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 p-2 rounded-full self-end mt-2"
                                    title={t('common.next_stage')}
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div
                        className="works-card works-card-add cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => addItem(STAGES.INSPIRATION)}
                    >
                        <Plus size={32} />
                        <span>{t('common.add_idea')}</span>
                    </div>
                </div>
            </section>

            {/* Pending Development */}
            <section className="works-section">
                <div className="works-section-header">
                    <Rocket size={20} style={{ color: 'var(--color-accent-vermilion)' }} />
                    <h2 className="works-section-title">{t('modules.backlog.sections.pending')}</h2>
                </div>
                <div className="works-grid-Refined">
                    {pendingItems.map((item) => (
                        <div
                            key={item.id}
                            className="works-card group relative"
                            style={{ backgroundColor: item.color }}
                        >
                            <div className="works-card-overlay flex flex-col justify-between h-full p-4">
                                <span className="works-card-name text-lg font-medium">{item.name || 'Untitled Project'}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveItemNext(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 p-2 rounded-full self-end mt-2"
                                    title={t('common.start_project')}
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Pending items usually come from Inspiration, but allowing add for flexibility if needed, or remove to enforce strict flow from top. 
                        User said "sensitive words will enter pending", implying flow. But "add project" might be direct. Keeping it for now.
                    */}
                    <div
                        className="works-card works-card-add cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => addItem(STAGES.PENDING)}
                    >
                        <Plus size={32} />
                        <span>{t('common.add_project')}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
