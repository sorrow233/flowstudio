export const STORAGE_KEYS = {
    INSPIRATION: 'flowstudio_inspiration_ideas',
    PENDING: 'flowstudio_pending_projects',
    PRIMARY: 'flowstudio_primary_projects',
    FINAL: 'flowstudio_final_projects',
    COMMANDS: 'flowstudio_commands',
};

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

// 额外阶段（不属于主开发流程）
export const EXTRA_STAGES = [
    {
        id: 6,
        label: 'Commercial',
        title: 'Market Readiness',
        desc: 'Final polish, monetization setup, and launch preparation.',
        icon: 'Gem',
        color: 'yellow'
    }
];

export const FINAL_STAGES = [
    {
        id: 1,
        label: 'Optimization',
        title: 'Module Optimization',
        desc: 'Analyze existing implementation, identify bottlenecks, and refine code for better performance and readability.',
    },
    {
        id: 2,
        label: 'New Module',
        title: 'Feature Append',
        desc: 'Plan and implement new modules or features, ensuring seamless integration with the existing system.',
    },
    {
        id: 3,
        label: 'Bug Fix',
        title: 'Defect Resolution',
        desc: 'Identify, reproduce, and resolve reported bugs to ensure system stability and reliability.',
    }
];

export const STAGE_EMPTY_STATES = {
    1: {
        title: 'Architect\'s Blank Canvas',
        desc: 'Begin by defining the core routes and layout components. A strong foundation prevents future debt.'
    },
    2: {
        title: 'Engine Not Started',
        desc: 'The structure is ready. Now, breathe life into it with logic and interactions.'
    },
    3: {
        title: 'Systems Offline',
        desc: 'It is time to connect the isolated modules into a cohesive ecosystem.'
    },
    4: {
        title: 'Rough Around the Edges',
        desc: 'The app works, but it needs that "premium" feel. Focus on details.'
    },
    5: {
        title: 'Pre-Flight Checklist',
        desc: 'You are almost there. Ensure systems are go for launch.'
    },
    6: {
        title: 'Open for Business',
        desc: 'Capitalize on your creation. Setup monetization and growth channels.'
    }
};

export const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const COMMAND_CATEGORIES = [
    { id: 'general', label: 'General', color: 'bg-slate-400 text-white', icon: 'LayoutGrid' },
    { id: 'frontend', label: 'Frontend', color: 'bg-blue-400 text-white', icon: 'Monitor' },
    { id: 'backend', label: 'Backend', color: 'bg-emerald-400 text-white', icon: 'Server' },
    { id: 'database', label: 'Database', color: 'bg-amber-400 text-white', icon: 'Database' },
    { id: 'devops', label: 'DevOps', color: 'bg-violet-400 text-white', icon: 'Container' },
    { id: 'testing', label: 'Testing', color: 'bg-rose-400 text-white', icon: 'Beaker' },
    { id: 'final', label: 'Final', color: 'bg-zinc-700 text-white', icon: 'Flag' },
];

export const DEFAULT_PROJECT_IMAGES = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Tech Dark
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Circuit
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', // Cyberpunk
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop', // Mountain
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',  // Nature
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', // Mountains Basic
    'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?q=80&w=2070&auto=format&fit=crop'  // Abstract
];

export const getRandomProjectImage = () => {
    return DEFAULT_PROJECT_IMAGES[Math.floor(Math.random() * DEFAULT_PROJECT_IMAGES.length)];
};

// 灵魂四问 (Soul Questions)
export const QUESTIONS = [
    {
        id: 'clarity',
        text: '你是否能够清晰地表达自己究竟想要什么？',
        sub: '清晰度'
    },
    {
        id: 'dogfood',
        text: '开发出来之后，你自己也会经常用它吗？',
        sub: '自用需求'
    },
    {
        id: 'impact',
        text: '它能在未来长期改变你的生活吗？',
        sub: '长期价值'
    },
    {
        id: 'value',
        text: '你是否相信这个项目能够真正帮助到大家？',
        sub: '利他之心'
    },
];
