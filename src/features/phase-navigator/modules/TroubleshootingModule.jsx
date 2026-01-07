import React from 'react';
import { LifeBuoy, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TroubleshootingModule({ commands = [], onCopy }) {
    const { t } = useTranslation();
    const [justCopied, setJustCopied] = React.useState(null);

    const handleCopy = (content, id) => {
        onCopy(content, id);
        setJustCopied(id);
        setTimeout(() => setJustCopied(null), 2000);
    };

    return (
        <div className="phase-module trouble-module">
            <div className="module-header">
                <div className="module-title-group">
                    <div className="icon-badge trouble">
                        <LifeBuoy size={18} />
                    </div>
                    <div>
                        <h4>{t('phase.trouble.title') || "Troubleshooting"}</h4>
                        <span className="module-subtitle">{t('phase.trouble.subtitle') || "Emergency Kit"}</span>
                    </div>
                </div>
                <span className="count-badge">{commands.length}</span>
            </div>

            <div className="module-content">
                {commands.length === 0 ? (
                    <div className="empty-state">
                        <p>No troubleshooting tips.</p>
                    </div>
                ) : (
                    commands.map(cmd => (
                        <div key={cmd.id} className="task-card mini" onClick={() => handleCopy(cmd.content, cmd.id)}>
                            <div className="task-header">
                                <span className="task-name">{cmd.title}</span>
                                {justCopied === cmd.id ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-tertiary" />}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
