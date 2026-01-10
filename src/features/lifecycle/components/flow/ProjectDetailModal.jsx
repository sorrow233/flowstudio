import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../i18n';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sprout, X, ArrowRight, Sun, Sparkles, CheckCircle2, Scroll, Feather, LayoutGrid, Monitor, Server, Database, Container, Beaker, Terminal, Globe, Smartphone, Cloud, Box, Cpu } from 'lucide-react';
import { COMMAND_CATEGORIES, QUESTIONS } from '../../../../utils/constants';

// Swipeable Question Card with Visual Feedback
const SwipeableQuestionCard = ({ question, index, total, isFirstCard, onAnswer, t }) => {
    const x = useMotionValue(0);

    // Left swipe (confirm) - green feedback
    const confirmBg = useTransform(
        x,
        [0, -50, -120],
        ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.3)']
    );

    // Right swipe (reject) - red feedback  
    const rejectBg = useTransform(
        x,
        [0, 50, 120],
        ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)']
    );

    return (
        <div className="relative">
            {/* Background color feedback */}
            <motion.div
                style={{ backgroundColor: confirmBg }}
                className="absolute inset-0 rounded-xl -z-10"
            />
            <motion.div
                style={{ backgroundColor: rejectBg }}
                className="absolute inset-0 rounded-xl -z-10"
            />

            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(e, info) => {
                    // Left swipe = YES (confirm)
                    if (info.offset.x < -100 || (info.velocity.x < -300 && info.offset.x < -30)) {
                        onAnswer(true);
                    }
                    // Right swipe = NO (reject)
                    else if (info.offset.x > 100 || (info.velocity.x > 300 && info.offset.x > 30)) {
                        onAnswer(false);
                    }
                }}
                className="touch-none cursor-grab active:cursor-grabbing relative z-10"
            >
                <div className="relative z-30 mb-4">
                    <h4 className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {t('common.question')} {index + 1} / {total}
                    </h4>
                    <p className="text-xl text-gray-800 dark:text-gray-200 font-light leading-relaxed">{t(`questions.${question.id}.text`)}</p>
                </div>

                {/* Swipe Tutorial - Only on first card */}
                {isFirstCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-6 text-xs text-gray-400 py-3 border-t border-dashed border-gray-100 dark:border-gray-800 mt-4"
                    >
                        <span className="flex items-center gap-1">
                            <ArrowRight className="rotate-180 text-emerald-400" size={14} />
                            <span className="text-emerald-500">左滑确定</span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                            <span className="text-gray-400">右滑否定</span>
                            <ArrowRight className="text-gray-400" size={14} />
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

const ProjectDetailModal = ({ project, onUpdate, onAnswer, onGraduate, onClose, categories = COMMAND_CATEGORIES }) => {
    const { t } = useTranslation();
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
            className="flex-1 h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-4 md:p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-y-auto no-scrollbar relative flex flex-col z-10"
        >
            <div className="absolute top-8 right-8 flex gap-2 z-30">
                {/* Mobile Back Button - Optimized for Drill-Down */}
                <button
                    onClick={onClose}
                    className="md:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -mr-2"
                >
                    <ArrowRight className="rotate-180 text-gray-500" size={20} />
                </button>
                {/* Desktop Close Button */}
                <button
                    onClick={onClose}
                    className="hidden md:block p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="absolute top-0 left-0 right-0 h-48 bg-gray-50 dark:bg-gray-900 overflow-hidden rounded-t-[2.5rem] z-0">
                {project.bgImage ? (
                    <>
                        <img src={project.bgImage} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-950" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" />
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
                        className="w-full text-4xl md:text-5xl font-thin text-gray-900 dark:text-white text-center bg-transparent border-none focus:ring-0 placeholder:text-gray-300 mb-2"
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
                        className="w-full text-base font-light text-center text-gray-500 dark:text-gray-400 bg-transparent resize-none border-none focus:ring-0 min-h-[3em]"
                        placeholder="这个想法的原动力是什么？"
                    />
                </div>
            </div>

            {/* Questions List - Swipe to Answer */}
            <div className="space-y-3 max-w-2xl mx-auto w-full relative z-20">
                {(() => {
                    // Find the first unanswered question index
                    const firstUnansweredIndex = QUESTIONS.findIndex(qq => project.answers[qq.id] === undefined);

                    return QUESTIONS.map((q, i) => {
                        const ans = project.answers[q.id];
                        const isAnswered = ans !== undefined;
                        const isFirstCard = i === firstUnansweredIndex;

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
                                        ? 'p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                                        : 'p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
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
                                            <span className={`text-sm font-medium ${ans ? 'text-emerald-900 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {t(`questions.${q.id}.text`)}
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
                                    /* Active Question Card - Swipeable with Visual Feedback */
                                    <SwipeableQuestionCard
                                        question={q}
                                        index={i}
                                        total={QUESTIONS.length}
                                        isFirstCard={isFirstCard}
                                        onAnswer={(value) => onAnswer(project.id, q.id, value)}
                                        t={t}
                                    />
                                )}
                            </motion.div>
                        );
                    });
                })()}
            </div>

            {/* Sacred Reason Input (Fresh & Sacred Design - Faint Green) */}
            <div className="max-w-2xl mx-auto w-full relative z-20 mt-12 bg-white dark:bg-gray-900 rounded-3xl p-1">
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
                            relative w-full p-6 bg-white dark:bg-gray-950 border rounded-2xl text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600
                            text-sm leading-relaxed min-h-[120px] resize-none transition-all duration-500 ease-out
                            ${project.foundingReason
                                ? 'border-emerald-100 dark:border-emerald-900/50 shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)] focus:border-emerald-300 focus:shadow-[0_0_50px_-10px_rgba(16,185,129,0.4)]'
                                : 'border-gray-100 dark:border-gray-800 focus:border-emerald-200 focus:shadow-[0_0_30px_-10px_rgba(52,211,153,0.2)]'
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
            <div className="max-w-2xl mx-auto w-full relative z-20 mt-12 mb-20">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                    <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.4em] uppercase opacity-80">Choose Your Path</h4>
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50/80 dark:bg-gray-900/50 rounded-full px-4 py-3 border border-gray-100 dark:border-gray-800">
                    {categories.map(cat => {
                        // Map color class to dot color
                        const dotColors = {
                            'general': 'bg-slate-400',
                            'frontend': 'bg-blue-400',
                            'backend': 'bg-emerald-400',
                            'database': 'bg-amber-400',
                            'devops': 'bg-violet-400',
                            'testing': 'bg-rose-400'
                        };

                        const isSelected = selectedCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                                    ${isSelected
                                        ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 scale-105'
                                        : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                                    }
                                `}
                            >
                                <div className={`
                                    w-3 h-3 rounded-full transition-all duration-300
                                    ${dotColors[cat.id] || 'bg-gray-400'}
                                    ${isSelected ? 'scale-125 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 ring-current opacity-100' : 'opacity-70'}
                                `} />
                                <span className={`
                                    text-xs font-medium transition-colors
                                    ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
                                `}>
                                    {cat.label}
                                </span>
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
                            {project.foundingReason ? `Begin ${categories.find(c => c.id === selectedCategory)?.label || ''} Journey` : 'Begin Journey'}
                        </span>
                        <ArrowRight size={18} className={`transition-transform duration-300 ${project.foundingReason ? 'group-hover:translate-x-1' : ''}`} />
                    </button>
                )}
            </div>

        </motion.div>
    );
};

export default ProjectDetailModal;
