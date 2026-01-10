import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sprout, TreeDeciduous, TreePine, Edit3, Link2, Scroll, Feather, Sparkles, ArrowUpCircle, ExternalLink } from 'lucide-react';
import Spotlight from '../../../../components/shared/Spotlight';
import { useTranslation } from '../../../i18n';

/**
 * ProjectManageModal - 项目管理模态框（增强版）
 * 支持编辑标题、描述、誓言、链接，以及删除和升级到 Advanced
 */
const ProjectManageModal = ({
    project,
    isOpen,
    onClose,
    onDelete,
    onUpdate,
    onPromoteToAdvanced
}) => {
    const { t } = useTranslation();

    // Local editable state
    const [localTitle, setLocalTitle] = useState('');
    const [localDesc, setLocalDesc] = useState('');
    const [localVow, setLocalVow] = useState('');
    const [localLink, setLocalLink] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    // Sync local state when project changes
    useEffect(() => {
        if (project) {
            setLocalTitle(project.title || '');
            setLocalDesc(project.desc || '');
            setLocalVow(project.foundingReason || '');
            setLocalLink(project.link || '');
            setIsEditingTitle(false);
            setIsEditingDesc(false);
        }
    }, [project?.id]);

    if (!isOpen || !project) return null;

    const getStageIcon = (stage, subStage = 1) => {
        if (stage === 'advanced' || subStage >= 6) {
            return <TreePine size={24} className="text-amber-500" />;
        }
        if (subStage >= 3) {
            return <TreeDeciduous size={24} className="text-emerald-500" />;
        }
        return <Sprout size={24} className="text-emerald-400" />;
    };

    // Save handlers
    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (localTitle.trim() && localTitle !== project.title && onUpdate) {
            onUpdate(project.id, { title: localTitle.trim() });
        }
    };

    const handleDescBlur = () => {
        setIsEditingDesc(false);
        if (localDesc !== project.desc && onUpdate) {
            onUpdate(project.id, { desc: localDesc });
        }
    };

    const handleVowBlur = () => {
        if (localVow !== (project.foundingReason || '') && onUpdate) {
            onUpdate(project.id, { foundingReason: localVow });
        }
    };

    const handleLinkBlur = () => {
        if (localLink !== (project.link || '') && onUpdate) {
            onUpdate(project.id, { link: localLink });
        }
    };

    // Can promote to advanced if subStage >= 5
    const canPromote = project.stage === 'primary' && (project.subStage || 1) >= 5;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 mb-safe">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm md:max-w-lg bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/10"
                        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                    >
                        {/* 1. Header with Background Image */}
                        <div className="h-32 relative shrink-0 overflow-hidden group">
                            <div className="absolute inset-0 bg-gray-900">
                                {project.bgImage ? (
                                    <img
                                        src={project.bgImage}
                                        alt="Background"
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-gray-900" />
                                )}
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/10 overflow-hidden group/close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Floating Icon */}
                        <div className="relative z-10 -mt-8 flex justify-center pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900 pointer-events-auto"
                            >
                                {getStageIcon(project.stage, project.subStage)}
                            </motion.div>
                        </div>

                        {/* 2. Content Area - Scrollable */}
                        <div className="relative flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
                            <Spotlight className="pt-6 pb-6 px-6" spotColor="rgba(16, 185, 129, 0.1)">
                                {/* Editable Title */}
                                <div className="text-center mb-4">
                                    {isEditingTitle ? (
                                        <input
                                            type="text"
                                            value={localTitle}
                                            onChange={(e) => setLocalTitle(e.target.value)}
                                            onBlur={handleTitleBlur}
                                            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                                            autoFocus
                                            className="w-full text-2xl font-bold text-gray-900 dark:text-white text-center bg-transparent border-b-2 border-emerald-500 focus:outline-none px-2 py-1"
                                            placeholder={t('project.untitledProject')}
                                        />
                                    ) : (
                                        <h2
                                            onClick={() => onUpdate && setIsEditingTitle(true)}
                                            className="text-2xl font-bold text-gray-900 dark:text-white mb-1 font-display bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 cursor-pointer hover:opacity-80 transition-opacity group inline-flex items-center gap-2 justify-center"
                                        >
                                            {project.title}
                                            {onUpdate && <Edit3 size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
                                        </h2>
                                    )}
                                </div>

                                {/* Editable Description */}
                                <div className="text-center mb-4">
                                    {isEditingDesc ? (
                                        <textarea
                                            value={localDesc}
                                            onChange={(e) => setLocalDesc(e.target.value)}
                                            onBlur={handleDescBlur}
                                            autoFocus
                                            rows={2}
                                            className="w-full text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-emerald-500 px-3 py-2 resize-none"
                                            placeholder={t('project.descriptionPlaceholder')}
                                        />
                                    ) : (
                                        <p
                                            onClick={() => onUpdate && setIsEditingDesc(true)}
                                            className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light min-h-[2em] cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {project.desc || t('project.waitingForSprout')}
                                        </p>
                                    )}
                                </div>

                                {/* Metadata Pills */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                                    <div className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                        ID: {project.id?.slice(0, 6)}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${project.stage === 'advanced'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                        }`}>
                                        {project.stage === 'advanced' ? t('project.advancedStage') : `${t('project.nurseryStage')} Lv.${project.subStage || 1}`}
                                    </div>
                                    {project.category && (
                                        <div className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/30">
                                            {project.category}
                                        </div>
                                    )}
                                </div>

                                {/* Link Input */}
                                {onUpdate && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-emerald-500 transition-colors">
                                            <Link2 size={14} className="text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={localLink}
                                                onChange={(e) => setLocalLink(e.target.value)}
                                                onBlur={handleLinkBlur}
                                                placeholder={t('project.addLink')}
                                                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none placeholder:text-gray-400"
                                            />
                                            {localLink && (
                                                <a
                                                    href={localLink.startsWith('http') ? localLink : `https://${localLink}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-gray-400 hover:text-emerald-500 transition-colors"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Vow/Founding Reason */}
                                {onUpdate && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Scroll size={14} className="text-emerald-400" />
                                            <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">{t('project.myVow')}</span>
                                            {project.foundingReason && (
                                                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 ml-auto">
                                                    <Sparkles size={10} />
                                                    {t('project.vowEstablished')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <textarea
                                                value={localVow}
                                                onChange={(e) => setLocalVow(e.target.value)}
                                                onBlur={handleVowBlur}
                                                placeholder={t('project.vowPlaceholder')}
                                                rows={3}
                                                className={`
                                                    w-full p-4 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm text-gray-700 dark:text-gray-300 
                                                    placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none transition-all
                                                    ${project.foundingReason
                                                        ? 'border-emerald-200 dark:border-emerald-800 focus:border-emerald-400'
                                                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-400'}
                                                `}
                                            />
                                            <Feather size={14} className="absolute bottom-3 right-3 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    </div>
                                )}

                                {/* 3. Actions */}
                                <div className="space-y-3">
                                    {/* Promote to Advanced Button */}
                                    {canPromote && onPromoteToAdvanced && (
                                        <button
                                            onClick={() => {
                                                onPromoteToAdvanced(project.id);
                                                onClose();
                                            }}
                                            className="w-full group relative py-3.5 px-4 rounded-xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-300"
                                        >
                                            <div className="relative flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-medium z-10">
                                                <ArrowUpCircle size={16} className="group-hover:scale-110 transition-transform duration-300" />
                                                <span>{t('project.promoteToAdvanced')}</span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => onDelete(project.id)}
                                        className="w-full group relative py-3.5 px-4 rounded-xl overflow-hidden bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
                                    >
                                        <div className="relative flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-medium z-10">
                                            <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-300" />
                                            <span>{t('project.pruneSeed')}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left" />
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors py-2"
                                    >
                                        {t('project.keepGrowing')}
                                    </button>
                                </div>
                            </Spotlight>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProjectManageModal;
