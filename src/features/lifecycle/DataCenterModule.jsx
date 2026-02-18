import React, { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Lightbulb,
    Terminal,
    Sparkles,
    Box,
    PenTool
} from 'lucide-react';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';
import Spotlight from '../../components/shared/Spotlight';
import DataChartModal from './components/DataChartModal';

import { useDataCenterStats, useChartData } from './hooks/useDataCenterData';

const DataCenterModule = () => {
    const { doc } = useSync();
    const { t } = useTranslation();
    const [showChart, setShowChart] = useState(false);
    const [writingContentVersion, setWritingContentVersion] = useState(0);

    // Fetch all data sources
    const { projects: allProjects } = useSyncedProjects(doc, 'all_projects');
    const { projects: allCommands } = useSyncedProjects(doc, 'all_commands');
    const { projects: writingDocs } = useSyncedProjects(doc, 'writing_docs');

    useEffect(() => {
        if (!doc) return undefined;

        const yWritingContent = doc.getMap('writing_content');
        const handleChange = () => setWritingContentVersion((value) => value + 1);

        yWritingContent.observe(handleChange);
        return () => {
            yWritingContent.unobserve(handleChange);
        };
    }, [doc]);

    const writingContent = useMemo(() => {
        if (!doc) return {};
        const yWritingContent = doc.getMap('writing_content');
        const output = {};
        yWritingContent.forEach((value, key) => {
            if (value instanceof Y.Text) {
                output[key] = value.toString();
            } else if (typeof value === 'string') {
                output[key] = value;
            }
        });
        return output;
    }, [doc, writingContentVersion]);

    // Use hooks for logic
    const stats = useDataCenterStats(allProjects, allCommands, writingDocs, writingContent);
    const chartData = useChartData(allProjects, allCommands, writingDocs, writingContent);

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
                        className="rounded-2xl transition-all duration-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/10 hover:scale-[1.01] active:scale-[0.99] group/card"
                        spotColor="rgba(99, 102, 241, 0.08)"
                    >
                        <div
                            className="p-6 md:p-8 cursor-pointer select-none"
                            onDoubleClick={() => setShowChart(true)}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl group-hover/card:scale-110 transition-transform duration-500">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="text-sm text-gray-400 dark:text-gray-500 font-light uppercase tracking-widest">
                                        {t('data.totalWords')}
                                    </span>
                                </div>
                                <div className="text-[10px] text-indigo-300 dark:text-indigo-700 font-light hidden md:block italic opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                                    {t('data.chartDetailHint')}
                                </div>
                            </div>
                            <div className="text-5xl md:text-7xl font-extralight text-indigo-500 dark:text-indigo-400 tracking-tighter mb-6">
                                {stats.totalChars.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-8 text-xs font-light text-gray-400 dark:text-gray-500">
                                <div className="flex flex-col gap-1.5">
                                    <span className="uppercase tracking-widest text-[9px] opacity-70">{t('data.today')}</span>
                                    <span className="text-indigo-400 font-medium text-sm">{stats.todayChars.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="uppercase tracking-widest text-[9px] opacity-70">{t('data.thisWeek')}</span>
                                    <span className="text-indigo-400 font-medium text-sm">{stats.thisWeekChars.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Spotlight>
                </motion.div>

                {/* 次要数据 - 三列网格 */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {/* 灵感数 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-pink-200 dark:hover:border-pink-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                                <Lightbulb className="w-4 h-4 text-pink-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-pink-500 dark:text-pink-400 mb-1">
                                {stats.inspirationCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('navbar.inspiration')}
                            </div>
                        </div>
                    </motion.div>

                    {/* 成长中项目 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <Box className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-purple-500 dark:text-purple-400 mb-1">
                                {stats.growingCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('data.growingCount', '成长中项目')}
                            </div>
                        </div>
                    </motion.div>

                    {/* 蓝图 & 指令 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-sky-200 dark:hover:border-sky-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                                <Terminal className="w-4 h-4 text-sky-400" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-sky-500 dark:text-sky-400 mb-1">
                                {stats.blueprintCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('data.blueprintCount', '蓝图计划')}
                            </div>
                        </div>
                    </motion.div>

                    {/* 写作文档 */}
                    <motion.div variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 text-center hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300 hover:shadow-sm">
                            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <PenTool className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-2xl md:text-3xl font-light text-blue-500 dark:text-blue-400 mb-1">
                                {stats.writingDocCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">
                                {t('navbar.writing')}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <DataChartModal
                isOpen={showChart}
                onClose={() => setShowChart(false)}
                data={chartData}
            />

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
