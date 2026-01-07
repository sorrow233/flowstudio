import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../../utils/constants';

// Refined Soul-Searching Questions
const QUESTIONS = [
    {
        id: 'clarity',
        text: '你能否清晰地表达自己究竟想要通过它达成什么？',
        sub: 'Clarity of Purpose'
    },
    {
        id: 'self_use',
        text: '开发完成后，你自己会频繁地使用它吗？',
        sub: 'Self-Necessity'
    },
    {
        id: 'impact',
        text: '它能在未来长久地改变你的生活方式吗？',
        sub: 'Long-term Impact'
    },
    {
        id: 'value',
        text: '你是否坚信这个项目能为他人带来价值？',
        sub: 'External Value'
    },
];

const PendingModule = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // Load projects
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PENDING);
        if (saved) setProjects(JSON.parse(saved));
    }, []);

    // Save projects
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(projects));
    }, [projects]);

    const handleUpdateProject = (id, field, value) => {
        const updatedProjects = projects.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setProjects(updatedProjects);
        if (selectedProject?.id === id) {
            setSelectedProject({ ...selectedProject, [field]: value });
        }
    };

    const handleAnswer = (projectId, questionId, value) => {
        const updatedProjects = projects.map(p => {
            if (p.id !== projectId) return p;
            const newAnswers = { ...p.answers, [questionId]: value };

            // Calculate Score
            const yesCount = Object.values(newAnswers).filter(v => v === true).length;
            return { ...p, answers: newAnswers, score: yesCount };
        });
        setProjects(updatedProjects);

        if (selectedProject?.id === projectId) {
            setSelectedProject(updatedProjects.find(p => p.id === projectId));
        }
    };

    const handleGraduate = (project) => {
        // 1. Remove from Pending
        const remaining = projects.filter(p => p.id !== project.id);
        setProjects(remaining);
        setSelectedProject(null);

        // 2. Add to Primary Dev
        const primaryProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRIMARY) || '[]');
        const newPrimary = {
            ...project,
            graduatedAt: Date.now(),
            subStage: 1, // Default to Stage 1
            progress: 0,
            tasks: []
        };
        localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify([newPrimary, ...primaryProjects]));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        const remaining = projects.filter(p => p.id !== id);
        setProjects(remaining);
        if (selectedProject?.id === id) setSelectedProject(null);
    }

    const getSaplingState = (score) => {
        if (score === 0) return { scale: 0.8, opacity: 0.3, color: 'text-gray-300' }; // Seed
        if (score <= 2) return { scale: 0.9, opacity: 0.7, color: 'text-yellow-500' }; // Sprout
        if (score < 4) return { scale: 1.0, opacity: 0.9, color: 'text-lime-500' }; // Sapling
        return { scale: 1.1, opacity: 1, color: 'text-emerald-600' }; // Tree
    };

    return (
        <div className="max-w-7xl mx-auto pt-8 px-6 h-full flex gap-10">

            {/* Stream (Left) */}
            <div className={`transition-all duration-500 flex flex-col ${selectedProject ? 'w-[350px] opacity-40 hover:opacity-100' : 'w-full'}`}>
                <div className="mb-8">
                    <h2 className="text-2xl font-light tracking-wide text-gray-900">Pending Stream</h2>
                    <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">Assessment Queue</p>
                </div>

                <div className="space-y-4 overflow-y-auto pb-20 no-scrollbar">
                    {projects.map(project => (
                        <motion.div
                            layoutId={project.id}
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`
                group cursor-pointer bg-white border rounded-xl p-5 relative transition-all duration-300
                ${selectedProject?.id === project.id ? 'border-gray-900 shadow-md ring-1 ring-gray-900' : 'border-gray-100 hover:border-gray-300'}
              `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Sprout size={18} className={project.score === 4 ? 'text-emerald-500' : ''} />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">{project.title}</h3>
                            <p className="text-gray-400 text-xs font-light line-clamp-2">{project.desc}</p>

                            <div className="mt-4 flex gap-1 h-1">
                                {QUESTIONS.map((q, i) => (
                                    <div key={i} className={`flex-1 rounded-full ${project.answers[q.id] ? 'bg-emerald-500' : project.answers[q.id] === false ? 'bg-red-200' : 'bg-gray-100'}`} />
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {/* Add Project Input */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                        <div className="relative bg-white border border-dashed border-gray-300 rounded-xl p-2 flex items-center gap-3 hover:border-gray-400 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <Plus size={20} strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                placeholder="Plant a new seed..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 font-light h-full"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        const newP = {
                                            id: uuidv4(),
                                            title: e.target.value.trim(),
                                            desc: 'A new beginning...',
                                            score: 0,
                                            answers: {}
                                        };
                                        setProjects([newP, ...projects]);
                                        setSelectedProject(newP);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessment (Right) */}
            <AnimatePresence mode="wait">
                {selectedProject && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex-1 bg-white border border-gray-100 rounded-3xl p-10 shadow-sm overflow-y-auto no-scrollbar relative"
                    >
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        {/* Header / Visualization */}
                        <div className="flex flex-col items-center mb-10 w-full transition-all duration-500">
                            <motion.div
                                animate={getSaplingState(selectedProject.score)}
                                className="mb-8 relative"
                            >
                                <Sprout size={100} strokeWidth={1} />
                                {selectedProject.score === 4 && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 text-yellow-500"
                                    >
                                        <Sun size={32} fill="currentColor" className="animate-spin-slow" />
                                    </motion.div>
                                )}
                            </motion.div>

                            <div className="w-full max-w-md space-y-4">
                                <input
                                    value={selectedProject.title}
                                    onChange={(e) => handleUpdateProject(selectedProject.id, 'title', e.target.value)}
                                    className="text-4xl font-thin text-gray-900 text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-900 focus:outline-none transition-all w-full pb-2"
                                    placeholder="Project Title"
                                />

                                <textarea
                                    value={selectedProject.desc}
                                    onChange={(e) => handleUpdateProject(selectedProject.id, 'desc', e.target.value)}
                                    rows={2}
                                    className="w-full text-sm font-light text-center text-gray-600 bg-transparent resize-none focus:outline-none border border-transparent hover:border-gray-100 focus:border-gray-200 rounded-lg p-2 transition-all placeholder:text-gray-300"
                                    placeholder="What is the core concept?"
                                />

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    <div className="relative group">
                                        <input
                                            placeholder="Website Link (Optional)"
                                            value={selectedProject.link || ''}
                                            onChange={(e) => handleUpdateProject(selectedProject.id, 'link', e.target.value)}
                                            className="w-full text-xs font-mono text-center bg-gray-50/50 hover:bg-gray-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all text-gray-400 focus:text-gray-900 placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            placeholder="Background Image URL (Optional)"
                                            value={selectedProject.bgImage || ''}
                                            onChange={(e) => handleUpdateProject(selectedProject.id, 'bgImage', e.target.value)}
                                            className="w-full text-xs font-mono text-center bg-white border border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-gray-900 transition-all text-gray-400 focus:text-gray-900 placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-8 mt-8 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300">
                                <div className={`flex items-center gap-2 transition-colors duration-500 ${selectedProject.score >= 2 ? 'text-blue-500' : ''}`}>
                                    <div className={`p-1.5 rounded-full ${selectedProject.score >= 2 ? 'bg-blue-50 text-blue-500' : 'bg-gray-50'}`}>
                                        <Droplets size={14} />
                                    </div>
                                    Hydration
                                </div>
                                <div className={`flex items-center gap-2 transition-colors duration-500 ${selectedProject.score >= 4 ? 'text-yellow-500' : ''}`}>
                                    <div className={`p-1.5 rounded-full ${selectedProject.score >= 4 ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50'}`}>
                                        <Sun size={14} />
                                    </div>
                                    Photosynthesis
                                </div>
                            </div>
                        </div>

                        {/* Questions Flow */}
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {QUESTIONS.map((q, i) => {
                                const ans = selectedProject.answers[q.id];
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={q.id}
                                        className={`
                      relative p-6 rounded-2xl border transition-all duration-500
                      ${ans === true ? 'bg-emerald-50/30 border-emerald-100' : ''}
                      ${ans === false ? 'bg-red-50/30 border-red-100' : ''}
                      ${ans === undefined ? 'bg-white border-gray-100' : ''}
                    `}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-1">{q.sub}</h4>
                                                <p className="text-lg text-gray-800 font-light">{q.text}</p>
                                            </div>
                                            {ans === true && <CheckCircle2 className="text-emerald-500" size={24} />}
                                            {ans === false && <X className="text-red-400" size={24} />}
                                        </div>

                                        <div className="flex gap-4 opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleAnswer(selectedProject.id, q.id, true)}
                                                className={`
                          flex-1 py-3 border rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-100
                          ${ans === true ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-200 hover:text-emerald-600 bg-transparent'}
                        `}
                                            >
                                                YES
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(selectedProject.id, q.id, false)}
                                                className={`
                          flex-1 py-3 border rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-100
                          ${ans === false ? 'bg-red-400 border-red-400 text-white shadow-lg shadow-red-200' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 bg-transparent'}
                        `}
                                            >
                                                NO
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Graduation */}
                        <div className="max-w-2xl mx-auto mt-12 pb-10">
                            {selectedProject.score === 4 ? (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleGraduate(selectedProject)}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <span className="text-lg font-light tracking-wide">Graduate to Primary Dev</span>
                                    <ArrowRight size={20} />
                                </motion.button>
                            ) : (
                                <div className="text-center text-gray-300 font-light text-sm italic">
                                    Complete self-assessment to proceed
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {!selectedProject && projects.length > 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-200">
                    <Sprout size={64} strokeWidth={0.5} />
                    <p className="mt-4 font-light">Select a seed to assess</p>
                </div>
            )}
        </div>
    );
};

export default PendingModule;
