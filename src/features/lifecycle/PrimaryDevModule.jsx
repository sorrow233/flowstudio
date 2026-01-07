import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, GitBranch, Layers, PlayCircle, Plus, CheckSquare,
    Square, Trash2, ExternalLink, X, ChevronRight, CheckCircle2,
    MonitorPlay, Bug, Sparkles, Flag
} from 'lucide-react';
import { STORAGE_KEYS } from '../../utils/constants';

const DEV_STAGES = [
    {
        id: 1,
        label: 'Skeleton',
        title: 'Core Skeleton Implementation',
        desc: 'Build the fundamental structure, routing, and component architecture.',
        icon: Layers
    },
    {
        id: 2,
        label: 'Functionality',
        title: 'Core Functions Running',
        desc: 'Implement main features and ensure critical paths are working.',
        icon: MonitorPlay
    },
    {
        id: 3,
        label: 'Stability',
        title: 'No Major Bugs',
        desc: 'Rigorous testing of core flows. Zero critical issues allowed.',
        icon: Bug
    },
    {
        id: 4,
        label: 'Optimization',
        title: 'Optimization & Polish',
        desc: 'Refine UI/UX, improve performance, and clean up code.',
        icon: Sparkles
    },
    {
        id: 5,
        label: 'Completion',
        title: 'Original Intent Met',
        desc: 'Project fulfills its original vision and is ready for next steps.',
        icon: Flag
    }
];

const PrimaryDevModule = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration for existing data: ensure subStage exists
            const migrated = parsed.map(p => ({ ...p, subStage: p.subStage || 1 }));
            setProjects(migrated);
        }
    }, []);

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
        if (selectedProject?.id === id) setSelectedProject({ ...selectedProject, ...updates });
    };

    const handleAddTask = (projectId) => {
        const task = prompt('New Micro-task:');
        if (!task) return;

        const project = projects.find(p => p.id === projectId);
        const newTasks = [...(project.tasks || []), { id: Date.now(), text: task, done: false }];
        handleUpdateProject(projectId, { tasks: newTasks });
    };

    const toggleTask = (projectId, taskId) => {
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
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all cursor-pointer relative"
                    >
                        {/* Background Image Overlay */}
                        {project.bgImage && (
                            <div className="absolute inset-0 z-0">
                                <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity grayscale hover:grayscale-0" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                            </div>
                        )}

                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200">
                                    <Code2 size={24} strokeWidth={1.5} />
                                </div>
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>

                            <h3 className="text-xl font-medium text-gray-900 mb-2">{project.title}</h3>

                            {/* Stage Indicator */}
                            <div className="flex items-center gap-2 mt-4 mb-6">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(step => (
                                        <div
                                            key={step}
                                            className={`h-1 w-6 rounded-full transition-colors ${step <= (project.subStage || 1) ? 'bg-emerald-500' : 'bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-mono text-gray-400 ml-2">Stage {project.subStage || 1}/5</span>
                            </div>

                            {/* Mini Task Preview */}
                            <div className="space-y-1">
                                {project.tasks?.slice(0, 2).map(task => (
                                    <div key={task.id} className="text-xs text-gray-500 truncate flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${task.done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                        <span className={task.done ? 'line-through opacity-50' : ''}>{task.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setSelectedProject(null)}
                        />
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden relative pointer-events-auto max-h-full flex flex-col"
                        >
                            {/* Rich Header */}
                            <div className="relative h-48 bg-gray-50 flex items-end p-8">
                                {selectedProject.bgImage && (
                                    <div className="absolute inset-0">
                                        <img src={selectedProject.bgImage} alt="" className="w-full h-full object-cover opacity-30" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-sm z-10"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>

                                <div className="relative z-10 w-full flex justify-between items-end">
                                    <div>
                                        <h2 className="text-4xl font-light text-gray-900 mb-2">{selectedProject.title}</h2>
                                        {selectedProject.link && (
                                            <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                                                <ExternalLink size={14} />
                                                {selectedProject.link}
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, selectedProject.id)}
                                        className="text-red-300 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                {/* 5-Step Stage Tracker */}
                                <div className="mb-12">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium text-gray-900">Development Phase</h3>
                                        <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                                            Step {selectedProject.subStage || 1} of 5
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2">
                                        {DEV_STAGES.map((stage) => {
                                            const isActive = (selectedProject.subStage || 1) === stage.id;
                                            const isPast = (selectedProject.subStage || 1) > stage.id;
                                            const Icon = stage.icon;

                                            return (
                                                <div
                                                    key={stage.id}
                                                    onClick={() => handleUpdateProject(selectedProject.id, { subStage: stage.id })}
                                                    className={`
                                                        relative p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-1
                                                        ${isActive ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : ''}
                                                        ${isPast ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : ''}
                                                        ${!isActive && !isPast ? 'bg-white text-gray-400 border-gray-100 hover:border-gray-300' : ''}
                                                    `}
                                                >
                                                    <div className="mb-3">
                                                        <Icon size={20} className={isActive ? 'text-emerald-400' : 'currentColor'} />
                                                    </div>
                                                    <div className="text-xs font-mono opacity-60 mb-1">0{stage.id}</div>
                                                    <div className="font-medium text-sm leading-tight mb-2">{stage.label}</div>
                                                    {isActive && (
                                                        <motion.div layoutId="active-indicator" className="w-1 h-1 bg-emerald-400 rounded-full" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Description of Current Stage */}
                                    <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                                        <div className="mt-1 text-emerald-600">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {DEV_STAGES[(selectedProject.subStage || 1) - 1].title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {DEV_STAGES[(selectedProject.subStage || 1) - 1].desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Micro Tasks */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-6">Mission Log</h3>
                                    <div className="space-y-3 mb-6">
                                        {selectedProject.tasks?.map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => toggleTask(selectedProject.id, task.id)}
                                                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                                            >
                                                <div className={`
                                                    w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                                    ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent group-hover:border-gray-400'}
                                                `}>
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <span className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    {task.text}
                                                </span>
                                            </div>
                                        ))}
                                        {(!selectedProject.tasks || selectedProject.tasks.length === 0) && (
                                            <div className="text-gray-400 text-sm italic py-4">No active missions.</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleAddTask(selectedProject.id)}
                                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium px-4 py-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Plus size={16} /> Add Mission
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrimaryDevModule;
