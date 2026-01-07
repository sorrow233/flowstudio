import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus, TreeDeciduous, TreePine, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../../utils/constants';
import { useSyncStore, useSyncedProjects } from '../sync/useSyncStore';

// Refined Founder-Focused Questions
const QUESTIONS = [
    {
        id: 'clarity',
        text: 'Can you describe the "Aha!" moment in one simple sentence?',
        sub: 'Radical Clarity'
    },
    {
        id: 'obsession',
        text: 'Does this problem keep you awake at night? (Be honest)',
        sub: 'Founder Obsession'
    },
    {
        id: 'market',
        text: 'Is there a starving crowd waiting for this solution?',
        sub: 'Market Pull'
    },
    {
        id: 'moat',
        text: 'Do you have an unfair advantage in building this?',
        sub: 'Defensibility'
    },
];

// Curated Visual Vibes (Background Presets)
const VISUAL_VIBES = [
    { id: 'zen', url: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=2500&auto=format&fit=crop', label: 'Zen Garden' },
    { id: 'neon', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2500&auto=format&fit=crop', label: 'Cyber Future' },
    { id: 'minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2500&auto=format&fit=crop', label: 'Minimalist' },
    { id: 'nature', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2500&auto=format&fit=crop', label: 'Deep Nature' },
    { id: 'code', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2500&auto=format&fit=crop', label: 'Matrix Code' },
];

const PendingModule = () => {
    // Sync Store Integration
    const { doc } = useSyncStore('flowstudio_v1');
    const {
        projects,
        addProject,
        removeProject: deleteProject,
        updateProject
    } = useSyncedProjects(doc, 'pending_projects');

    const {
        projects: primaryProjects
    } = useSyncedProjects(doc, 'primary_projects'); // Read-only view here

    const [selectedProject, setSelectedProject] = useState(null);

    // Sync selectedProject with latest data in case of remote updates
    useEffect(() => {
        if (selectedProject) {
            const current = projects.find(p => p.id === selectedProject.id);
            if (current) {
                setSelectedProject(current);
            } else {
                // Project was deleted remotely
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
        // 1. Remove from Pending (via Yjs)
        deleteProject(project.id);
        setSelectedProject(null);

        // 2. Add to Primary Dev (via Yjs - Transaction ideally)
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
        if (confirm('Are you sure you want to compost this idea?')) {
            deleteProject(id);
        }
    }

    const getSaplingState = (score) => {
        if (score === 0) return { scale: 0.8, opacity: 0.3, color: 'text-gray-300' }; // Seed
        if (score <= 2) return { scale: 0.9, opacity: 0.7, color: 'text-yellow-500' }; // Sprout
        if (score < 4) return { scale: 1.0, opacity: 0.9, color: 'text-lime-500' }; // Sapling
        return { scale: 1.1, opacity: 1, color: 'text-emerald-600' }; // Tree
    };

    // Tree Growth Visualization Helper
    const getTreeVisual = (stage = 1) => {
        const stages = [
            { color: 'text-emerald-300', scale: 0.9, icon: Sprout, label: 'Seedling' },      // 1: Seedling
            { color: 'text-emerald-400', scale: 1.1, icon: Sprout, label: 'Sapling' },       // 2: Sapling
            { color: 'text-emerald-500', scale: 1.0, icon: TreeDeciduous, label: 'Young Tree' }, // 3: Young Tree
            { color: 'text-emerald-600', scale: 1.1, icon: TreeDeciduous, label: 'Mature Tree' }, // 4: Mature Tree
            { color: 'text-emerald-700', scale: 1.2, icon: TreePine, label: 'Ancient' },      // 5: Grand Tree
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

                {/* Main Content Area - Split between Pending and Garden */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-20">

                    {/* 1. Pending List */}
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

                    {/* 2. The Nursery / Garden of Growth */}
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
                                                <motion.div
                                                    className={`relative z-10 ${visual.color}`}
                                                    animate={{ scale: visual.scale }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                >
                                                    <visual.icon size={32} strokeWidth={1.5} />
                                                </motion.div>
                                                {/* Ground shadow */}
                                                <div className="absolute bottom-2 w-8 h-1 bg-emerald-900/10 rounded-full blur-sm" />
                                            </div>

                                            <div className="w-full">
                                                <h4 className="text-xs font-medium text-gray-700 line-clamp-1 w-full mb-2" title={p.title}>{p.title}</h4>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-400 rounded-full"
                                                            style={{ width: `${((p.subStage || 1) / 5) * 100}%` }}
                                                        />
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
                        className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 overflow-y-auto no-scrollbar relative flex flex-col"
                    >
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-8 right-8 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-20"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        {/* Background Visual Vibe */}
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gray-50 overflow-hidden rounded-t-[2.5rem] -z-0">
                            {selectedProject.bgImage ? (
                                <>
                                    <img src={selectedProject.bgImage} className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                            )}
                        </div>


                        {/* Header / Visualization */}
                        <div className="relative z-10 flex flex-col items-center mb-10 w-full transition-all duration-500 mt-10">
                            <motion.div
                                animate={getSaplingState(selectedProject.score)}
                                className="mb-6 relative"
                            >
                                <Sprout size={80} strokeWidth={1} />
                                {selectedProject.score === 4 && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 text-yellow-500"
                                    >
                                        <Sun size={28} fill="currentColor" className="animate-spin-slow" />
                                    </motion.div>
                                )}
                            </motion.div>

                            <div className="w-full max-w-lg text-center">
                                {/* Auto-expanding Title */}
                                <input
                                    value={selectedProject.title}
                                    onChange={(e) => handleUpdateProject(selectedProject.id, 'title', e.target.value)}
                                    className="w-full text-4xl md:text-5xl font-thin text-gray-900 text-center bg-transparent border-none focus:ring-0 placeholder:text-gray-300 mb-2 transition-all p-0"
                                    placeholder="Untitled Project"
                                />

                                {/* Auto-expanding Manifesto */}
                                <textarea
                                    value={selectedProject.desc}
                                    onChange={(e) => {
                                        handleUpdateProject(selectedProject.id, 'desc', e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    className="w-full text-base font-light text-center text-gray-500 bg-transparent resize-none border-none focus:ring-0 placeholder:text-gray-300 min-h-[3em] overflow-hidden leading-relaxed"
                                    placeholder="What is the driving force behind this idea?"
                                />

                                {/* Controls: Link & Visual Vibe */}
                                <div className="flex gap-2 justify-center mt-6">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gray-200 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:border-gray-300 transition-colors">
                                            <Sparkles size={12} className="text-gray-400" />
                                            <input
                                                placeholder="Project Link"
                                                value={selectedProject.link || ''}
                                                onChange={(e) => handleUpdateProject(selectedProject.id, 'link', e.target.value)}
                                                className="w-40 text-xs font-mono bg-transparent border-none p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Visual Vibe Selector */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gray-200 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative group/vibe flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:border-gray-300 transition-colors cursor-pointer overflow-hidden">
                                            <ImageIcon size={12} className="text-gray-400" />
                                            <span className="text-xs font-mono text-gray-600 truncate max-w-[100px]">
                                                {VISUAL_VIBES.find(v => v.url === selectedProject.bgImage)?.label || 'Select Vibe'}
                                            </span>

                                            {/* Dropdown for Vibes */}
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 group-hover/vibe:opacity-100 pointer-events-none group-hover/vibe:pointer-events-auto transition-all z-50">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 pt-1">Visual Theme</div>
                                                {VISUAL_VIBES.map(vibe => (
                                                    <div
                                                        key={vibe.id}
                                                        onClick={() => handleUpdateProject(selectedProject.id, 'bgImage', vibe.url)}
                                                        className={`flex items-center gap-2 p-2 rounded-xl text-xs hover:bg-gray-50 cursor-pointer ${selectedProject.bgImage === vibe.url ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600'}`}
                                                    >
                                                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${vibe.url})` }} />
                                                        {vibe.label}
                                                    </div>
                                                ))}
                                                {/* Custom URL Option */}
                                                <div className="border-t border-gray-100 my-1 mx-2" />
                                                <input
                                                    placeholder="Custom URL..."
                                                    className="w-full text-[10px] p-2 bg-gray-50 rounded-lg border-none focus:ring-1 focus:ring-gray-200"
                                                    onChange={(e) => handleUpdateProject(selectedProject.id, 'bgImage', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Questions Flow */}
                        <div className="space-y-4 max-w-2xl mx-auto w-full">
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
                                        <div className="relative z-10 flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{q.sub}</h4>
                                                <p className="text-lg text-gray-800 font-light">{q.text}</p>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {ans === true && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                {ans === false && <X className="text-red-400" size={20} />}
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex gap-3">
                                            <button
                                                onClick={() => handleAnswer(selectedProject.id, q.id, true)}
                                                className={`
                                                  flex-1 py-3 border rounded-xl text-sm font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.98]
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
                                                  flex-1 py-3 border rounded-xl text-sm font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.98]
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

                        {/* Graduation */}
                        <div className="max-w-2xl mx-auto mt-12 pb-10 w-full">
                            <AnimatePresence>
                                {selectedProject.score === 4 ? (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        onClick={() => handleGraduate(selectedProject)}
                                        className="group w-full py-5 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 hover:-translate-y-1"
                                    >
                                        <span className="text-lg font-light tracking-wide">Graduate to Primary Dev</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex flex-col items-center text-center text-gray-300 gap-2"
                                    >
                                        <div className="w-10 h-1 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full bg-gray-300 transition-all duration-500" style={{ width: `${(selectedProject.score / 4) * 100}%` }} />
                                        </div>
                                        <span className="font-light text-xs uppercase tracking-widest">{selectedProject.score} / 4 Criteria Met</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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

            {!selectedProject && projects.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Plus size={32} strokeWidth={1} className="text-gray-400" />
                    </div>
                    <p className="font-light text-lg text-gray-900">The Garden is Silent.</p>
                    <p className="font-light text-sm mt-2 text-gray-400">Every great product starts as a fragile thought. Plant one.</p>
                </div>
            )}
        </div>
    );
};

export default PendingModule;
