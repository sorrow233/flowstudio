const RECENT_IDEA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const toSafeTimestamp = (timestamp) => {
    const value = Number(timestamp);
    return Number.isFinite(value) && value > 0 ? value : Date.now();
};

const getWeekRange = (timestamp) => {
    const date = new Date(toSafeTimestamp(timestamp));
    const weekStart = new Date(date.getTime());
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart.getTime());
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
        start: weekStart,
        end: weekEnd,
        key: weekStart.getTime(),
    };
};

const getWeekLabel = (weekStart) => {
    const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
    const weekNum = Math.ceil((weekStart.getDate() + monthStart.getDay() - 1) / 7);
    const weekNames = ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周'];
    return weekNames[weekNum - 1] || `${weekNum}周`;
};

export const splitIdeasByRecencyAndWeek = (ideas = [], now = Date.now()) => {
    const recentIdeas = [];
    const weekGroupMap = new Map();

    ideas.forEach((idea) => {
        const timestamp = toSafeTimestamp(idea?.timestamp);
        if (now - timestamp < RECENT_IDEA_WINDOW_MS) {
            recentIdeas.push(idea);
            return;
        }

        const week = getWeekRange(timestamp);
        if (!weekGroupMap.has(week.key)) {
            weekGroupMap.set(week.key, {
                ...week,
                ideas: [],
            });
        }
        weekGroupMap.get(week.key).ideas.push(idea);
    });

    return {
        recentIdeas,
        weeklyIdeaGroups: Array.from(weekGroupMap.values()).sort((a, b) => b.start - a.start),
    };
};

export const groupTodoIdeasByDay = (ideas = []) => {
    const groups = new Map();

    ideas.forEach((idea) => {
        const date = new Date(toSafeTimestamp(idea?.timestamp));
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!groups.has(dateKey)) {
            groups.set(dateKey, {
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                dateKey,
                ideas: [],
            });
        }

        groups.get(dateKey).ideas.push(idea);
    });

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            ideas: [...group.ideas].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
        }))
        .filter((group) => group.ideas.length > 0)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const buildGroupedWeekNavigation = (ideas = []) => {
    const weekGroups = splitIdeasByRecencyAndWeek(ideas).weeklyIdeaGroups;
    const groups = {};

    weekGroups.forEach((week) => {
        const year = week.start.getFullYear();
        const month = week.start.getMonth() + 1;

        if (!groups[year]) groups[year] = {};
        if (!groups[year][month]) groups[year][month] = [];

        groups[year][month].push({
            ...week,
            label: getWeekLabel(week.start),
        });
    });

    return Object.entries(groups)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([year, months]) => ({
            year,
            months: Object.entries(months)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([month, weeks]) => ({
                    month,
                    weeks: weeks.sort((a, b) => b.key - a.key),
                })),
        }));
};

export const formatTodoDayLabel = (date, now = new Date()) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - targetDay) / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    }
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};
