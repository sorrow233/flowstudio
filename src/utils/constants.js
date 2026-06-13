export const DEV_STAGES = [
    {
        id: 1,
        label: 'Skeleton',
        title: 'Architectural Blueprint',
        desc: 'Define the structural integrity, routing logic, and component hierarchy.',
    },
    {
        id: 2,
        label: 'Functionality',
        title: 'Core Mechanics & Logic',
        desc: 'Implement primary business logic, data flows, and state management.',
    },
    {
        id: 3,
        label: 'Modules',
        title: 'System Integration',
        desc: 'Connect authentication, database bindings, and external API services.',
    },
    {
        id: 4,
        label: 'Optimization',
        title: 'Performance & Polish',
        desc: 'Refine UI/UX transitions, optimize re-renders, and handle edge cases.',
    },
    {
        id: 5,
        label: 'Completion',
        title: 'Production Readiness',
        desc: 'Final QA, build verification, and deployment to production.',
    }
];

export const COMMAND_CATEGORIES = [
    { id: 'general', label: 'General', color: 'bg-slate-400 text-white', textColor: 'text-slate-400', icon: 'LayoutGrid' },
    { id: 'frontend', label: 'Life', color: 'bg-blue-400 text-white', textColor: 'text-blue-400', icon: 'Heart' },
    { id: 'backend', label: 'Work', color: 'bg-emerald-400 text-white', textColor: 'text-emerald-400', icon: 'Briefcase' },
    { id: 'database', label: 'Finance', color: 'bg-amber-400 text-white', textColor: 'text-amber-400', icon: 'Wallet' },
    { id: 'devops', label: 'Health', color: 'bg-violet-400 text-white', textColor: 'text-violet-400', icon: 'Activity' },
    { id: 'testing', label: 'Travel', color: 'bg-rose-400 text-white', textColor: 'text-rose-400', icon: 'Plane' },
];

// Inspiration 页面分类配置
export const INSPIRATION_CATEGORIES = [
    { id: 'note', label: '随记', color: 'bg-pink-400', dotColor: 'bg-pink-400', textColor: 'text-pink-400' },
    { id: 'todo', label: '代办', color: 'bg-blue-400', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
    { id: 'emotion', label: '情绪', color: 'bg-violet-400', dotColor: 'bg-violet-400', textColor: 'text-violet-400' },
];
