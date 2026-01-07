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
];
