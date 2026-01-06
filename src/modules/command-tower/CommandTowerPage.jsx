import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Play, Copy, Plus, Trash2 } from 'lucide-react';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [commands, setCommands] = useState([
        { id: 1, name: 'Deploy to Cloudflare', command: 'npm run deploy' },
        { id: 2, name: 'Analyze Codebase', command: 'claude analyze .' },
        { id: 3, name: 'Generate I18n Keys', command: 'npm run i18n:generate' }
    ]);
    const [newCmd, setNewCmd] = useState({ name: '', command: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newCmd.name || !newCmd.command) return;
        setCommands([...commands, { id: Date.now(), ...newCmd }]);
        setNewCmd({ name: '', command: '' });
    };

    const handleDelete = (id) => {
        setCommands(commands.filter(c => c.id !== id));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast notification would go here
    };

    return (
        <div className="page-container command-tower-page">
            <div className="page-header center">
                <h1 className="text-h2">{t('nav.command_tower')}</h1>
                <p className="text-small">{t('modules.command_tower.subtitle') || "Your central workflow automation hub."}</p>
            </div>

            <div className="grid-stack">
                {/* Add New Command */}
                <div className="card">
                    <div className="card-header highlight">
                        <Plus size={20} />
                        <h3 className="text-h3 font-bold">New Workflow</h3>
                    </div>
                    <form onSubmit={handleAdd} className="incubate-form">
                        <input
                            className="input-field"
                            placeholder="Workflow Name"
                            value={newCmd.name}
                            onChange={e => setNewCmd({ ...newCmd, name: e.target.value })}
                        />
                        <textarea
                            className="input-textarea"
                            placeholder="Command / Instruction"
                            value={newCmd.command}
                            onChange={e => setNewCmd({ ...newCmd, command: e.target.value })}
                            rows={3}
                        />
                        <button type="submit" className="btn btn-primary gap-2" disabled={!newCmd.name || !newCmd.command}>
                            <Plus size={16} />
                            <span>Add Workflow</span>
                        </button>
                    </form>
                </div>

                {/* Command List */}
                {commands.map(cmd => (
                    <div key={cmd.id} className="card command-card">
                        <div className="card-header">
                            <Terminal size={20} className="text-muted" />
                            <h3 className="text-h3">{cmd.name}</h3>
                            <button className="btn-icon danger ml-auto" onClick={() => handleDelete(cmd.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="code-block" onClick={() => copyToClipboard(cmd.command)} title="Click to copy">
                            <code>{cmd.command}</code>
                            <Copy size={14} className="copy-icon" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
