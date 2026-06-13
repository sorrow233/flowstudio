import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
    getTextLength,
    isTimestampInInterval,
    resolveTimestamp
} from './dataCenterUtils';

export const useDataCenterStats = (allProjects, allCommands) => {
    return useMemo(() => {
        let totalChars = 0;
        let inspirationCount = 0;
        let instructionCount = allCommands?.length || 0;
        let todayChars = 0;
        let thisWeekChars = 0;

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        (allProjects || []).forEach((project) => {
            const itemChars = getTextLength(project.content) + getTextLength(project.note);
            totalChars += itemChars;
            const timestamp = resolveTimestamp(project, ['timestamp', 'createdAt']);
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;

            if (project.stage === 'inspiration') inspirationCount++;
        });

        allCommands?.forEach((cmd) => {
            const itemChars = getTextLength(cmd.content) + getTextLength(cmd.title);
            totalChars += itemChars;
            const timestamp = resolveTimestamp(cmd, ['timestamp', 'createdAt']);
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;
        });

        return {
            totalChars,
            todayChars,
            thisWeekChars,
            inspirationCount,
            instructionCount,
            blueprintCount: instructionCount
        };
    }, [allProjects, allCommands]);
};

export const useChartData = (allProjects, allCommands) => {
    return useMemo(() => {
        const now = new Date();

        const getStatsForInterval = (projects, commands, intervalStart, type) => {
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
            return result;
        };

        const daily = eachDayOfInterval({ start: subDays(now, 13), end: now }).map(d => {
            const s = getStatsForInterval(allProjects, allCommands, d, 'day');
            return { label: format(d, 'MM/dd'), value: s.words, inspirations: s.inspirations };
        });

        const weekly = eachWeekOfInterval({ start: subDays(now, 7 * 7), end: now }, { weekStartsOn: 1 }).map(w => {
            const s = getStatsForInterval(allProjects, allCommands, w, 'week');
            return { label: format(w, 'MM/dd'), value: s.words, inspirations: s.inspirations };
        });

        const monthly = eachMonthOfInterval({ start: subDays(now, 30 * 5), end: now }).map(m => {
            const s = getStatsForInterval(allProjects, allCommands, m, 'month');
            return { label: format(m, 'MMM'), value: s.words, inspirations: s.inspirations };
        });

        return { daily, weekly, monthly };
    }, [allProjects, allCommands]);
};
