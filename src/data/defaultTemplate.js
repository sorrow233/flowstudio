/**
 * Flow Studio Default Template
 * 
 * This file contains the initial data seeded for new users.
 * It serves as both an onboarding guide and a demonstration of capabilities.
 * 
 * Designed to be:
 * 1. Educational: Teaches users how to use the app
 * 2. Visual: Showcases the UI potential
 * 3. Functional: Provides immediately useful AI commands
 */

export const DEFAULT_TEMPLATE = {
    // 灵感作为"Tips"展示
    inspirations: [
        {
            id: "tip-001",
            content: "💡 **Pro Tip:** Press `Cmd + K` (or `Ctrl + K`) to open the Command Palette instantly from anywhere.",
            timestamp: Date.now()
        },
        {
            id: "tip-002",
            content: "🚀 **Goal:** Use the 'Commercial' tab in project details to track your product's monetization journey from $0 to IPO.",
            timestamp: Date.now() - 100000
        },
        {
            id: "tip-003",
            content: "🎨 **Design:** Try switching between Light and Dark mode in the settings to see how the interface adapts.",
            timestamp: Date.now() - 200000
        }
    ],

    // 默认指令集 - 实用且强大的 AI Prompts
    commands: [
        {
            id: "cmd-code-review",
            title: "🔍 Code Review",
            content: "Please review the attached code for:\n1. Potential bugs and edge cases\n2. Security vulnerabilities\n3. Performance optimizations\n4. Code style consistency\n\nProvide specific refactoring suggestions with code blocks.",
            url: "",
            type: "utility",
            category: "development",
            tags: [{ id: "tag-dev", label: "Dev", value: "Development" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-generate-docs",
            title: "📝 Generate Documentation",
            content: "# Task: Generate Documentation\n\nAnalyze the code logic and generate comprehensive documentation including:\n- Function signatures and parameters\n- Usage examples\n- Key architectural decisions\n\nOutput format: Markdown",
            url: "",
            type: "utility",
            category: "documentation",
            tags: [{ id: "tag-docs", label: "Docs", value: "Documentation" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-bug-fix",
            title: "🐛 Bug Analysis",
            content: "I am encountering a bug. Here is the context:\n- Behavior observed:\n- Behavior expected:\n- Error logs:\n\nPlease analyze the root cause and propose a fix.",
            url: "",
            type: "utility",
            category: "debugging",
            tags: [{ id: "tag-debug", label: "Debug", value: "Debugging" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-feature-plan",
            title: "📅 Feature Planning",
            content: "Help me plan the implementation of [Feature Name].\n\nBreak it down into:\n1. Core Requirements\n2. Technical Architecture\n3. Step-by-step Implementation Plan\n4. Verification Steps",
            url: "",
            type: "utility",
            category: "planning",
            tags: [{ id: "tag-plan", label: "Product", value: "Planning" }],
            createdAt: Date.now()
        }
    ],

    pendingProjects: [],

    // 主项目 - 用作产品导览
    primaryProjects: [
        {
            id: "project-welcome",
            title: "👋 Welcome to Flow Studio",
            desc: "Start here! A quick tour of your new operating system for shipping products.",
            score: 5,
            answers: {
                clarity: true,
                dogfood: true,
                impact: true,
                value: true
            },
            foundingReason: "To help you build better products, faster.",
            category: "guide",
            graduatedAt: Date.now(),
            subStage: 2, // In Progress
            progress: 35,
            hasHolyGlow: true, // Specifically highlighted
            bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",

            // 模块作为教程章节
            modules: [
                {
                    id: "mod-001",
                    name: "1. The Workflow",
                    description: "Flow Studio is organized into stages: Inspiration -> Prototype -> MVP -> Scale. Move your projects through these stages as they mature.",
                    category: "Guide",
                    priority: "High",
                    stage: 1,
                    progress: 100,
                    tasks: [
                        {
                            id: 1001,
                            text: "Try moving this task to 'Done'",
                            done: false,
                            stage: 1
                        }
                    ]
                },
                {
                    id: "mod-002",
                    name: "2. The Command Center",
                    description: "Your AI-powered knowledge base. Store prompts, snippets, and resources here. Access them globally with Spotlight.",
                    category: "Core",
                    priority: "High",
                    stage: 2,
                    progress: 50,
                    tasks: []
                },
                {
                    id: "mod-003",
                    name: "3. Commercial Module",
                    description: "Track your product's business health. From waitlist signups to MRR, keep your eyes on the metrics that matter.",
                    category: "Feature",
                    priority: "Medium",
                    stage: 1,
                    progress: 0,
                    tasks: []
                }
            ],

            commercial: {
                model: "subscription",
                proPrice: "29",
                marketingChannels: ["Twitter", "Product Hunt"],
                checklist: {
                    market_fit: true,
                    waitlist: false,
                    pricing: true,
                    legal: false,
                    analytics: false,
                    payments: false
                },
                paymentProvider: "stripe"
            },
            tasks: []
        },
        {
            id: "project-example",
            title: "🚀 My First Startup",
            desc: "An example project structure to inspire your next big idea.",
            score: 4,
            answers: {
                clarity: true,
                dogfood: false,
                impact: true,
                value: true
            },
            category: "biotech",
            graduatedAt: Date.now() - 1000000,
            subStage: 1,
            progress: 15,
            bgImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2670&auto=format&fit=crop",
            modules: [
                {
                    id: "mod-ex-001",
                    name: "Core Algorithm",
                    description: "The main processing engine for the data analysis pipeline.",
                    category: "Backend",
                    priority: "High",
                    stage: 2,
                    progress: 60,
                    tasks: []
                },
                {
                    id: "mod-ex-002",
                    name: "User Dashboard",
                    description: "Frontend interface for users to visualize their data.",
                    category: "Frontend",
                    priority: "Medium",
                    stage: 1,
                    progress: 20,
                    tasks: []
                }
            ],
            commercial: {
                model: "usage_based",
                checklist: {
                    market_fit: false,
                    waitlist: true,
                    pricing: false,
                    legal: false,
                    analytics: true,
                    payments: false
                }
            },
            tasks: []
        }
    ],

    customCategories: [
        { id: "cat-dev", name: "Development", color: "blue" },
        { id: "cat-design", name: "Design", color: "pink" },
        { id: "cat-marketing", name: "Marketing", color: "orange" }
    ]
};
