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
        title: 'Architectural Foundation',
        desc: 'Establish the core routing, layout structure, and component hierarchy.',
    },
    {
        id: 2,
        label: 'Functionality',
        title: 'Core Mechanics',
        desc: 'Implement primary business logic, data flows, and interactive elements.',
    },
    {
        id: 3,
        label: 'Modules',
        title: 'Ecosystem Expansion',
        desc: 'Integrate authentication, database bindings, and external services.',
    },
    {
        id: 4,
        label: 'Optimization',
        title: 'Polish & Performance',
        desc: 'Refine UI/UX, optimize rendering, and resolve edge cases.',
    },
    {
        id: 5,
        label: 'Completion',
        title: 'Golden Master',
        desc: 'Final verification, production readiness, and launch.',
    }
];

export const STAGE_EMPTY_STATES = {
    1: {
        title: 'Lay the Foundation',
        desc: 'Every great app starts with a solid skeleton. Define your routes and basic layout.'
    },
    2: {
        title: 'Breathe Life into It',
        desc: 'Make it move. Implement the core interactions and logic.'
    },
    3: {
        title: 'Connect the Dots',
        desc: 'It is time to expand. Add login, database connections, and sync features.'
    },
    4: {
        title: 'Smooth the Edges',
        desc: 'Perfection is in the details. Fix bugs, improve animations, and polish.'
    },
    5: {
        title: 'Ready for Liftoff',
        desc: 'The final countdown. Verify everything is go for launch.'
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
    { id: 'general', label: 'General', color: 'bg-gray-100 text-gray-600', icon: 'LayoutGrid' },
    { id: 'frontend', label: 'Frontend', color: 'bg-blue-50 text-blue-600', icon: 'Monitor' },
    { id: 'backend', label: 'Backend', color: 'bg-emerald-50 text-emerald-600', icon: 'Server' },
    { id: 'database', label: 'Database', color: 'bg-amber-50 text-amber-600', icon: 'Database' },
    { id: 'devops', label: 'DevOps', color: 'bg-purple-50 text-purple-600', icon: 'Container' },
    { id: 'testing', label: 'Testing', color: 'bg-rose-50 text-rose-600', icon: 'Beaker' },
];
