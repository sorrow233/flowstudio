import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
    buildWritingEntries,
    getTextLength,
    isTimestampInInterval,
    isWritingProject,
    resolveTimestamp
} from './dataCenterUtils';

export const useDataCenterStats = (allProjects, allCommands, writingDocs = [], writingContent = {}) => {
    return useMemo(() => {
        let totalChars = 0;
        let inspirationCount = 0;
        let instructionCount = allCommands?.length || 0;
        let growingCount = 0;
        let pendingProjectCount = 0;
        let writingDocCount = 0;
        let todayChars = 0;
        let thisWeekChars = 0;

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        const activeProjects = (allProjects || []).filter((project) => !isWritingProject(project));
        const writingEntries = buildWritingEntries(allProjects, writingDocs, writingContent);

        activeProjects.forEach((project) => {
            const itemChars = getTextLength(project.content) + getTextLength(project.note);
            totalChars += itemChars;
            const timestamp = resolveTimestamp(project, ['timestamp', 'createdAt']);
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;

            if (project.stage === 'inspiration') inspirationCount++;
            else if (project.stage === 'primary') growingCount++;
            else if (project.stage === 'pending') pendingProjectCount++;
        });

        allCommands?.forEach((cmd) => {
            const itemChars = getTextLength(cmd.content) + getTextLength(cmd.title);
            totalChars += itemChars;
            const timestamp = resolveTimestamp(cmd, ['timestamp', 'createdAt']);
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;
        });

        writingEntries.forEach((entry) => {
            const itemChars = entry.chars;
            totalChars += itemChars;
            writingDocCount += 1;

            const timestamp = entry.timestamp;
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
            writingDocCount,
            blueprintCount: pendingProjectCount + instructionCount
        };
    }, [allProjects, allCommands, writingDocs, writingContent]);
};

export const useChartData = (allProjects, allCommands, writingDocs = [], writingContent = {}) => {
    return useMemo(() => {
        const now = new Date();
        const activeProjects = (allProjects || []).filter((project) => !isWritingProject(project));
        const writingEntries = buildWritingEntries(allProjects, writingDocs, writingContent);

        const getStatsForInterval = (projects, commands, writingData, intervalStart, type) => {
            const result = { words: 0, inspirations: 0 };
            projects?.forEach((item) => {
                const timestamp = resolveTimestamp(item, ['timestamp', 'createdAt']);
                if (isTimestampInInterval(timestamp, intervalStart, type)) {
                    result.words += getTextLength(item.content) + getTextLength(item.note);
                    if (item.stage === 'inspiration') result.inspirations++;
                }
            });
            commands?.forEach((item) => {
                const timestamp = resolveTimestamp(item, ['timestamp', 'createdAt']);
                if (isTimestampInInterval(timestamp, intervalStart, type)) {
                    result.words += getTextLength(item.content) + getTextLength(item.title);
                }
            });
            writingData?.forEach((item) => {
                if (isTimestampInInterval(item.timestamp, intervalStart, type)) {
                    result.words += item.chars;
                }
            });
            return result;
        };

        const daily = eachDayOfInterval({ start: subDays(now, 13), end: now }).map(d => {
            const s = getStatsForInterval(activeProjects, allCommands, writingEntries, d, 'day');
            return { label: format(d, 'MM/dd'), value: s.words, inspirations: s.inspirations };
        });

        const weekly = eachWeekOfInterval({ start: subDays(now, 7 * 7), end: now }, { weekStartsOn: 1 }).map(w => {
            const s = getStatsForInterval(activeProjects, allCommands, writingEntries, w, 'week');
            return { label: format(w, 'MM/dd'), value: s.words, inspirations: s.inspirations };
        });

        const monthly = eachMonthOfInterval({ start: subDays(now, 30 * 5), end: now }).map(m => {
            const s = getStatsForInterval(activeProjects, allCommands, writingEntries, m, 'month');
            return { label: format(m, 'MMM'), value: s.words, inspirations: s.inspirations };
        });

        return { daily, weekly, monthly };
    }, [allProjects, allCommands, writingDocs, writingContent]);
};
