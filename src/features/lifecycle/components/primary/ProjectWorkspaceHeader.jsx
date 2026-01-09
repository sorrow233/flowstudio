import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Terminal, Pencil, Save, X, Trash2, ArrowLeft, Image as ImageIcon, ChevronDown, Quote } from 'lucide-react';
import { DEV_STAGES } from '../../../../utils/constants';
import { useTranslation } from '../../../i18n';

const VISUAL_VIBES = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Tech Dark
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Circuit
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', // Cyberpunk
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop', // Mountain
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop'  // Nature
];

const ProjectWorkspaceHeader = ({
    project, activeStage, isCollapsed, isEditing, editForm,
    setEditForm, onSaveEdit, onCancelEdit, onStartEdit, onClose, onDelete, onImportCommand, onToggleCollapse,
    stages = DEV_STAGES,
    themeColor = 'purple',
    ...props
}) => {
    const { t } = useTranslation();
    const [showVow, setShowVow] = useState(false);

    // Theme Configuration
    const THEME_STYLES = {
        purple: {
            badge: 'bg-purple-500 text-white shadow-purple-500/20',
            vow: 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]',
            inputBorder: 'focus:border-purple-500',
            button: 'hover:shadow-purple-500/20 hover:text-purple-600',
            icon: 'group-hover:text-purple-500',
            bgImageBorder: 'border-purple-500',
            modalBorder: 'border-purple-500/30'
        },
        red: {
            badge: 'bg-red-500 text-white shadow-red-500/20',
            vow: 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
            inputBorder: 'focus:border-red-500',
            button: 'hover:shadow-red-500/20 hover:text-red-600',
            icon: 'group-hover:text-red-500',
            bgImageBorder: 'border-red-500',
            modalBorder: 'border-red-500/30'
        }
    };

    const theme = THEME_STYLES[themeColor] || THEME_STYLES.purple;

    const stageInfo = stages.find(s => s.id === activeStage);

    return (
        <>
            <motion.div
                {...props}
                className="relative shrink-0 flex flex-col justify-end overflow-hidden transition-all duration-500 bg-white dark:bg-gray-900 group"
                animate={{
                    height: isCollapsed ? (window.innerWidth < 768 ? 130 : 120) : (window.innerWidth < 768 ? 'auto' : 320),
                }}
            >
                {/* Background Image Logic */}
                <div className="absolute inset-0 z-0">
                    {isEditing ? (
                        <>
                            {editForm.bgImage ? (
                                <img src={editForm.bgImage} alt="" className="w-full h-full object-cover opacity-40 blur-sm" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-black" />
                            )}
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/60" />
                        </>
                    ) : (
                        <>
                            {project.bgImage ? (
                                <motion.img
                                    src={project.bgImage}
                                    alt=""
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-gray-900 dark:via-gray-900/40 dark:to-transparent" />
                        </>
                    )}
                </div>

                {/* Top Toolbar */}
                <div
                    className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-30 transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition-colors bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-gray-200/50 dark:border-white/5"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-xs font-medium uppercase tracking-widest">Back</span>
                    </button>


                </div>

                {/* Content Area */}
                <div className="relative z-20 p-6 md:p-8 pb-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-end md:justify-between items-start md:items-end gap-6 md:gap-0 h-full">
                    <div className="w-full">
                        {isEditing ? (
                            // EDIT FORM (Simplified inline)
                            <div className="space-y-4 max-w-2xl bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                                <input
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className={`w-full bg-transparent text-2xl md:text-3xl font-light text-white placeholder:text-white/30 outline-none border-b border-white/10 ${theme.inputBorder} pb-2 transition-colors`}
                                    placeholder="Project Title"
                                />
                                <textarea
                                    value={editForm.desc}
                                    onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                                    className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/30 outline-none resize-none h-16"
                                    placeholder="Brief mission statement..."
                                />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Background Theme</label>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {VISUAL_VIBES.map((vibe, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setEditForm({ ...editForm, bgImage: vibe })}
                                                    className={`w-6 h-6 rounded-full border-2 overflow-hidden transition-all shrink-0 ${editForm.bgImage === vibe ? `${theme.bgImageBorder} scale-125` : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                >
                                                    <img src={vibe} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // VIEW MODE
                            <div className="flex flex-col md:flex-row justify-end md:justify-between items-start md:items-end w-full gap-6">
                                <div className="w-full md:w-auto">
                                    <motion.div layout className="flex items-center gap-3 mb-2 opacity-80">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${theme.badge} shadow-lg`}>
                                            {stageInfo?.label} Phase
                                        </span>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors truncate max-w-[200px]">
                                                <ExternalLink size={12} /> {new URL(project.link).hostname}
                                            </a>
                                        )}
                                    </motion.div>
                                    <motion.h1 layout className={`font-thin text-gray-900 dark:text-white leading-none tracking-tighter break-words ${isCollapsed ? 'text-2xl md:text-4xl' : 'text-3xl md:text-6xl mb-2 md:mb-4'}`}>
                                        {project.title}
                                    </motion.h1>
                                    {!isCollapsed && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm md:text-lg font-light text-gray-500 dark:text-white/70 max-w-xl leading-relaxed mt-2 md:mt-0 line-clamp-3 md:line-clamp-none">
                                            {project.desc}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Floating Action Button for Command */}
                                <div className="flex gap-3 w-full md:w-auto">
                                    {/* Vow / Origin Button (Only if exists) */}
                                    {project.foundingReason && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowVow(true)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all border border-white/5"
                                            title="View Founding Vow"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${theme.vow} animate-pulse`} />
                                            <span className="text-xs font-medium tracking-widest uppercase inline">The Vow</span>
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onImportCommand}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 md:px-6 py-3 md:py-4 bg-white text-gray-900 rounded-2xl shadow-2xl ${theme.button} transition-all font-medium whitespace-nowrap group`}
                                    >
                                        <Terminal size={18} className={`md:w-5 md:h-5 ${theme.icon} transition-colors`} />
                                        <span className="inline">{t('taskList.importCommand')}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Manual Toggle Handle */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center z-40 pb-2 pointer-events-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
                        className="p-1 bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full text-gray-400 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition-all cursor-pointer pointer-events-auto border border-gray-200/50 dark:border-white/5 group/toggle"
                    >
                        <ChevronDown size={14} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                    </button>
                </div>

            </motion.div >

            {/* THE VOW MODAL */}
            <AnimatePresence>
                {showVow && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVow(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-lg bg-gray-900/90 border ${theme.modalBorder} backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-hidden`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Background Elements */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.badge} opacity-10 blur-[50px] rounded-full translate-x-10 -translate-y-10`} />
                            <div className={`absolute bottom-0 left-0 w-24 h-24 ${theme.badge} opacity-10 blur-[40px] rounded-full -translate-x-5 translate-y-5`} />

                            <button
                                onClick={() => setShowVow(false)}
                                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                                <div className={`p-4 rounded-full bg-white/5 border border-white/10 ${theme.icon} text-white`}>
                                    <Quote size={32} className="opacity-80" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                                        Founding Vow
                                    </h3>
                                    <h2 className="text-2xl font-light text-white italic">
                                        初心暂言
                                    </h2>
                                </div>

                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="max-h-[60vh] overflow-y-auto w-full custom-scrollbar">
                                    <p className="text-lg md:text-xl text-white/90 leading-relaxed font-serif whitespace-pre-line">
                                        {project.foundingReason}
                                    </p>
                                </div>

                                <div className="w-full pt-4">
                                    <button
                                        onClick={() => setShowVow(false)}
                                        className={`w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-sm tracking-widest uppercase transform active:scale-[0.98]`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProjectWorkspaceHeader;
