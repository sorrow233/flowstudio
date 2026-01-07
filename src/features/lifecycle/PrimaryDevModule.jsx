import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, GitBranch, Layers, PlayCircle, Plus, CheckSquare,
    Square, Trash2, ExternalLink, X, ChevronRight, CheckCircle2,
    MonitorPlay, Bug, Sparkles, Flag, ArrowUpRight, Terminal, Command, Check, Rocket, Globe
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
            text: command.title,
            done: false,
            isCommand: true,
            commandContent: command.content,
            commandUrl: command.url,
            commandId: command.id,
            commandType: command.type || 'utility'
        }];
        handleUpdateProject(selectedProject.id, { tasks: newTasks });
        setCommandModalOpen(false);
    };

    const toggleTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        const task = project.tasks.find(t => t.id === taskId);

        if (task.isCommand) {
            // Special handling for Link type
            if (task.commandType === 'link') {
                // If there's content to copy, copy it first
                if (task.commandContent) {
                    navigator.clipboard.writeText(task.commandContent);
                    setCopiedTaskId(taskId);
                    setTimeout(() => setCopiedTaskId(null), 2000);
                }

                // Open URL in new tab
                if (task.commandUrl) {
                    window.open(task.commandUrl, '_blank');
                }
                return;
            }

            navigator.clipboard.writeText(task.commandContent);
            setCopiedTaskId(taskId);
            setTimeout(() => setCopiedTaskId(null), 2000);

            // If it's a utility command, we just copy. No checkbox toggle.
            if (task.commandType !== 'mandatory') {
                return;
            }
            // Fallthrough for Mandatory: Copy AND allow checking separately (handled by markTaskDone)
            return;
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
                        className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all cursor-pointer relative h-[360px] flex flex-col ring-1 ring-transparent hover:ring-gray-100"
                    >
                        {/* Background Image / Gradient */}
                        <div className="absolute inset-0 z-0 h-48">
                            {project.bgImage ? (
                                <div className="w-full h-full relative">
                                    <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                            )}
                        </div>

                        <div className="p-8 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/80 backdrop-blur text-gray-900 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 group-hover:scale-105 transition-transform">
                                    <Code2 size={24} strokeWidth={1.5} />
                                </div>
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur rounded-full hover:bg-white">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-light text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-900 transition-colors">{project.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">{project.desc || 'No description provided.'}</p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100/50">
                                {/* Stage Visualization */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    {[1, 2, 3, 4, 5].map(step => (
                                        <div
                                            key={step}
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Stage {project.subStage || 1}</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">{DEV_STAGES[(project.subStage || 1) - 1].label}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-gray-300 min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 opacity-50 animate-pulse">
                            <Rocket size={40} className="text-gray-400" strokeWidth={1} />
                        </div>
                        <span className="text-xl font-light text-gray-900 mb-2">Ready for Liftoff?</span>
                        <span className="text-sm text-gray-400 max-w-sm text-center leading-relaxed">Your primary command center is waiting. Graduate a project from the 'Pending' phase to begin development.</span>
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
                            className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden relative pointer-events-auto h-[90vh] flex flex-col ring-1 ring-gray-100"
                        >
                            {/* Rich Hero Header with Parallax-like effect */}
                            <div className="relative shrink-0 h-72 bg-gray-900 flex items-end p-10 overflow-hidden group">
                                {selectedProject.bgImage ? (
                                    <motion.div className="absolute inset-0 z-0">
                                        <img src={selectedProject.bgImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                                )}

                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-8 right-8 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md z-20 border border-white/10"
                                >
                                    <X size={20} />
                                </button>

                                <div className="relative z-10 w-full flex justify-between items-end text-white">
                                    <div className="max-w-3xl">
                                        <div className="flex items-center gap-3 mb-4 opacity-80">
                                            <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-mono backdrop-blur-sm">
                                                Active Development
                                            </span>
                                            {selectedProject.link && (
                                                <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs hover:text-emerald-400 transition-colors px-3 py-1 rounded-full hover:bg-white/10">
                                                    <ExternalLink size={12} /> {selectedProject.link.replace('https://', '')}
                                                </a>
                                            )}
                                        </div>
                                        <h2 className="text-6xl font-thin tracking-tighter mb-4 text-shadow-lg">{selectedProject.title}</h2>
                                        <p className="text-xl font-light opacity-80 leading-relaxed text-shadow-sm">{selectedProject.desc}</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, selectedProject.id)}
                                        className="text-white/30 hover:text-red-400 transition-colors p-4 hover:bg-white/5 rounded-2xl"
                                    >
                                        <Trash2 size={24} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
                                {/* Left: Stage Controller */}
                                <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 overflow-y-auto shrink-0 custom-scrollbar">
                                    <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-6 px-2">Development Cycle</h3>

                                    <div className="space-y-3 relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 z-0" />

                                        {DEV_STAGES.map((stage) => {
                                            const isActive = (selectedProject.subStage || 1) === stage.id;
                                            const isDone = (selectedProject.subStage || 1) > stage.id;
                                            const Icon = STAGE_ICONS[stage.id];

                                            return (
                                                <div
                                                    key={stage.id}
                                                    onClick={() => handleUpdateProject(selectedProject.id, { subStage: stage.id })}
                                                    className={`
                                                        relative z-10 flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group
                                                        ${isActive
                                                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-105'
                                                            : 'hover:bg-gray-50 text-gray-500'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                                        ${isActive ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}
                                                    `}>
                                                        {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-medium ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`}>
                                                            {stage.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right: Tasks & Details */}
                                <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col relative custom-scrollbar">
                                    {/* Active Stage Info */}
                                    <div className="mb-12">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <Sparkles size={20} />
                                            </div>
                                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600">Current Phase</span>
                                        </div>
                                        <h3 className="text-3xl font-light text-gray-900 mb-4">
                                            {DEV_STAGES[(selectedProject.subStage || 1) - 1].title}
                                        </h3>
                                        <p className="text-gray-500 font-light leading-relaxed max-w-3xl text-lg">
                                            {DEV_STAGES[(selectedProject.subStage || 1) - 1].desc}
                                        </p>
                                    </div>

                                    {/* Task List */}
                                    <div className="flex-1 flex flex-col min-h-0 pb-24">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <CheckSquare size={16} /> Mission Log
                                            </h4>

                                            {/* Import Command Button */}
                                            <button
                                                onClick={() => setCommandModalOpen(true)}
                                                className="text-xs flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                            >
                                                <Terminal size={14} />
                                                <span>Import Command</span>
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {selectedProject.tasks?.map(task => {
                                                const isMandatory = task.isCommand && task.commandType === 'mandatory';
                                                const isLink = task.isCommand && task.commandType === 'link';
                                                const isUtility = task.isCommand && task.commandType === 'utility';

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        key={task.id}
                                                        onClick={() => toggleTask(selectedProject.id, task.id)}
                                                        className={`
                                                            group flex items-center gap-5 p-5 rounded-2xl transition-all cursor-pointer border
                                                            ${isMandatory && !task.done
                                                                ? 'bg-white border-red-100 shadow-sm shadow-red-100 hover:border-red-200'
                                                                : isMandatory && task.done
                                                                    ? 'bg-emerald-50/30 border-emerald-100 opacity-75 hover:opacity-100'
                                                                    : isLink
                                                                        ? 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                                                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5'
                                                            }
                                                        `}
                                                    >
                                                        {/* Icon based on type */}
                                                        {isUtility || isLink ? (
                                                            <div className={`
                                                                w-6 h-6 flex items-center justify-center transition-colors rounded-lg 
                                                                ${isLink
                                                                    ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                                                                    : 'bg-gray-50 text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50'}
                                                            `}>
                                                                {copiedTaskId === task.id ? <Check size={16} /> : (isLink ? <Globe size={16} /> : <Terminal size={16} />)}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => markTaskDone(e, selectedProject.id, task.id)}
                                                                className={`
                                                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0
                                                                    ${task.done
                                                                        ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                                                        : isMandatory
                                                                            ? 'border-red-200 text-transparent hover:border-red-400 bg-red-50 hover:bg-red-100'
                                                                            : 'border-gray-200 text-transparent group-hover:border-gray-400 hover:bg-gray-50'
                                                                    }
                                                                `}
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </button>
                                                        )}

                                                        <span className={`flex-1 text-base font-medium transition-colors ${task.done ? 'opacity-40 line-through decoration-emerald-500/50' : 'text-gray-700'}`}>
                                                            {task.text}
                                                        </span>

                                                        {task.isCommand && (
                                                            <div className="flex items-center gap-2">
                                                                {copiedTaskId === task.id ? (
                                                                    <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full animate-pulse">Copied</span>
                                                                ) : (
                                                                    isMandatory ? (
                                                                        <span className="text-[10px] font-bold bg-red-50 text-red-500 px-3 py-1 rounded-full uppercase tracking-wider border border-red-100">
                                                                            Mandatory
                                                                        </span>
                                                                    ) : isLink ? (
                                                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100 flex items-center gap-1">
                                                                            <ExternalLink size={8} /> Link
                                                                        </span>
                                                                    ) : null
                                                                )}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                            {(!selectedProject.tasks || selectedProject.tasks.length === 0) && (
                                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                                                        <CheckSquare size={24} />
                                                    </div>
                                                    <p className="text-gray-900 font-medium">Quiet on the Front</p>
                                                    <p className="text-gray-400 text-sm mt-1">No active missions. Add a task or import a command to begin.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Action Bar */}
                                        <div className="absolute bottom-8 left-8 right-8 md:left-12 md:right-12">
                                            <div className="relative group shadow-2xl shadow-gray-200/50 rounded-2xl bg-white">
                                                <input
                                                    type="text"
                                                    value={newTaskInput}
                                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(selectedProject.id)}
                                                    placeholder="Type a new mission..."
                                                    className="w-full bg-white hover:bg-gray-50/50 focus:bg-white border-0 rounded-2xl py-5 pl-14 pr-16 transition-all outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400 text-lg font-light"
                                                    autoFocus
                                                />
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                                                    <Plus size={24} />
                                                </div>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <button
                                                        onClick={() => handleAddTask(selectedProject.id)}
                                                        disabled={!newTaskInput.trim()}
                                                        className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-0 disabled:pointer-events-none shadow-lg shadow-gray-900/20"
                                                    >
                                                        <ArrowUpRight size={20} />
                                                    </button>
                                                </div>
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
                                                    className={`
                                                        p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                                                        ${cmd.type === 'mandatory'
                                                            ? 'bg-white border-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10'
                                                            : cmd.type === 'link'
                                                                ? 'bg-white border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10'
                                                                : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10'
                                                        }
                                                    `}
                                                >
                                                    {cmd.type === 'mandatory' && (
                                                        <div className="absolute top-0 right-0 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                                                            Mandatory
                                                        </div>
                                                    )}
                                                    {cmd.type === 'link' && (
                                                        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                                                            Link
                                                        </div>
                                                    )}
                                                    <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br to-transparent rounded-bl-full -z-0 opacity-50 transition-colors 
                                                        ${cmd.type === 'mandatory' ? 'from-red-50 group-hover:from-red-100' : cmd.type === 'link' ? 'from-blue-50 group-hover:from-blue-100' : 'from-gray-50 group-hover:from-emerald-50'}`}
                                                    />

                                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`transition-colors ${cmd.type === 'mandatory' ? 'text-red-300 group-hover:text-red-500' : cmd.type === 'link' ? 'text-blue-300 group-hover:text-blue-500' : 'text-gray-300 group-hover:text-emerald-500'}`}>
                                                                {cmd.type === 'link' ? <Globe size={16} /> : <Command size={16} />}
                                                            </div>
                                                            <span className="font-medium text-gray-900 text-lg">{cmd.title}</span>
                                                        </div>
                                                        <div className={`p-1.5 rounded-lg transition-colors ${cmd.type === 'mandatory' ? 'bg-red-50 group-hover:bg-red-500 group-hover:text-white' : cmd.type === 'link' ? 'bg-blue-50 group-hover:bg-blue-500 group-hover:text-white' : 'bg-gray-50 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                                                            <Plus size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="pl-7">
                                                        <div className={`rounded-lg p-3 font-mono text-xs text-gray-500 leading-relaxed line-clamp-2 border border-transparent transition-all 
                                                            ${cmd.type === 'mandatory' ? 'bg-red-50/30 group-hover:border-red-100 group-hover:bg-red-50/50' : cmd.type === 'link' ? 'bg-blue-50/30 group-hover:border-blue-100 group-hover:bg-blue-50/50' : 'bg-gray-50 group-hover:border-emerald-100 group-hover:bg-emerald-50/30'}`}>
                                                            {cmd.type === 'link' ? cmd.url : cmd.content}
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
