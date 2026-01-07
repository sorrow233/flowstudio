import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, GitBranch, Layers, PlayCircle, Plus, CheckSquare, Square, Trash2 } from 'lucide-react';
import { STORAGE_KEYS, formatDate } from '../../utils/constants';

const PrimaryDevModule = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY);
        if (saved) setProjects(JSON.parse(saved));
    }, []);

    // Save changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify(projects));
    }, [projects]);

    const handleDelete = (id) => {
        if (confirm('Delete project?')) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    const handleAddTask = (projectId) => {
        const task = prompt('New Task:');
        if (!task) return;

        setProjects(projects.map(p => {
            if (p.id !== projectId) return p;
            return { ...p, tasks: [...(p.tasks || []), { id: Date.now(), text: task, done: false }] };
        }));
    };

    const toggleTask = (projectId, taskId) => {
        setProjects(projects.map(p => {
            if (p.id !== projectId) return p;
            const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);

            // Update Progress
            const doneCount = updatedTasks.filter(t => t.done).length;
            const progress = Math.round((doneCount / updatedTasks.length) * 100);

            return { ...p, tasks: updatedTasks, progress: progress || 0 };
        }));
    };

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6">
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
                        layout
                        key={project.id}
                        className={`
                          group bg-white border rounded-3xl p-6 hover:shadow-xl transition-all cursor-default relative overflow-hidden
                          ${project.motivation
                                ? 'border-emerald-100/50 shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                : 'border-gray-100 hover:shadow-gray-100/50'}
                        `}
                    >
                        {project.motivation && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
                        )}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-gray-200">
                                <Code2 size={24} strokeWidth={1.5} />
                            </div>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <h3 className="text-xl font-medium text-gray-900 mb-2">{project.title}</h3>
                        <div className="flex items-center gap-4 text-gray-400 text-xs font-mono mb-6">
                            <span className="flex items-center gap-1">
                                <GitBranch size={12} />
                                master
                            </span>
                            <span className="flex items-center gap-1">
                                <Layers size={12} />
                                v0.1.0
                            </span>
                        </div>

                        {/* Micro Task List */}
                        <div className="mb-6 space-y-2 min-h-[100px]">
                            {project.tasks?.slice(0, 3).map(task => (
                                <div key={task.id}
                                    onClick={() => toggleTask(project.id, task.id)}
                                    className="flex items-center gap-3 text-sm text-gray-600 font-light cursor-pointer hover:text-gray-900 transition-colors"
                                >
                                    {task.done ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} className="text-gray-300" />}
                                    <span className={task.done ? 'line-through text-gray-300' : ''}>{task.text}</span>
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddTask(project.id)}
                                className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 mt-2"
                            >
                                <Plus size={12} /> Add micro-task
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress || 0}%` }}
                                    className="h-full bg-gray-900 rounded-full"
                                />
                            </div>
                            <span className="text-xs text-gray-900 font-mono">{project.progress || 0}%</span>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-300 min-h-[300px] col-span-full">
                        <Layers size={48} className="mb-4 opacity-20" />
                        <span className="text-sm font-light">No projects in development</span>
                        <span className="text-xs text-gray-300 mt-1">Graduate a sapling from 'Pending' to start</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrimaryDevModule;
