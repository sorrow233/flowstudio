import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
    getTextLength,
    isTimestampInInterval,
    resolveTimestamp
} from './dataCenterUtils';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * ONE_DAY;

const isTodoProject = (project = {}) => (
    (project.stage || 'inspiration') === 'inspiration'
    && (project.category || 'note') === 'todo'
);

const isCompleted = (project = {}) => {
    const value = project.completed;
    return value === true || value === 1 || value === '1' || value === 'true';
};

const normalizeAiClass = (project = {}) => {
    const value = project.aiAssistClass || 'unclassified';
    if (value === 'ai_high' || value === 'ai_mid') return 'ai_involved';
    if (value === 'self') return 'user_done';
    if (value === 'ai_done' || value === 'ai_involved' || value === 'user_done') return value;
    return 'unclassified';
};

const normalizeConflictClass = (project = {}) => {
    const value = project.conflictClass || project.aiAssistClass || 'conflict_unclassified';
    if (value === 'major_conflict' || value === 'minor_conflict') return value;
    return 'conflict_unclassified';
};

const ratio = (value, total) => (total > 0 ? (value / total) * 100 : 0);

const buildTodoStats = (allProjects = []) => {
    const now = Date.now();
    const todos = allProjects.filter(isTodoProject);
    const stats = {
        total: todos.length,
        pending: 0,
        completed: 0,
        todayCreated: 0,
        thisWeekCreated: 0,
        completionRate: 0,
        ai: {
            aiDone: 0,
            aiInvolved: 0,
            userDone: 0,
            unclassified: 0,
        },
        conflict: {
            major: 0,
            minor: 0,
            unclassified: 0,
            majorRatio: 0,
            minorRatio: 0,
        },
    };

    todos.forEach((todo) => {
        if (isCompleted(todo)) {
            stats.completed += 1;
        } else {
            stats.pending += 1;
        }

        const timestamp = resolveTimestamp(todo, ['createdAt', 'timestamp']);
        if (timestamp > 0 && now - timestamp < ONE_DAY) stats.todayCreated += 1;
        if (timestamp > 0 && now - timestamp < ONE_WEEK) stats.thisWeekCreated += 1;

        const aiClass = normalizeAiClass(todo);
        if (aiClass === 'ai_done') stats.ai.aiDone += 1;
        else if (aiClass === 'ai_involved') stats.ai.aiInvolved += 1;
        else if (aiClass === 'user_done') stats.ai.userDone += 1;
        else stats.ai.unclassified += 1;

        const conflictClass = normalizeConflictClass(todo);
        if (conflictClass === 'major_conflict') stats.conflict.major += 1;
        else if (conflictClass === 'minor_conflict') stats.conflict.minor += 1;
        else stats.conflict.unclassified += 1;
    });

    const conflictTotal = stats.conflict.major + stats.conflict.minor;
    stats.completionRate = ratio(stats.completed, stats.total);
    stats.conflict.majorRatio = ratio(stats.conflict.major, conflictTotal);
    stats.conflict.minorRatio = ratio(stats.conflict.minor, conflictTotal);

    return stats;
};

export const useDataCenterStats = (allProjects, allCommands) => {
    return useMemo(() => {
        let totalChars = 0;
        let inspirationCount = 0;
        let instructionCount = allCommands?.length || 0;
        let todayChars = 0;
        let thisWeekChars = 0;

        const now = Date.now();

        (allProjects || []).forEach((project) => {
            const itemChars = getTextLength(project.content) + getTextLength(project.note);
            totalChars += itemChars;
            const timestamp = resolveTimestamp(project, ['timestamp', 'createdAt']);
            if (now - timestamp < ONE_DAY) todayChars += itemChars;
            if (now - timestamp < ONE_WEEK) thisWeekChars += itemChars;

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
            blueprintCount: instructionCount,
            todoStats: buildTodoStats(allProjects || [])
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
