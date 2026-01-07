import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, GitBranch, Layers, PlayCircle, Plus, CheckSquare,
    Square, Trash2, ExternalLink, X, ChevronRight, CheckCircle2,
    MonitorPlay, Bug, Sparkles, Flag, ArrowUpRight, Terminal, Command
} from 'lucide-react';
import { STORAGE_KEYS, DEV_STAGES } from '../../utils/constants';

const STAGE_ICONS = {
    1: Layers,
    2: MonitorPlay,
    3: Bug,
    4: Sparkles,
    5: Flag
};

const PrimaryDevModule = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTaskInput, setNewTaskInput] = useState('');

    // Command Modal State
    const [commandModalOpen, setCommandModalOpen] = useState(false);
    const [commands, setCommands] = useState([]);
    const [copiedTaskId, setCopiedTaskId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY);
        if (saved) {
            const parsed = JSON.parse(saved);
            const migrated = parsed.map(p => ({ ...p, subStage: p.subStage || 1 }));
            setProjects(migrated);
        }
    }, []);

    // Load commands when modal opens
    useEffect(() => {
        if (commandModalOpen) {
            const savedCmds = localStorage.getItem(STORAGE_KEYS.COMMANDS);
            if (savedCmds) setCommands(JSON.parse(savedCmds));
        }
    }, [commandModalOpen]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify(projects));
    }, [projects]);

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete project?')) {
            setProjects(projects.filter(p => p.id !== id));
            if (selectedProject?.id === id) setSelectedProject(null);
        }
    };

    const handleUpdateProject = (id, updates) => {
        const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
        setProjects(updated);
        if (selectedProject?.id === id) {
            setSelectedProject(prev => ({ ...prev, ...updates }));
        }
    };

    const handleAddTask = (projectId) => {
        if (!newTaskInput.trim()) return;

        const project = projects.find(p => p.id === projectId);
        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: newTaskInput,
            done: false,
            // optional: command linkage
        }];
        handleUpdateProject(projectId, { tasks: newTasks });
        setNewTaskInput('');
    };

    const handleLinkCommand = (command) => {
        const project = projects.find(p => p.id === selectedProject.id);
        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: command.title, // Use command title as task text
            done: false,
            isCommand: true,
            commandContent: command.content,
            commandId: command.id
        }];
        handleUpdateProject(selectedProject.id, { tasks: newTasks });
        setCommandModalOpen(false);
    };

    const toggleTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        const task = project.tasks.find(t => t.id === taskId);

        // If it's a command task, copy and don't toggle immediately (or maybe toggle too?)
        // Let's copy first.
        if (task.isCommand) {
            navigator.clipboard.writeText(task.commandContent);
            setCopiedTaskId(taskId);
            setTimeout(() => setCopiedTaskId(null), 2000);
            return; // Don't toggle completion on copy? Or maybe we should?
            // User said: "clicking... will copy... to my mouse"
            // User didn't say it marks done. Let's keep separate.
            // Maybe a separate checkbox for done?
        }

        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const markTaskDone = (e, projectId, taskId) => {
        e.stopPropagation();
        const project = projects.find(p => p.id === projectId);
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">Active Projects</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">
                        Primary Development Phase
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-thin text-gray-900">{projects.length}</span>
                    <span className="text-gray-400 text-xs uppercase tracking-widest ml-2">Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        layoutId={`card-${project.id}`}
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all cursor-pointer relative h-[320px] flex flex-col"
                    >
                        {/* Background Image / Gradient */}
                        <div className="absolute inset-0 z-0">
                            {project.bgImage ? (
                                <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity grayscale hover:grayscale-0" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent" />
                        </div>

                        <div className="p-8 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
                                    <Code2 size={24} strokeWidth={1.5} />
                                </div>
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur rounded-full">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>

                            <h3 className="text-2xl font-light text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em]">{project.desc || 'No description provided.'}</p>

                            <div className="mt-auto">
                                {/* Stage Visualization */}
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(step => (
                                        <div
                                            key={step}
                                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-emerald-500' : 'bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                    <span>Stage {project.subStage || 1}</span>
                                    <span className="text-gray-900">{DEV_STAGES[(project.subStage || 1) - 1].label}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-300 min-h-[400px]">
                        <Layers size={64} className="mb-6 opacity-20" strokeWidth={1} />
                        <span className="text-lg font-light text-gray-900 mb-2">No active projects</span>
                        <span className="text-sm text-gray-400">Graduate a sapling from 'Pending' to start primary development.</span>
                    </div>
                )}
            </div>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-md pointer-events-auto"
                            onClick={() => setSelectedProject(null)}
                        />
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative pointer-events-auto h-[85vh] flex flex-col ring-1 ring-gray-100"
                        >
                            {/* Rich Hero Header */}
                            <div className="relative shrink-0 h-64 bg-gray-50 flex items-end p-10 overflow-hidden">
                                {selectedProject.bgImage ? (
                                    <motion.div className="absolute inset-0 z-0">
                                        <img src={selectedProject.bgImage} alt="" className="w-full h-full object-cover opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                                )}

                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-20"
                                >
                                    <X size={20} />
                                </button>

                                <div className="relative z-10 w-full flex justify-between items-end text-white">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2 opacity-80">
                                            <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-mono backdrop-blur-sm">
                                                v4.2.1
                                            </span>
                                            {selectedProject.link && (
                                                <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:text-emerald-400 transition-colors">
                                                    <ExternalLink size={12} /> {selectedProject.link.replace('https://', '')}
                                                </a>
                                            )}
                                        </div>
                                        <h2 className="text-5xl font-thin tracking-tight mb-2">{selectedProject.title}</h2>
                                        <p className="text-lg font-light opacity-80 max-w-2xl text-shadow-sm">{selectedProject.desc}</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, selectedProject.id)}
                                        className="text-white/30 hover:text-red-400 transition-colors p-3"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Left: Stage Controller */}
                                <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto shrink-0">
                                    <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-6">Development Lifecycle</h3>

                                    <div className="space-y-4 relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 z-0" />

                                        {DEV_STAGES.map((stage) => {
                                            const isActive = (selectedProject.subStage || 1) === stage.id;
                                            const isDone = (selectedProject.subStage || 1) > stage.id;
                                            const Icon = STAGE_ICONS[stage.id];

                                            return (
                                                <div
                                                    key={stage.id}
                                                    onClick={() => handleUpdateProject(selectedProject.id, { subStage: stage.id })}
                                                    className={`
                                                        relative z-10 flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300
                                                        ${isActive ? 'bg-white shadow-lg shadow-gray-200/50 scale-105 ring-1 ring-black/5' : 'hover:bg-white/50'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border-4 border-gray-50
                                                        ${isActive ? 'bg-gray-900 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}
                                                    `}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-medium mb-0.5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {stage.label}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 leading-tight pr-2">
                                                            {stage.title}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right: Tasks & Details */}
                                <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
                                    {/* Active Stage Info */}
                                    <div className="mb-10">
                                        <div className="flex items-center gap-3 mb-2 text-emerald-600">
                                            <Sparkles size={18} />
                                            <span className="text-xs font-bold tracking-widest uppercase">Current Focus</span>
                                        </div>
                                        <h3 className="text-2xl font-light text-gray-900 mb-2">
                                            {DEV_STAGES[(selectedProject.subStage || 1) - 1].title}
                                        </h3>
                                        <p className="text-gray-500 font-light leading-relaxed max-w-2xl">
                                            {DEV_STAGES[(selectedProject.subStage || 1) - 1].desc}
                                        </p>
                                    </div>

                                    {/* Task List */}
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <CheckSquare size={16} /> Mission Log
                                            </h4>

                                            {/* Import Command Button */}
                                            <button
                                                onClick={() => setCommandModalOpen(true)}
                                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                            >
                                                <Terminal size={12} />
                                                <span>Import Command</span>
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 mb-4 -mx-2 px-2">
                                            {selectedProject.tasks?.map(task => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={task.id}
                                                    onClick={() => toggleTask(selectedProject.id, task.id)}
                                                    className={`
                                                        group flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border border-transparent
                                                        ${task.isCommand ? 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200' : 'hover:bg-gray-50 hover:border-gray-100'}
                                                    `}
                                                >
                                                    <button
                                                        onClick={(e) => markTaskDone(e, selectedProject.id, task.id)}
                                                        className={`
                                                            w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0
                                                            ${task.done
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : task.isCommand ? 'border-gray-600 text-transparent hover:border-gray-400' : 'border-gray-300 text-transparent group-hover:border-gray-400'}
                                                        `}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                    </button>

                                                    <span className={`flex-1 text-sm font-medium transition-colors ${task.done ? 'opacity-50 line-through' : ''}`}>
                                                        {task.text}
                                                    </span>

                                                    {task.isCommand && (
                                                        <div className="flex items-center gap-2">
                                                            {copiedTaskId === task.id ? (
                                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">COPIED</span>
                                                            ) : (
                                                                <Terminal size={14} className="opacity-50" />
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                            {(!selectedProject.tasks || selectedProject.tasks.length === 0) && (
                                                <div className="text-gray-400 text-sm font-light italic py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                                                    No active missions for this stage.
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Task Input */}
                                        <div className="mt-auto relative group">
                                            <input
                                                type="text"
                                                value={newTaskInput}
                                                onChange={(e) => setNewTaskInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(selectedProject.id)}
                                                placeholder="Add a new mission..."
                                                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 transition-all outline-none focus:ring-2 focus:ring-gray-900/5 placeholder:text-gray-400"
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Plus size={20} />
                                            </div>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <button
                                                    onClick={() => handleAddTask(selectedProject.id)}
                                                    className="p-1.5 bg-white shadow-sm rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                                >
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Command Selector Modal */}
            <AnimatePresence>
                {commandModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setCommandModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[75vh] ring-1 ring-white/50"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white/50">
                                <div>
                                    <h3 className="text-xl font-light text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-gray-900 text-white rounded-lg shadow-lg shadow-gray-200">
                                            <Terminal size={18} />
                                        </div>
                                        Import Command
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-2 ml-1">
                                        Inject pre-configured AI prompts into your workflow
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCommandModalOpen(false)}
                                    className="p-2 hover:bg-gray-100/50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto bg-gray-50/30 custom-scrollbar flex-1">
                                {commands.filter(c => c.stageId === (selectedProject?.subStage || 1)).length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {commands
                                            .filter(c => c.stageId === (selectedProject?.subStage || 1))
                                            .map(cmd => (
                                                <motion.div
                                                    key={cmd.id}
                                                    layout
                                                    whileHover={{ scale: 1.01, y: -2 }}
                                                    onClick={() => handleLinkCommand(cmd)}
                                                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
                                                >
                                                    <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:from-emerald-50 transition-colors" />

                                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <Command size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                                            <span className="font-medium text-gray-900 text-lg">{cmd.title}</span>
                                                        </div>
                                                        <div className="p-1.5 bg-gray-50 group-hover:bg-emerald-500 group-hover:text-white rounded-lg transition-colors">
                                                            <Plus size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="pl-7">
                                                        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-500 leading-relaxed line-clamp-2 border border-transparent group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-all">
                                                            {cmd.content}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                                            <Terminal size={24} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 font-medium">No commands found</p>
                                        <p className="text-sm text-gray-400 mt-1 max-w-xs">
                                            There are no commands configured for the <span className="font-mono text-emerald-600 bg-emerald-50 px-1 rounded">Stage {selectedProject?.subStage || 1}</span> phase.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrimaryDevModule;
