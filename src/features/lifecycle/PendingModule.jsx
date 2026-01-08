import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Droplets, CheckCircle2, Plus, TreeDeciduous, TreePine, Image as ImageIcon, Sparkles, RefreshCw, Feather, Scroll, LayoutGrid, Monitor, Server, Database, Container, Beaker, Terminal, Globe, Smartphone, Cloud, Box, Cpu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, getRandomProjectImage, COMMAND_CATEGORIES } from '../../utils/constants';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useUndoShortcuts } from '../../hooks/useUndoShortcuts';
import UndoRedoButtons from '../../components/shared/UndoRedoButtons';
import Spotlight from '../../components/shared/Spotlight';

// 灵魂四问 (Soul Questions - Final Polish)
const QUESTIONS = [
    {
        id: 'clarity',
        text: '你是否能够清晰地表达自己究竟想要什么？',
        sub: '清晰度'
    },
    {
        id: 'dogfood',
        text: '开发出来之后，你自己也会经常用它吗？',
        sub: '自用需求'
    },
    {
        id: 'impact',
        text: '它能在未来长期改变你的生活吗？',
        sub: '长期价值'
    },
    {
        id: 'value',
        text: '你是否相信这个项目能够真正帮助到大家？',
        sub: '利他之心'
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

    const {
        projects,
        addProject,
        removeProject: deleteProject,
        updateProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useSyncedProjects(doc, 'pending_projects');

    useUndoShortcuts(undo, redo);

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

    const handleGraduate = (project, category = 'general') => {
        deleteProject(project.id);
        setSelectedProject(null);

        if (doc) {
            const primaryList = doc.getArray('primary_projects');
            const hasReason = project.foundingReason && project.foundingReason.trim().length > 0;

            const newPrimary = {
                ...project,
                category,
                graduatedAt: Date.now(),
                subStage: 1,
                progress: 0,
                tasks: [],
                hasHolyGlow: hasReason,
                bgImage: project.bgImage || getRandomProjectImage()
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

    const getTreeVisual = (stage = 1, projectId = '') => {
        const stages = [
            { color: 'text-emerald-300', scale: 0.9, icon: Sprout, label: 'Seedling' },
            { color: 'text-emerald-400', scale: 1.1, icon: Sprout, label: 'Sapling' },
            { color: 'text-emerald-500', scale: 1.0, icon: TreeDeciduous, label: 'Young Tree' },
            { color: 'text-emerald-600', scale: 1.1, icon: TreeDeciduous, label: 'Mature Tree' },
            { color: 'text-emerald-700', scale: 1.2, icon: TreePine, label: 'Ancient' },
        ];

        // Advanced Stage (>= 6): Special mature trees
        if (stage >= 6) {
            const advancedTrees = [
                { color: 'text-pink-400', scale: 1.4, icon: TreeDeciduous, label: '🌸 Cherry Blossom', emoji: '🌸' },
                { color: 'text-orange-500', scale: 1.4, icon: TreeDeciduous, label: '🍁 Maple', emoji: '🍁' },
                { color: 'text-yellow-500', scale: 1.4, icon: TreeDeciduous, label: '🍂 Ginkgo', emoji: '🍂' },
                { color: 'text-emerald-600', scale: 1.4, icon: TreePine, label: '🌲 Cedar', emoji: '🌲' },
            ];
            // Deterministic random based on projectId for consistency
            const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return advancedTrees[hash % advancedTrees.length];
        }

        if (stage > stages.length) return stages[stages.length - 1];
        return stages[stage - 1] || stages[0];
    };

    return (
        <div className="max-w-7xl mx-auto pt-8 px-6 h-full flex gap-10">
            {/* Left Column: Stream & Nursery */}
            <div className={`transition-all duration-500 flex flex-col ${selectedProject ? 'w-[350px] opacity-100' : 'w-full'}`}>
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-light tracking-wide text-gray-900">Idea Staging</h2>
                        <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">Validate before you build</p>
                    </div>
                    <UndoRedoButtons
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                </div>

                <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-20">
                    <div className="space-y-4">
                        {projects.map(project => (
                            <motion.div
                                layoutId={project.id}
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className={`
                                    group cursor-pointer bg-white border rounded-xl relative transition-all duration-300 overflow-hidden
                                    ${selectedProject?.id === project.id ? 'border-gray-900 shadow-xl shadow-gray-200 ring-1 ring-gray-900 scale-[1.02]' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}
                                `}
                            >
                                <Spotlight className="p-5 h-full" spotColor="rgba(16, 185, 129, 0.2)">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${project.score === 4 ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                                            <Sprout size={18} />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-all relative z-40"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <h3 className="text-gray-900 font-medium mb-1 line-clamp-1">{project.title}</h3>
                                    <p className="text-gray-400 text-xs font-light line-clamp-2">{project.desc}</p>
                                </Spotlight>
                            </motion.div>
                        ))}

                        {/* Add Input */}
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
                                        if (e.key === 'Enter' && e.target.value?.trim()) {
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

                    {/* Nursery (Primary Projects) */}
                    {primaryProjects.length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <div className="mb-4 flex items-center gap-2">
                                <Sun size={16} className="text-amber-400" />
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest">Nursery</h3>
                                <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">({primaryProjects.length} Growing)</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar snap-x">
                                {primaryProjects.map(p => {
                                    const visual = getTreeVisual(p.subStage || 1, p.id);
                                    const isHoly = p.hasHolyGlow;
                                    const isAdvanced = (p.subStage || 1) >= 6;

                                    return (
                                        <motion.div
                                            key={p.id}
                                            layoutId={`nursery-${p.id}`}
                                            className={`
                                                snap-start bg-gradient-to-b from-white to-white 
                                                border rounded-2xl p-4 flex flex-col items-center justify-between text-center 
                                                hover:shadow-lg transition-all cursor-default relative overflow-hidden
                                                ${isAdvanced
                                                    ? 'min-w-[180px] h-[200px] border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-100'
                                                    : 'min-w-[140px] h-[160px]'}
                                                ${isHoly && !isAdvanced ? 'border-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-100' : ''}
                                                ${!isHoly && !isAdvanced ? 'border-emerald-100' : ''}
                                            `}
                                        >
                                            {/* Holy Glow Animation */}
                                            {isHoly && (
                                                <motion.div
                                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute inset-0 bg-gradient-to-tr from-violet-50/50 via-transparent to-emerald-50/50 pointer-events-none"
                                                />
                                            )}

                                            {/* Advanced Golden Glow */}
                                            {isAdvanced && (
                                                <motion.div
                                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute inset-0 bg-gradient-to-tr from-amber-50/60 via-transparent to-orange-50/40 pointer-events-none"
                                                />
                                            )}

                                            <div className="flex-1 flex items-center justify-center w-full relative">
                                                <motion.div
                                                    className={`relative z-10 ${visual.color} ${isHoly ? 'drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]' : ''} ${isAdvanced ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' : ''}`}
                                                    animate={{ scale: visual.scale }}
                                                >
                                                    {isAdvanced && visual.emoji ? (
                                                        <span className="text-4xl">{visual.emoji}</span>
                                                    ) : (
                                                        <visual.icon size={isAdvanced ? 48 : 32} strokeWidth={1.5} />
                                                    )}
                                                </motion.div>
                                                <div className={`absolute bottom-2 ${isAdvanced ? 'w-12' : 'w-8'} h-1 bg-emerald-900/10 rounded-full blur-sm`} />
                                            </div>
                                            <div className="w-full relative z-10">
                                                <h4 className={`font-medium text-gray-700 line-clamp-1 w-full mb-2 ${isAdvanced ? 'text-sm' : 'text-xs'}`}>{p.title}</h4>
                                                {isAdvanced ? (
                                                    <div className="flex items-center gap-1 justify-center text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                                                        <span>⭐ Advanced</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 justify-center">
                                                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${((p.subStage || 1) / 5) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Detail View */}
            <AnimatePresence mode="wait">
                {selectedProject && (
                    <ProjectDetailModal
                        project={selectedProject}
                        onUpdate={handleUpdateProject}
                        onAnswer={handleAnswer}
                        onGraduate={handleGraduate}
                        onClose={() => setSelectedProject(null)}
                    />
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

const ProjectDetailModal = ({ project, onUpdate, onAnswer, onGraduate, onClose }) => {
    // Local state for Vow to support IME (Chinese Input) properly
    const [localVow, setLocalVow] = useState(project.foundingReason || '');
    const [localTitle, setLocalTitle] = useState(project.title || '');
    const [localDesc, setLocalDesc] = useState(project.desc || '');
    const [selectedCategory, setSelectedCategory] = useState('general'); // Local state for Category

    // Reset local state when switching projects
    useEffect(() => {
        setLocalVow(project.foundingReason || '');
        setLocalTitle(project.title || '');
        setLocalDesc(project.desc || '');
        setSelectedCategory('general'); // Reset category
    }, [project.id]);



    const handleVowBlur = () => {
        if (localVow !== (project.foundingReason || '')) {
            onUpdate(project.id, 'foundingReason', localVow);
        }
    };

    const handleTitleBlur = () => {
        if (localTitle !== project.title) {
            onUpdate(project.id, 'title', localTitle);
        }
    };

    const handleDescBlur = () => {
        if (localDesc !== project.desc) {
            onUpdate(project.id, 'desc', localDesc);
        }
    };

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 overflow-y-auto no-scrollbar relative flex flex-col z-10"
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-30"
            >
                <X size={20} className="text-gray-400" />
            </button>

            <div className="absolute top-0 left-0 right-0 h-48 bg-gray-50 overflow-hidden rounded-t-[2.5rem] z-0">
                {project.bgImage ? (
                    <>
                        <img src={project.bgImage} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                )}
            </div>

            <div className="relative z-20 flex flex-col items-center mb-10 w-full mt-10">
                <div className="mb-6 relative">
                    <Sprout size={80} strokeWidth={1} className={
                        project.score === 0 ? 'text-gray-300' :
                            project.score <= 2 ? 'text-yellow-500' :
                                project.score < 4 ? 'text-lime-500' : 'text-emerald-600'
                    } />
                    {project.score === 4 && <div className="absolute -top-1 -right-1 text-yellow-500"><Sun size={28} fill="currentColor" /></div>}
                </div>

                <div className="w-full max-w-lg text-center">
                    <input
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="w-full text-4xl md:text-5xl font-thin text-gray-900 text-center bg-transparent border-none focus:ring-0 placeholder:text-gray-300 mb-2"
                        placeholder="无名项目"
                    />
                    <textarea
                        value={localDesc}
                        onChange={(e) => {
                            setLocalDesc(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onBlur={handleDescBlur}
                        className="w-full text-base font-light text-center text-gray-500 bg-transparent resize-none border-none focus:ring-0 min-h-[3em]"
                        placeholder="这个想法的原动力是什么？"
                    />

                    <div className="flex gap-2 justify-center mt-6">
                        <div className="flex items-center gap-2 bg-white border rounded-full px-4 py-1.5 shadow-sm">
                            <Sparkles size={12} className="text-gray-400" />
                            <input value={project.link || ''} onChange={(e) => onUpdate(project.id, 'link', e.target.value)} placeholder="链接" className="w-40 text-xs border-none p-0 focus:ring-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List - Auto-Jump (Collapsible) */}
            <div className="space-y-3 max-w-2xl mx-auto w-full relative z-20">
                {QUESTIONS.map((q, i) => {
                    const ans = project.answers[q.id];
                    const isAnswered = ans !== undefined;

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                            key={q.id}
                            className={`
                                relative rounded-2xl border transition-all duration-300 overflow-hidden
                                ${isAnswered
                                    ? 'p-4 bg-gray-50/50 border-gray-100' // Collapsed state
                                    : 'p-6 bg-white border-gray-100 shadow-sm' // Active state
                                }
                            `}
                        >
                            {isAnswered ? (
                                /* Collapsed Summary Row */
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${ans ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                                            {ans ? <CheckCircle2 size={14} /> : <X size={14} />}
                                        </div>
                                        <span className={`text-sm font-medium ${ans ? 'text-emerald-900' : 'text-gray-500'}`}>
                                            {q.text}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onAnswer(project.id, q.id, undefined)}
                                        className="text-xs text-gray-400 hover:text-emerald-500 transition-colors px-2 py-1 rounded hover:bg-white"
                                    >
                                        Redo
                                    </button>
                                </div>
                            ) : (
                                /* Active Question Card */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="relative z-30 flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Question {i + 1} / 4
                                            </h4>
                                            <p className="text-xl text-gray-800 font-light leading-relaxed">{q.text}</p>
                                        </div>
                                    </div>

                                    <div className="relative z-30 flex gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAnswer(project.id, q.id, true);
                                            }}
                                            className="relative z-50 cursor-pointer flex-1 py-4 border border-emerald-100 rounded-xl text-sm font-medium tracking-wide transition-all bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] group"
                                        >
                                            <span className="group-hover:scale-110 inline-block transition-transform">YES</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAnswer(project.id, q.id, false);
                                            }}
                                            className="relative z-50 cursor-pointer flex-1 py-4 border border-gray-100 rounded-xl text-sm font-medium tracking-wide transition-all bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-200 active:scale-[0.98]"
                                        >
                                            NO
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Sacred Reason Input (Fresh & Sacred Design - Faint Green) */}
            <div className="max-w-2xl mx-auto w-full relative z-20 mt-12 bg-white rounded-3xl p-1">
                <div className="mb-4 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Scroll size={16} className="text-emerald-300" />
                        <h4 className="text-xs font-medium text-emerald-300 tracking-widest uppercase">My Vow</h4>
                    </div>
                </div>

                <div className="relative group">
                    <div className={`
                        absolute -inset-0.5 bg-gradient-to-r from-emerald-100 to-teal-50 rounded-2xl opacity-0 transition duration-1000 group-hover:duration-200
                        ${project.foundingReason ? 'opacity-40 blur' : 'opacity-0'}
                    `}></div>

                    <textarea
                        value={localVow}
                        onChange={(e) => setLocalVow(e.target.value)}
                        onBlur={handleVowBlur}
                        className={`
                            relative w-full p-6 bg-white border rounded-2xl text-gray-700 placeholder:text-gray-300
                            text-sm leading-relaxed min-h-[120px] resize-none transition-all duration-500 ease-out
                            ${project.foundingReason
                                ? 'border-emerald-100 shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)] focus:border-emerald-300 focus:shadow-[0_0_50px_-10px_rgba(16,185,129,0.4)]'
                                : 'border-gray-100 focus:border-emerald-200 focus:shadow-[0_0_30px_-10px_rgba(52,211,153,0.2)]'
                            }
                            outline-none
                        `}
                        placeholder="在此刻写下你的初心..."
                    />
                    <div className="absolute bottom-4 right-4 text-emerald-100 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-400">
                        <Feather size={18} />
                    </div>
                </div>

                {project.foundingReason && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end mt-2 px-2"
                    >
                        <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                            <Sparkles size={10} />
                            VOW ESTABLISHED
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Choose Your Path - Category Selection */}
            <div className="max-w-2xl mx-auto w-full relative z-20 mt-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Sparkles size={14} className="text-emerald-400" />
                    <h4 className="text-xs font-medium text-gray-400 tracking-[0.2em] uppercase">Choose Your Path</h4>
                    <Sparkles size={14} className="text-emerald-400" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {COMMAND_CATEGORIES.filter(c => c.id !== 'general').map(cat => {
                        // Map icon string to component
                        const IconComponent = {
                            'LayoutGrid': LayoutGrid,
                            'Monitor': Monitor,
                            'Server': Server,
                            'Database': Database,
                            'Container': Container,
                            'Beaker': Beaker,
                            'Terminal': Terminal,
                            'Globe': Globe,
                            'Smartphone': Smartphone,
                            'Cloud': Cloud,
                            'Box': Box,
                            'Cpu': Cpu
                        }[cat.icon] || LayoutGrid;

                        const isSelected = selectedCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group
                                    ${isSelected
                                        ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10 ring-1 ring-emerald-500'
                                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1'
                                    }
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                                    ${isSelected
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
                                    }
                                `}>
                                    <IconComponent size={20} strokeWidth={1.5} />
                                </div>
                                <span className={`
                                    text-xs font-medium tracking-wide transition-colors
                                    ${isSelected ? 'text-emerald-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'}
                                `}>
                                    {cat.label}
                                </span>

                                {isSelected && (
                                    <motion.div
                                        layoutId="category-check"
                                        className="absolute top-2 right-2 text-emerald-500"
                                    >
                                        <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                    </motion.div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Graduate Button */}
            <div className="max-w-2xl mx-auto mt-6 pb-10 w-full relative z-30">
                {project.score === 4 && (
                    <button
                        onClick={() => onGraduate(project, selectedCategory)} // Pass category
                        className={`
                        w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500
                        ${project.foundingReason
                                ? 'bg-white border border-emerald-100 text-emerald-600 shadow-[0_10px_40px_-10px_rgba(52,211,153,0.3)] hover:shadow-[0_15px_50px_-10px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
                                : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                            }
                        ${!project.foundingReason && 'hover:bg-gray-100 hover:text-gray-500'}
                    `}
                    >
                        <span className="text-base font-light tracking-widest relative z-10 uppercase">
                            {project.foundingReason ? `Begin ${COMMAND_CATEGORIES.find(c => c.id === selectedCategory)?.label || ''} Journey` : 'Begin Journey'}
                        </span>
                        <ArrowRight size={18} className={`transition-transform duration-300 ${project.foundingReason ? 'group-hover:translate-x-1' : ''}`} />
                    </button>
                )}
            </div>

        </motion.div>
    );
};

export default PendingModule;
