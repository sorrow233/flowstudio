import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { parseRichText, getColorConfig } from './components/inspiration/InspirationUtils';

const InspirationArchiveModule = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { doc, immediateSync } = useSync();
    const { projects: allProjects, updateProject, removeProject } = useSyncedProjects(doc, 'all_projects');

    const archivedIdeas = useMemo(() =>
        allProjects
            .filter(p => p.stage === 'archive')
            .sort((a, b) => (b.archiveTimestamp || 0) - (a.archiveTimestamp || 0)),
        [allProjects]);

    const handleRestore = (id) => {
        updateProject(id, { stage: 'inspiration' });
        immediateSync?.();
    };

    const handleDelete = (id) => {
        removeProject(id);
        immediateSync?.();
    };

    return (
        <div className="max-w-4xl mx-auto pt-14 px-6 md:px-10 pb-32">
            {/* Header */}
            <div className="mb-14">
                <div className="flex items-center gap-4 mb-3">
                    <button
                        onClick={() => navigate('/inspiration')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                            <Archive className="w-5 h-5 text-pink-400" />
                        </div>
                        <h2
                            onClick={() => navigate('/inspiration')}
                            className="text-3xl font-light text-pink-400 dark:text-pink-300 tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {t('inspiration.archiveTitle', '灵感存档')}
                        </h2>
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-wide ml-14">
                    {t('inspiration.archiveSubtitle', '暂存的灵感碎片，点击标题返回')}
                </p>
            </div>

            {/* Archive List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {archivedIdeas.length > 0 ? (
                        archivedIdeas.map((idea) => {
                            const config = getColorConfig(idea.colorIndex || 0);
                            return (
                                <motion.div
                                    key={idea.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative group bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${config.dot} opacity-50`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-gray-600 dark:text-gray-400 text-[15px] font-normal leading-relaxed">
                                                {parseRichText(idea.content)}
                                            </div>
                                            <div className="mt-2 text-[11px] text-gray-300 dark:text-gray-600">
                                                {new Date(idea.archiveTimestamp || idea.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleRestore(idea.id)}
                                            className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                                            title={t('common.restore', '还原')}
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(idea.id)}
                                            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                            title={t('common.delete', '删除')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center"
                        >
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Archive className="text-gray-300 dark:text-gray-600" size={24} />
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 text-sm font-light tracking-wide">
                                {t('inspiration.emptyArchive', '存档箱是空的')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InspirationArchiveModule;
