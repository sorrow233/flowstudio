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
        title: 'Core Skeleton Implementation',
        desc: 'Build the fundamental structure, routing, and component architecture.',
        // icon: Layers - Icons need to be handled in component due to JSX
    },
    {
        id: 2,
        label: 'Functionality',
        title: 'Core Functions Running',
        desc: 'Implement main features and ensure critical paths are working.',
    },
    {
        id: 3,
        label: 'Stability',
        title: 'No Major Bugs',
        desc: 'Rigorous testing of core flows. Zero critical issues allowed.',
    },
    {
        id: 4,
        label: 'Optimization',
        title: 'Optimization & Polish',
        desc: 'Refine UI/UX, improve performance, and clean up code.',
    },
    {
        id: 5,
        label: 'Completion',
        title: 'Original Intent Met',
        desc: 'Project fulfills its original vision and is ready for next steps.',
    }
];

export const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const COMMAND_CATEGORIES = [
    { id: 'general', label: 'General', color: 'bg-gray-100 text-gray-600' },
    { id: 'frontend', label: 'Frontend', color: 'bg-blue-50 text-blue-600' },
    { id: 'backend', label: 'Backend', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'database', label: 'Database', color: 'bg-amber-50 text-amber-600' },
    { id: 'devops', label: 'DevOps', color: 'bg-purple-50 text-purple-600' },
    { id: 'testing', label: 'Testing', color: 'bg-rose-50 text-rose-600' },
];
