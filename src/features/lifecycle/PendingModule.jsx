import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, AlertCircle, Check, X, ArrowRight, Leaf, Droplets, Sun } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'flowstudio_pending_projects';

// Assessment Questions
const QUESTIONS = [
    { id: 'q1', text: '是否能够清晰表达自己究竟想要什么？' },
    { id: 'q2', text: '开发出来后，你自己会经常使用它吗？' },
    { id: 'q3', text: '这个软件能长期改变你的生活吗？' },
    { id: 'q4', text: '这个项目是否能真正帮助到大家？' },
];

const PendingModule = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // Load projects
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setProjects(JSON.parse(saved));
        else {
            // Mock data for initial view
            setProjects([
                {
                    id: '1',
                    title: 'Flow Studio Next',
                    desc: 'Modernizing personal project management workflow',
                    status: 'sapling',
                    score: 0,
                    answers: {}
                }
            ]);
        }
    }, []);

    // Save projects
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }, [projects]);

    const handleAnswer = (projectId, questionId, value) => {
        const updatedProjects = projects.map(p => {
            if (p.id !== projectId) return p;
            const newAnswers = { ...p.answers, [questionId]: value };

            // Calculate Score
            const yesCount = Object.values(newAnswers).filter(v => v === true).length;
            return { ...p, answers: newAnswers, score: yesCount };
        });
        setProjects(updatedProjects);

        // Update selected project view in real-time
        if (selectedProject && selectedProject.id === projectId) {
            setSelectedProject(updatedProjects.find(p => p.id === projectId));
        }
    };

    const getSaplingStage = (score) => {
        if (score === 0) return { scale: 0.5, color: 'text-gray-400', label: 'Seed' };
        if (score <= 2) return { scale: 0.8, color: 'text-yellow-500', label: 'Sprout' };
        if (score <= 3) return { scale: 1.0, color: 'text-green-400', label: 'Sapling' };
        return { scale: 1.2, color: 'text-emerald-600', label: 'Tree' };
    };

    return (
        <div className="max-w-6xl mx-auto pt-10 px-6 h-full flex gap-8">

            {/* List View (Left Stream) */}
            <div className={`flex-1 transition-all duration-500 ${selectedProject ? 'w-1/3' : 'w-full'}`}>
                <div className="mb-8">
                    <h2 className="text-2xl font-light text-gray-900 mb-2">Pending Projects</h2>
                    <p className="text-gray-400 text-sm font-light">
                        Each idea is a seed. Water it with honesty.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {projects.map(project => (
                        <motion.div
                            layoutId={`card-${project.id}`}
                            key={project.id}
                            onDoubleClick={() => setSelectedProject(project)}
                            className={`
                group cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-6 hover:shadow-lg transition-all duration-300
                ${selectedProject?.id === project.id ? 'ring-2 ring-gray-900 shadow-xl' : ''}
              `}
                        >
                            <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors
                ${getSaplingStage(project.score).color}
              `}>
                                <Sprout size={32} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                                <p className="text-gray-500 text-sm font-light mt-1">{project.desc}</p>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 hover:border-gray-300 hover:text-gray-500 transition-all font-light"
                        onClick={() => {
                            const newP = { id: uuidv4(), title: 'New Concept', desc: 'Double click to edit details...', status: 'sapling', score: 0, answers: {} };
                            setProjects([...projects, newP]);
                        }}
                    >
                        + New Seed
                    </button>
                </div>
            </div>

            {/* Detail View (Right Panel - The "Visualizer") */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-2/3 bg-white h-fit min-h-[600px] rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden"
                    >
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors z-10"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        {/* Sapling Visualization */}
                        <div className="flex flex-col items-center justify-center py-10 border-b border-gray-50 relative">
                            <motion.div
                                animate={{ scale: getSaplingStage(selectedProject.score).scale }}
                                className={`mb-4 transition-colors duration-500 ${getSaplingStage(selectedProject.score).color}`}
                            >
                                <Sprout size={80} strokeWidth={1} />
                            </motion.div>
                            <h1 className="text-3xl font-light text-gray-900">{selectedProject.title}</h1>
                            <p className="text-gray-400 mt-2 font-light">Viability Score: {selectedProject.score} / 4</p>

                            {/* Status Indicator */}
                            <div className="flex gap-4 mt-6">
                                <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${selectedProject.score > 2 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <Sun size={12} />
                                    <span>Sunlight</span>
                                </div>
                                <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${selectedProject.score > 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <Droplets size={12} />
                                    <span>Water</span>
                                </div>
                            </div>
                        </div>

                        {/* Assessment Flow (Vertical Scroll) */}
                        <div className="mt-8 space-y-6">
                            <h3 className="text-sm uppercase tracking-widest text-gray-400 font-medium mb-6">Survival Assessment</h3>

                            {QUESTIONS.map((q, index) => {
                                const answer = selectedProject.answers[q.id];
                                return (
                                    <div key={q.id} className="group">
                                        <div className={`
                      p-6 rounded-2xl border transition-all duration-300
                      ${answer === true ? 'bg-green-50/50 border-green-100' : ''}
                      ${answer === false ? 'bg-red-50/50 border-red-100' : ''}
                      ${answer === undefined ? 'bg-gray-50 border-transparent' : ''}
                    `}>
                                            <p className="text-lg text-gray-800 font-light mb-4">{q.text}</p>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleAnswer(selectedProject.id, q.id, true)}
                                                    className={`
                            flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all
                            ${answer === true ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 hover:bg-green-50 hover:text-green-500'}
                          `}
                                                >
                                                    <Check size={18} />
                                                    <span>YES</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAnswer(selectedProject.id, q.id, false)}
                                                    className={`
                            flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all
                            ${answer === false ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'}
                          `}
                                                >
                                                    <X size={18} />
                                                    <span>NO</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Bar */}
                        {selectedProject.score === 4 && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="sticky bottom-0 mt-8 pt-4 bg-gradient-to-t from-white via-white to-transparent"
                            >
                                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-xl">
                                    <span>Move to Primary Dev</span>
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PendingModule;
