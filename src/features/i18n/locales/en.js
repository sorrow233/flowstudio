// English language resources
export default {
    // Navigation
    navbar: {
        inspiration: 'Inspiration',
        pending: 'Pending',
        primary: 'Primary',
        advanced: 'Advanced',
        final: 'Final',
        commercial: 'Commercial',
        command: 'Command',
        cloudSync: 'Cloud Sync',
        sync: 'Sync',
        dataManagement: 'Data Management',
    },

    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        confirm: 'Confirm',
        undo: 'Undo',
        copy: 'Copy',
        copied: 'Copied',
        search: 'Search...',
        new: 'New',
        all: 'All',
        allCategories: 'All Categories',
        loading: 'Loading...',
        noData: 'No data',
    },

    // Inspiration Module
    inspiration: {
        title: 'Inspiration',
        subtitle: 'Capture fleeting ideas, fuel your future.',
        placeholder: 'Record a fleeting thought...',
        emptyState: 'No inspirations yet, record your first idea',
        ideaDeleted: 'Idea deleted',
        cmdEnter: 'CMD + ENTER',
    },

    // Pending Module
    pending: {
        title: 'Pending Projects',
        subtitle: 'Project ideas awaiting kickoff',
        emptyState: 'No pending projects',
        addProject: 'Add Project',
        projectName: 'Project Name',
        projectDescription: 'Project Description',
    },

    // Primary Dev Module
    primary: {
        title: 'Primary Dev',
        subtitle: 'Projects currently under active development',
        emptyState: 'No projects in development',
        tasks: 'Tasks',
        progress: 'Progress',
        noTasks: 'No tasks',
        addTask: 'Add Task',
    },

    // Advanced Dev Module
    advanced: {
        title: 'Advanced Dev',
        subtitle: 'Complex projects requiring deeper work',
        emptyState: 'No advanced projects',
    },

    // Final Dev Module
    final: {
        title: 'Final Dev',
        subtitle: 'Projects entering final polish stage',
        emptyState: 'No final stage projects',
        stageOptimization: 'Optimization',
        stageNewModule: 'New Module',
        stageBugFix: 'Bug Fix',
    },

    // Commercial Module
    commercial: {
        title: 'Commercial',
        subtitle: 'Projects ready for market',
        emptyState: 'No commercial projects',
        launchChecklist: 'Launch Checklist',
    },

    // Command Center
    commands: {
        title: 'Command Center',
        subtitle: 'Manage common commands and links in your dev workflow',
        emptyState: 'No commands in this stage',
        emptyStateHint: 'Add a new command or import from library',
        community: 'Community',
        library: 'Library',
        newCommand: 'New',
        deleteConfirmLast: 'Delete this command permanently?',
        deleteConfirmStage: 'Remove command from this stage? (It will remain in others)',
        browseCommunity: 'Browse community shares',
        importFromLibrary: 'Import from Global Library',
        stage: 'Stage',
    },

    // Dev Stages (5 stages)
    devStages: {
        1: {
            label: 'Skeleton',
            title: 'Architectural Blueprint',
            desc: 'Define the structural integrity, routing logic, and component hierarchy.',
        },
        2: {
            label: 'Functionality',
            title: 'Core Mechanics & Logic',
            desc: 'Implement primary business logic, data flows, and state management.',
        },
        3: {
            label: 'Modules',
            title: 'System Integration',
            desc: 'Connect authentication, database bindings, and external API services.',
        },
        4: {
            label: 'Optimization',
            title: 'Performance & Polish',
            desc: 'Refine UI/UX transitions, optimize re-renders, and handle edge cases.',
        },
        5: {
            label: 'Completion',
            title: 'Production Readiness',
            desc: 'Final QA, build verification, and deployment to production.',
        },
    },

    // Final Stages (3 stages)
    finalStages: {
        1: {
            label: 'Optimization',
            title: 'Module Optimization',
            desc: 'Analyze existing implementation, identify bottlenecks, and refine code for better performance and readability.',
        },
        2: {
            label: 'New Module',
            title: 'Feature Append',
            desc: 'Plan and implement new modules or features, ensuring seamless integration with the existing system.',
        },
        3: {
            label: 'Bug Fix',
            title: 'Defect Resolution',
            desc: 'Identify, reproduce, and resolve reported bugs to ensure system stability and reliability.',
        },
    },

    // Stage Empty States
    stageEmptyStates: {
        1: {
            title: "Architect's Blank Canvas",
            desc: 'Begin by defining the core routes and layout components. A strong foundation prevents future debt.',
        },
        2: {
            title: 'Engine Not Started',
            desc: 'The structure is ready. Now, breathe life into it with logic and interactions.',
        },
        3: {
            title: 'Systems Offline',
            desc: 'It is time to connect the isolated modules into a cohesive ecosystem.',
        },
        4: {
            title: 'Rough Around the Edges',
            desc: 'The app works, but it needs that "premium" feel. Focus on details.',
        },
        5: {
            title: 'Pre-Flight Checklist',
            desc: 'You are almost there. Ensure systems are go for launch.',
        },
    },

    // Command Categories
    categories: {
        general: 'General',
        frontend: 'Frontend',
        backend: 'Backend',
        database: 'Database',
        devops: 'DevOps',
        testing: 'Testing',
        final: 'Final',
    },

    // Soul Questions
    questions: {
        clarity: {
            text: 'Can you clearly articulate what you want?',
            sub: 'Clarity',
        },
        dogfood: {
            text: 'Will you use it yourself frequently after building it?',
            sub: 'Dogfooding',
        },
        impact: {
            text: 'Can it change your life in the long term?',
            sub: 'Long-term Impact',
        },
        value: {
            text: 'Do you believe this project can truly help others?',
            sub: 'Altruism',
        },
    },

    // Sync Status
    sync: {
        synced: 'Synced',
        syncing: 'Syncing...',
        offline: 'Offline',
        error: 'Sync Error',
        pending: 'Pending',
    },

    // Auth
    auth: {
        signIn: 'Sign In',
        signOut: 'Sign Out',
        signInWithGoogle: 'Sign in with Google',
    },
};
