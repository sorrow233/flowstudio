// English language resources
export default {
    // Navigation
    navbar: {
        inspiration: 'Inspiration',
        pending: 'Pending',
        primary: 'Development',
        advanced: 'Advanced',
        final: 'Modules',
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
        profile: 'Profile',
        all: 'All',
        allCategories: 'All Categories',
        loading: 'Loading...',
        noData: 'No data',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
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
        title: 'Development',
        subtitle: 'Projects currently under active development',
        emptyState: 'No projects in development',
        tasks: 'Tasks',
        progress: 'Progress',
        noTasks: 'No tasks',
        addTask: 'Add Task',
    },

    // Advanced Refinement (formerly Final)
    advanced: {
        title: 'Advanced Refinement',
        subtitle: 'Deep performance optimization and experience polishing beyond the core.',
        emptyState: 'No advanced projects',
        stageOptimization: 'Low-level Optimization',
        stageNewModule: 'Module Evolution',
        stageBugFix: 'Deep Debugging',
        createProject: 'New Project',
        projectName: 'Project Name...',
        create: 'Create',
        total: 'TOTAL',
        noProjectsTitle: 'No Advanced Projects',
        noProjectsDesc: 'Create a project to start optimization and polishing',
        createFirst: '+ Create First Project',
        newProjectDefaultTitle: 'New Advanced Project',
        newProjectDefaultDesc: 'Optimization, features & fixes',
    },

    // Final Dev (Renamed to Modules)
    final: {
        title: 'Modules',
        subtitle: 'Global view of project modules and architecture.',
        emptyState: 'No modular projects',
    },

    // Commercial Module
    commercial: {
        title: 'Commercial',
        subtitle: 'Projects ready for market',
        emptyState: 'No commercial projects',
        launchChecklist: 'Launch Checklist',
        strategy: 'Commercial Strategy',
        strategyDesc: 'Design the economic engine. Price your value, choose your rails, and prepare for launch.',
        strategyReadyDesc: 'Launch systems verified. Focus shifting to Growth Engine and User Acquisition.',
        copyDirective: 'Copy Operational Directive',
        project: 'Project',
        noProjectsTitle: 'No Commercial Projects',
        noProjectsDesc: 'Graduate a project from Primary Development to unlock strategies.',
        financialInfrastructure: '1. Financial Infrastructure',
        revenueModel: '2. Revenue Model',
        pricingStructure: '3. Pricing Structure',
        growthPhase: 'Growth Phase Active',
        growthTitle: 'Your Engine is Ready.',
        growthSubtitle: 'It\'s time to acquire users.',
        growthDesc: 'Infrastructure is set. Financial rails are connected. Your strategy is now focused purely on distribution and channel optimization.',
        activeChannels: 'Active Channels',
        launchReadiness: 'Launch Readiness',
        readiness: 'Readiness',
        models: {
            subscription: 'Subscription (SaaS)',
            subscriptionDesc: 'Recurring via monthly/yearly plans.',
            one_time: 'One-Time Purchase',
            one_timeDesc: 'Single payment for lifetime.',
            freemium: 'Freemium',
            freemiumDesc: 'Free core, paid upgrades.',
            ads: 'Ad-Supported',
            adsDesc: 'Monetized via advertisements.',
        },
        payment: {
            stripe: 'Stripe',
            stripeDesc: 'Standard for custom SaaS.',
            lemonsqueezy: 'Lemon Squeezy',
            lemonsqueezyDesc: 'MoR, handles tax globally.',
            paddle: 'Paddle',
            paddleDesc: 'Unified B2B billing.',
            revenuecat: 'RevenueCat',
            revenuecatDesc: 'Best for In-App Purchases.',
        },
        marketing: {
            twitter: 'X / Twitter',
            producthunt: 'Product Hunt',
            reddit: 'Reddit',
            linkedin: 'LinkedIn',
            seo: 'SEO & Blog',
            short_video: 'TikTok / Reels',
            ads: 'Paid Ads',
        },
        checklist: {
            market_fit: 'Problem-Solution Fit Confirmed',
            waitlist: 'Waitlist Landing Page Live',
            pricing: 'Pricing Model Finalized',
            legal: 'Terms & Privacy Policy',
            analytics: 'Analytics & Tracking Setup',
            payments: 'Payment Gateway Connected',
        },
        pricingTiers: {
            personal: 'Personal',
            pro: 'Pro',
            enterprise: 'Enterprise',
            custom: 'Custom',
            features: {
                core: 'Core Features',
                community: 'Community Support',
                everything: 'Everything in Free',
                priority: 'Priority Support',
                analytics: 'Advanced Analytics',
                sso: 'SSO & Security',
                manager: 'Dedicated Manager',
            }
        },
        directive: {
            title: 'Commercial Operations Directive',
            model: '1. Business Model',
            type: 'Type',
            desc: 'Description',
            pricing: 'Pricing',
            infrastructure: '2. Financial Infrastructure',
            provider: 'Provider',
            rationale: 'Rationale',
            growth: '3. Growth Engine',
            channels: 'Active Channels',
            readiness: '4. Launch Readiness',
            generated: 'Generated via Flow Studio Commercial Module',
            notSelected: 'Not Selected',
            tbd: 'TBD',
            pending: 'Pending Selection',
            none: 'None Selected',
        }
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
        // Profile related
        profileName: 'Profile Name',
        addProfile: 'Add Profile',
        editProfile: 'Edit Profile',
        deleteProfile: 'Delete Profile',
        deleteProfileConfirm: 'Delete this profile? Commands will remain in storage.',
        // Library related
        globalLibrary: 'Global Command Library',
        importFromOther: 'Import from other stages/profiles',
        noImportable: 'No commands available to import',
        noImportableHint: 'Only Utility and Link types can be shared globally',
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
