import { useMemo } from 'react';
import { format, isSameDay, isSameWeek, isSameMonth, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

export const useDataCenterStats = (allProjects, allCommands) => {
    return useMemo(() => {
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

        allProjects?.forEach(project => {
            const itemChars = (project.content?.length || 0) + (project.note?.length || 0);
            totalChars += itemChars;
            const timestamp = project.timestamp || project.createdAt || 0;
            if (now - timestamp < oneDay) todayChars += itemChars;
            if (now - timestamp < oneWeek) thisWeekChars += itemChars;

            if (project.stage === 'inspiration') inspirationCount++;
            else if (project.stage === 'primary') growingCount++;
            else if (project.stage === 'pending') pendingProjectCount++;
        });

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
};

export const useChartData = (allProjects, allCommands) => {
    return useMemo(() => {
        const now = new Date();
        const getStatsForInterval = (projects, commands, intervalStart, type) => {
            const result = { words: 0, inspirations: 0 };
            projects?.forEach(item => {
                const ts = new Date(item.timestamp || item.createdAt || 0);
                let match = false;
                if (type === 'day') match = isSameDay(ts, intervalStart);
                else if (type === 'week') match = isSameWeek(ts, intervalStart);
                else if (type === 'month') match = isSameMonth(ts, intervalStart);

                if (match) {
                    result.words += (item.content?.length || 0) + (item.note?.length || 0);
                    if (item.stage === 'inspiration') result.inspirations++;
                }
            });
            commands?.forEach(item => {
                const ts = new Date(item.timestamp || item.createdAt || 0);
                let match = false;
                if (type === 'day') match = isSameDay(ts, intervalStart);
                else if (type === 'week') match = isSameWeek(ts, intervalStart);
                else if (type === 'month') match = isSameMonth(ts, intervalStart);
                if (match) result.words += (item.content?.length || 0) + (item.title?.length || 0);
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
