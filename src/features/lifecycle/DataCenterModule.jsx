import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Lightbulb,
    Terminal,
    TextQuote,
    Zap,
    ArrowUpRight,
    TrendingUp,
    Hash
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
        let sproutCount = 0;
        let flowCount = 0;
        let instructionCount = allCommands?.length || 0;

        // Process Projects
        allProjects?.forEach(project => {
            // Count characters in content and note
            totalChars += (project.content?.length || 0);
            totalChars += (project.note?.length || 0);

            // Categorize by stage (Inspiration is stage 0 or specific flag)
            if (project.stage === 'inspiration') {
                inspirationCount++;
            } else if (project.stageIds?.includes(1) || project.stageIds?.includes(2)) {
                sproutCount++;
            } else {
                flowCount++;
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
            sproutCount,
            flowCount,
            instructionCount,
            totalItems: (allProjects?.length || 0) + (allCommands?.length || 0)
        };
    }, [allProjects, allCommands]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 md:px-6 min-h-[100dvh] pb-safe">
            {/* Header Area */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <BarChart3 className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                            {t('navbar.data')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                            {t('data.subtitle', '可视化你的思维数字足迹')}
                        </p>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {/* Total Word Count - Main Focus */}
                <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-1">
                    <Spotlight className="h-full rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group" spotColor="rgba(255,255,255,0.2)">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                        <TextQuote size={24} />
                                    </div>
                                    <TrendingUp size={20} className="text-indigo-200 opacity-50" />
                                </div>
                                <div className="text-sm font-light text-indigo-100 mb-2 uppercase tracking-widest">
                                    {t('data.totalWords', '文字总处理量')}
                                </div>
                                <div className="text-6xl font-extralight tracking-tighter mb-4">
                                    {stats.totalChars.toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-indigo-100/70 font-light">
                                <Zap size={14} className="text-yellow-300" />
                                <span>{t('data.flowEfficiency', '心流产出持续活跃中')}</span>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    </Spotlight>
                </motion.div>

                {/* Sub Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Inspiration Stats */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl text-pink-500">
                                    <Lightbulb size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-pink-400 transition-colors" />
                            </div>
                            <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.inspirationCount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">
                                {t('navbar.inspiration')}
                            </div>
                        </div>
                    </motion.div>

                    {/* Instruction Stats */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-2xl text-sky-500">
                                    <Terminal size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-sky-400 transition-colors" />
                            </div>
                            <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.instructionCount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">
                                {t('navbar.command')}
                            </div>
                        </div>
                    </motion.div>

                    {/* Total Items */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500">
                                    <Hash size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                                {stats.totalItems}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">
                                {t('data.totalItems', '总记录条数')}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sprout/Flow ratio placeholder */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-gray-900 dark:bg-white rounded-[2rem] p-6 flex items-center justify-between group overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="text-2xl font-light text-white dark:text-gray-900 mb-1">
                                    {Math.round((stats.flowCount / (stats.totalItems || 1)) * 100)}%
                                </div>
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {t('data.conversion', '灵感转化率')}
                                </div>
                            </div>
                            <div className="relative z-10 w-12 h-12 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl -z-0" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Footer Insight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center"
            >
                <p className="text-xs text-gray-400 dark:text-gray-600 font-light italic">
                    "Data is the shadow of thought. Keep creating."
                </p>
            </motion.div>
        </div>
    );
};

export default DataCenterModule;
