import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Terminal,
    Hash,
    Sparkles,
    Box
} from 'lucide-react';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';
import Spotlight from '../../components/shared/Spotlight';

const DataCenterModule = () => {
    const { doc } = useSync();
    const { t } = useTranslation();

    // Fetch all data sources
    const { projects: allProjects } = useSyncedProjects(doc, 'all_projects');
    const { projects: allCommands } = useSyncedProjects(doc, 'all_commands');

    // Calculate Statistics
    const stats = useMemo(() => {
        let totalChars = 0;
        let inspirationCount = 0;
        let instructionCount = allCommands?.length || 0;

        // Process Projects
        allProjects?.forEach(project => {
            totalChars += (project.content?.length || 0);
            totalChars += (project.note?.length || 0);

            if (project.stage === 'inspiration') {
                inspirationCount++;
            }
        });

        // Process Commands
        allCommands?.forEach(cmd => {
            totalChars += (cmd.content?.length || 0);
            totalChars += (cmd.title?.length || 0);
        });

        return {
            totalChars,
            inspirationCount,
            instructionCount,
            projectCount: (allProjects?.length || 0) - inspirationCount
        };
    }, [allProjects, allCommands]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div className="max-w-4xl mx-auto pt-14 px-6 md:px-10 pb-32">
            {/* Header Section - 使用 Indigo 主题色 */}
            <div className="mb-14 text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-light text-indigo-400 dark:text-indigo-300 tracking-tight relative inline-block">
                        {t('navbar.data')}
                        {/* Indigo Brush Stroke */}
                        <span className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-indigo-200/80 via-indigo-300/60 to-transparent dark:from-indigo-700/50 dark:via-indigo-600/30 dark:to-transparent rounded-full blur-[2px]" />
                    </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-wide max-w-md mx-auto md:mx-0 leading-relaxed">
                    {t('data.subtitle')}
                </p>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {/* 主要数据卡片 - 文字总量 */}
                <motion.div variants={cardVariants}>
                    <Spotlight
                        className="rounded-2xl transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/10"
                        spotColor="rgba(99, 102, 241, 0.08)"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="text-sm text-gray-400 dark:text-gray-500 font-light uppercase tracking-widest">
                                        {t('data.totalWords')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-5xl md:text-6xl font-extralight text-gray-900 dark:text-white tracking-tight">
                                {stats.totalChars.toLocaleString()}
                            </div>
                            <div className="mt-4 text-xs text-indigo-300 dark:text-indigo-400/60 font-light">
                                {t('data.flowEfficiency')}
                            </div>
                        </div>
                    </Spotlight>
                </motion.div>

                {/* 次要数据 - 三列网格 */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {/* 灵感数 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <Lightbulb className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.inspirationCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('navbar.inspiration')}
                            </div>
                        </div>
                    </motion.div>

                    {/* 指令数 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <Terminal className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.instructionCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('navbar.command')}
                            </div>
                        </div>
                    </motion.div>

                    {/* 项目数 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <Terminal className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.projectCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('data.projectCount', '进行中项目')}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-16 text-center"
            >
                <p className="text-xs text-gray-300 dark:text-gray-700 font-light italic">
                    "Data is the shadow of thought."
                </p>
            </motion.div>
        </div>
    );
};

export default DataCenterModule;
