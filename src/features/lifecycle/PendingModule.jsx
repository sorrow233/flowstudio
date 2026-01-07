import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus, TreeDeciduous, TreePine, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../../utils/constants';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';

// 朴素客观的灵魂拷问 (Simple & Objective Questions)
const QUESTIONS = [
    {
        id: 'clarity',
        text: '这个想法解决了什么实际问题？',
        sub: '核心价值' // Core Value
    },
    {
        id: 'obsession',
        text: '为什么值得你花时间去实现它？', // User explicitly asked for this angle
        sub: '行动初衷' // Motivation
    },
    {
        id: 'market',
        text: '谁会真的需要并使用这个东西？',
        sub: '目标用户' // Target User
    },
    {
        id: 'moat',
        text: '你打算如何迈出第一步？',
        sub: '落地计划' // Execution
    },
];

const VISUAL_VIBES = [
    { id: 'zen', url: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=2500&auto=format&fit=crop', label: 'Zen Garden' },
    { id: 'neon', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2500&auto=format&fit=crop', label: 'Cyber Future' },
    { id: 'minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2500&auto=format&fit=crop', label: 'Minimalist' },
    { id: 'nature', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2500&auto=format&fit=crop', label: 'Deep Nature' },
    { id: 'code', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2500&auto=format&fit=crop', label: 'Matrix Code' },
];

const PendingModule = () => {
    const { doc } = useSync();

    // Explicit Version Log
    useEffect(() => {
        console.log("PendingModule v1.6 Loaded (Simple Copy)");
    }, []);

    const {
        projects,
        addProject,
        removeProject: deleteProject,
        updateProject
    } = useSyncedProjects(doc, 'pending_projects');

    const {
        projects: primaryProjects
    } = useSyncedProjects(doc, 'primary_projects');

    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        if (selectedProject) {
            const current = projects.find(p => p.id === selectedProject.id);
            if (current) {
                setSelectedProject(current);
            } else {
                setSelectedProject(null);
            }
        }
    }, [projects]);

    const handleUpdateProject = (id, field, value) => {
        updateProject(id, { [field]: value });
    };

    const handleAnswer = (projectId, questionId, value) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newAnswers = { ...project.answers, [questionId]: value };
        const yesCount = Object.values(newAnswers).filter(v => v === true).length;

        updateProject(projectId, { answers: newAnswers, score: yesCount });
    };

    const handleGraduate = (project) => {
        deleteProject(project.id);
        setSelectedProject(null);

        if (doc) {
            const primaryList = doc.getArray('primary_projects');
            const newPrimary = {
                ...project,
                graduatedAt: Date.now(),
                subStage: 1,
                progress: 0,
                tasks: []
            };
            primaryList.unshift([newPrimary]);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('确定要放弃这颗种子吗？')) {
            deleteProject(id);
        }
    }

    const getSaplingState = (score) => {
        if (score === 0) return { scale: 0.8, opacity: 0.3, color: 'text-gray-300' };
        if (score <= 2) return { scale: 0.9, opacity: 0.7, color: 'text-yellow-500' };
        if (score < 4) return { scale: 1.0, opacity: 0.9, color: 'text-lime-500' };
        return { scale: 1.1, opacity: 1, color: 'text-emerald-600' };
    };

    const getTreeVisual = (stage = 1) => {
        const stages = [
            { color: 'text-emerald-300', scale: 0.9, icon: Sprout, label: 'Seedling' },
            { color: 'text-emerald-400', scale: 1.1, icon: Sprout, label: 'Sapling' },
            { color: 'text-emerald-500', scale: 1.0, icon: TreeDeciduous, label: 'Young Tree' },
            { color: 'text-emerald-600', scale: 1.1, icon: TreeDeciduous, label: 'Mature Tree' },
            { color: 'text-emerald-700', scale: 1.2, icon: TreePine, label: 'Ancient' },
        ];
        return stages[stage - 1] || stages[0];
    };

    return (
        <div className="max-w-7xl mx-auto pt-8 px-6 h-full flex gap-10">
            {/* Stream (Left) */}
            <div className={`transition-all duration-500 flex flex-col ${selectedProject ? 'w-[350px] opacity-100' : 'w-full'}`}>
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-light tracking-wide text-gray-900">Idea Staging</h2>
                    <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">Validate before you build</p>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-20">
                    <div className="space-y-4">
                        {projects.map(project => (
                            <motion.div
                                layoutId={project.id}
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className={`
                                    group cursor-pointer bg-white border rounded-xl p-5 relative transition-all duration-300
                                    ${selectedProject?.id === project.id ? 'border-gray-900 shadow-xl shadow-gray-200 ring-1 ring-gray-900 scale-[1.02]' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${project.score === 4 ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                                        <Sprout size={18} />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, project.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1 line-clamp-1">{project.title}</h3>
                                <p className="text-gray-400 text-xs font-light line-clamp-2">{project.desc}</p>
                            </motion.div>
                        ))}

                        {/* Add Project */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                            <div className="relative bg-white border border-dashed border-gray-300 rounded-xl p-2 flex items-center gap-3 hover:border-gray-400 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Plus size={20} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="播种一个新的想法..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 font-light h-full"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            const newP = {
                                                id: uuidv4(),
                                                title: e.target.value.trim(),
                                                desc: '一句话描述这个创想...',
                                                score: 0,
                                                answers: {}
                                            };
                                            addProject(newP);
                                            setSelectedProject(newP);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nursery */}
                    {primaryProjects.length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <div className="mb-4 flex items-center gap-2">
                                <Sun size={16} className="text-amber-400" />
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest">Nursery</h3>
                                <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">({primaryProjects.length} Growing)</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar snap-x">
                                {primaryProjects.map(p => {
                                    const visual = getTreeVisual(p.subStage || 1);
                                    return (
                                        <motion.div
                                            key={p.id}
                                            layoutId={`nursery-${p.id}`}
                                            className="min-w-[140px] snap-start bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-between text-center hover:shadow-sm transition-all cursor-default h-[160px]"
                                        >
                                            <div className="flex-1 flex items-center justify-center w-full relative">
                                                <motion.div className={`relative z-10 ${visual.color}`} animate={{ scale: visual.scale }}>
                                                    <visual.icon size={32} strokeWidth={1.5} />
                                                </motion.div>
                                                <div className="absolute bottom-2 w-8 h-1 bg-emerald-900/10 rounded-full blur-sm" />
                                            </div>
                                            <div className="w-full">
                                                <h4 className="text-xs font-medium text-gray-700 line-clamp-1 w-full mb-2">{p.title}</h4>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${((p.subStage || 1) / 5) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
                        className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 overflow-y-auto no-scrollbar relative flex flex-col z-10"
                    >
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-8 right-8 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-30"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        {/* Background */}
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gray-50 overflow-hidden rounded-t-[2.5rem] z-0">
                            {selectedProject.bgImage ? (
                                <>
                                    <img src={selectedProject.bgImage} className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col items-center mb-10 w-full mt-10">
                            {/* ... Title/Inputs ... */}
                            <motion.div animate={getSaplingState(selectedProject.score)} className="mb-6 relative">
                                <Sprout size={80} strokeWidth={1} />
                                {selectedProject.score === 4 && <div className="absolute -top-1 -right-1 text-yellow-500"><Sun size={28} fill="currentColor" /></div>}
                            </motion.div>

                            <div className="w-full max-w-lg text-center">
                                <input
                                    value={selectedProject.title}
                                    onChange={(e) => handleUpdateProject(selectedProject.id, 'title', e.target.value)}
                                    className="w-full text-4xl md:text-5xl font-thin text-gray-900 text-center bg-transparent border-none focus:ring-0 placeholder:text-gray-300 mb-2"
                                    placeholder="无名项目"
                                />
                                <textarea
                                    value={selectedProject.desc}
                                    onChange={(e) => {
                                        handleUpdateProject(selectedProject.id, 'desc', e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    className="w-full text-base font-light text-center text-gray-500 bg-transparent resize-none border-none focus:ring-0 min-h-[3em]"
                                    placeholder="这个想法的原动力是什么？"
                                />

                                {/* Link & Vibe */}
                                <div className="flex gap-2 justify-center mt-6">
                                    {/* ... Link Input ... */}
                                    {/* ... Vibe Selector ... */}
                                    <div className="flex items-center gap-2 bg-white border rounded-full px-4 py-1.5 shadow-sm">
                                        <Sparkles size={12} className="text-gray-400" />
                                        <input value={selectedProject.link || ''} onChange={(e) => handleUpdateProject(selectedProject.id, 'link', e.target.value)} placeholder="项目链接" className="w-40 text-xs border-none p-0 focus:ring-0" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QUESTIONS */}
                        <div className="space-y-4 max-w-2xl mx-auto w-full relative z-20">
                            {QUESTIONS.map((q, i) => {
                                const ans = selectedProject.answers[q.id];
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={q.id}
                                        className={`
                                          relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden
                                          ${ans === true ? 'bg-emerald-50/50 border-emerald-100' : ''}
                                          ${ans === false ? 'bg-red-50/50 border-red-100' : ''}
                                          ${ans === undefined ? 'bg-white border-gray-100' : ''}
                                        `}
                                    >
                                        <div className="relative z-30 flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{q.sub}</h4>
                                                <p className="text-lg text-gray-800 font-light">{q.text}</p>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {ans === true && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                {ans === false && <X className="text-red-400" size={20} />}
                                            </div>
                                        </div>

                                        <div className="relative z-30 flex gap-3">
                                            <button
                                                onClick={() => handleAnswer(selectedProject.id, q.id, true)}
                                                className={`
                                                  cursor-pointer flex-1 py-3 border rounded-xl text-sm font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.98]
                                                  ${ans === true
                                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600'}
                                                `}
                                            >
                                                YES
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(selectedProject.id, q.id, false)}
                                                className={`
                                                  cursor-pointer flex-1 py-3 border rounded-xl text-sm font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.98]
                                                  ${ans === false
                                                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                        : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'}
                                                `}
                                            >
                                                NO
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Graduate Button */}
                        <div className="max-w-2xl mx-auto mt-12 pb-10 w-full relative z-30">
                            {selectedProject.score === 4 && (
                                <button onClick={() => handleGraduate(selectedProject)} className="group w-full py-5 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:-translate-y-1">
                                    <span className="text-lg font-light tracking-wide">晋升至 Primary Dev</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1" />
                                </button>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {!selectedProject && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <p>选择一颗种子</p>
                </div>
            )}
        </div>
    );
};

export default PendingModule;
