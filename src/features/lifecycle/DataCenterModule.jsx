import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, isSameWeek, isSameMonth, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
    BarChart3,
    Lightbulb,
    Terminal,
    Hash,
    Sparkles,
    Box
} from 'lucide-react';
import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';
import Spotlight from '../../components/shared/Spotlight';
import DataChartModal from './components/DataChartModal';

const DataCenterModule = () => {
    const { doc } = useSync();
    const { t } = useTranslation();
    const [showChart, setShowChart] = useState(false);

    // Fetch all data sources
    const { projects: allProjects } = useSyncedProjects(doc, 'all_projects');
    const { projects: allCommands } = useSyncedProjects(doc, 'all_commands');

    // Calculate Statistics
    const stats = useMemo(() => {
        let totalChars = 0;
        let inspirationCount = 0;
        let instructionCount = allCommands?.length || 0;
        let growingCount = 0;
        let pendingProjectCount = 0;
        let todayChars = 0;
        let thisWeekChars = 0;

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        // Process Projects
        allProjects?.forEach(project => {
            const itemChars = (project.content?.length || 0) + (project.note?.length || 0);
            totalChars += itemChars;

            const timestamp = project.timestamp || project.createdAt || 0;
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;

            if (project.stage === 'inspiration') {
                inspirationCount++;
            } else if (project.stage === 'primary') {
                growingCount++;
            } else if (project.stage === 'pending') {
                pendingProjectCount++;
            }
        });

        // Process Commands
        allCommands?.forEach(cmd => {
            const itemChars = (cmd.content?.length || 0) + (cmd.title?.length || 0);
            totalChars += itemChars;

            const timestamp = cmd.timestamp || cmd.createdAt || 0;
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;
        });

        return {
            totalChars,
            todayChars,
            thisWeekChars,
            inspirationCount,
            instructionCount,
            growingCount,
            blueprintCount: pendingProjectCount + instructionCount
        };
    }, [allProjects, allCommands]);

    // Aggregate Data for Chart
    const chartData = useMemo(() => {
        const now = new Date();

        // Helper to sum chars for an interval
        const getSumForInterval = (items, intervalStart, type) => {
            return items?.reduce((sum, item) => {
                const timestamp = new Date(item.timestamp || item.createdAt || 0);
                let match = false;
                if (type === 'day') match = isSameDay(timestamp, intervalStart);
                if (type === 'week') match = isSameWeek(timestamp, intervalStart);
                if (type === 'month') match = isSameMonth(timestamp, intervalStart);

                if (match) {
                    sum += (item.content?.length || 0) + (item.note?.length || 0) + (item.title?.length || 0);
                }
                return sum;
            }, 0) || 0;
        };

        const combinedItems = [...(allProjects || []), ...(allCommands || [])];

        // 1. Daily (Last 14 days)
        const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
        const daily = days.map(day => ({
            label: format(day, 'MM/dd'),
            value: getSumForInterval(combinedItems, day, 'day'),
            fullDate: day
        }));

        // 2. Weekly (Last 8 weeks)
        const weeks = eachWeekOfInterval({ start: subDays(now, 7 * 7), end: now }, { weekStartsOn: 1 });
        const weekly = weeks.map(week => ({
            label: format(week, 'MM/dd'),
            value: getSumForInterval(combinedItems, week, 'week'),
            fullDate: week
        }));

        // 3. Monthly (Last 6 months)
        const months = eachMonthOfInterval({ start: subDays(now, 30 * 5), end: now });
        const monthly = months.map(month => ({
            label: format(month, 'MMM'),
            value: getSumForInterval(combinedItems, month, 'month'),
            fullDate: month
        }));

        return { daily, weekly, monthly };
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
                                <div className="text-[10px] text-gray-300 dark:text-gray-600 font-light hidden md:block italic">
                                    Double-click to view details
                                </div>
                            </div>
                            <div
                                className="text-5xl md:text-6xl font-extralight text-indigo-500 dark:text-indigo-400 tracking-tight mb-4 cursor-pointer select-none"
                                onDoubleClick={() => setShowChart(true)}
                                title="Double-click for details"
                            >
                                {stats.totalChars.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-6 text-xs font-light text-gray-400 dark:text-gray-500">
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase tracking-widest text-[9px] opacity-70">{t('data.today')}</span>
                                    <span className="text-indigo-400 font-medium">{stats.todayChars.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase tracking-widest text-[9px] opacity-70">{t('data.thisWeek')}</span>
                                    <span className="text-indigo-400 font-medium">{stats.thisWeekChars.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Spotlight>
                </motion.div>

                {/* 次要数据 - 三列网格 */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
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
