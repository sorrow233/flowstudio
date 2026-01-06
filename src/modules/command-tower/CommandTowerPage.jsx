import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Copy, Plus, Trash2, Command, ChevronRight } from 'lucide-react';

export default function CommandTowerPage() {
    const { t } = useTranslation();
    const [commands, setCommands] = useState([
        { id: 1, name: 'Deploy Main', command: 'npm run deploy:main', desc: 'Build and deploy to Cloudflare (Main)' },
        { id: 2, name: 'Check Status', command: 'git status', desc: 'Check current git branch status' },
        { id: 3, name: 'Full Scan', command: '/filescan', desc: 'Scan codebase for issues' }
    ]);
    const [newCmd, setNewCmd] = useState({ name: '', command: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newCmd.name || !newCmd.command) return;
        setCommands([...commands, { id: Date.now(), ...newCmd, desc: 'Custom workflow' }]);
        setNewCmd({ name: '', command: '' });
    };

    const handleDelete = (id) => {
        setCommands(commands.filter(c => c.id !== id));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="page-container command-tower-page h-full flex flex-col">
            <div className="page-header center fade-in-up">
                <h1 className="text-h2 font-mono flex items-center justify-center gap-2">
                    <Terminal size={28} />
                    <span>{t('nav.command_tower')}</span>
                </h1>
                <p className="text-small text-muted tracking-wide font-mono">SYSTEM.ROOT.EXECUTE</p>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">

                {/* Left Panel: Command List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {commands.map((cmd) => (
                        <div key={cmd.id} className="group relative bg-black/40 border border-border/20 rounded-lg p-4 hover:border-primary/40 transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-primary font-mono font-bold">
                                    <ChevronRight size={16} />
                                    <span>{cmd.name}</span>
                                </div>
                                <button onClick={() => handleDelete(cmd.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <p className="text-xs text-muted mb-3 pl-6">{cmd.desc}</p>

                            <div
                                className="bg-black/60 rounded p-3 font-mono text-xs text-green-400/90 flex justify-between items-center cursor-pointer hover:bg-black/80 transition-colors"
                                onClick={() => copyToClipboard(cmd.command)}
                            >
                                <code>$ {cmd.command}</code>
                                <Copy size={14} className="opacity-50" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Quick Input */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-surface-2/50 backdrop-blur-md border border-border/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6 text-muted">
                            <Command size={18} />
                            <span className="font-mono text-sm font-bold uppercase">New Directive</span>
                        </div>

                        <form onSubmit={handleAdd} className="flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-muted/60 uppercase">Alias</label>
                                <input
                                    className="w-full bg-black/20 border-b border-border/20 p-2 text-sm focus:border-primary outline-none transition-colors"
                                    placeholder="e.g. Deploy"
                                    value={newCmd.name}
                                    onChange={e => setNewCmd({ ...newCmd, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-mono text-muted/60 uppercase">Instruction</label>
                                <textarea
                                    className="w-full bg-black/20 border border-border/20 rounded p-2 text-sm font-mono focus:border-primary outline-none transition-colors resize-none"
                                    placeholder="npm run..."
                                    rows={3}
                                    value={newCmd.command}
                                    onChange={e => setNewCmd({ ...newCmd, command: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-2 w-full btn bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50 transition-all font-mono text-sm py-2 rounded flex justify-center items-center gap-2"
                                disabled={!newCmd.name || !newCmd.command}
                            >
                                <Plus size={16} />
                                <span>INITIALIZE</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
