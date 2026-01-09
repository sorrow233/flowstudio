/**
 * Flow Studio 默认模板数据 (中文版)
 * 设计理念：极简、极客、中文原生、注重实效
 */

export const DEFAULT_TEMPLATE = {
    // 灵感作为"使用技巧"展示
    inspirations: [
        {
            id: "tip-001",
            content: "💡 **技巧：** 按下 `Cmd + K` (或 `Ctrl + K`) 可以随时唤起全局指令中心。",
            timestamp: Date.now()
        },
        {
            id: "tip-002",
            content: `🚀 **目标：** 善用"商业化"模块，记录从 $0 到 IPO 的每一个里程碑。`,
            timestamp: Date.now() - 100000
        },
        {
            id: "tip-003",
            content: `🎨 **设计：** 在设置中切换"深色模式"，体验不同的沉浸式工作流。`,
            timestamp: Date.now() - 200000
        }
    ],

    // 默认指令集 - 开发者视角的实用 Prompt
    commands: [
        {
            id: "cmd-code-review",
            title: "🔍 代码审查",
            content: "请帮我审查这段代码：\n1. 潜在的 Bug 和边缘情况\n2. 安全性漏洞\n3. 性能优化建议\n4. 代码风格一致性\n\n请提供具体的重构代码示例。",
            url: "",
            type: "utility",
            category: "development",
            tags: [{ id: "tag-dev", label: "开发", value: "Development" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-generate-docs",
            title: "📝 生成文档",
            content: "# 任务：生成技术文档\n\n分析代码逻辑并生成详细文档，包含：\n- 函数签名与参数说明\n- 使用示例\n- 核心架构决策\n\n输出格式：Markdown",
            url: "",
            type: "utility",
            category: "documentation",
            tags: [{ id: "tag-docs", label: "文档", value: "Documentation" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-bug-fix",
            title: "🐛 Bug 分析",
            content: "我遇到了一个 Bug，上下文如下：\n- 观察到的行为：\n- 预期的行为：\n- 错误日志：\n\n请分析根本原因并提供修复方案。",
            url: "",
            type: "utility",
            category: "debugging",
            tags: [{ id: "tag-debug", label: "调试", value: "Debugging" }],
            createdAt: Date.now()
        },
        {
            id: "cmd-feature-plan",
            title: "📅 功能规划",
            content: "帮我规划 [功能名称] 的实现方案。\n\n请包含：\n1. 核心需求分析\n2. 技术架构设计\n3. 详细的分步实现计划\n4. 验证与测试步骤",
            url: "",
            type: "utility",
            category: "planning",
            tags: [{ id: "tag-plan", label: "产品", value: "Planning" }],
            createdAt: Date.now()
        }
    ],

    pendingProjects: [],

    // 主项目 - 引导用户探索
    primaryProjects: [
        {
            id: "project-guide",
            title: "👋 欢迎使用 Flow Studio",
            desc: "从这里开始，探索构建产品的新方式。",
            score: 5,
            answers: {
                clarity: true,
                dogfood: true,
                impact: true,
                value: true
            },
            foundingReason: "赋能创造者，让想法更快落地。",
            category: "guide",
            graduatedAt: Date.now(),
            subStage: 2, // 进行中
            progress: 30,
            hasHolyGlow: true,
            bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop", // 更极客、科技感的图片

            // 根级别任务 - PrimaryDevModule 读取这个数组
            tasks: [
                {
                    id: 1001,
                    text: "✅ 尝试将此任务标记为完成（点击复选框）",
                    done: false,
                    stage: 1,
                    category: "general"
                },
                {
                    id: 1002,
                    text: "📖 了解核心工作流：灵感 → 孵化 → 执行 → 完成",
                    done: false,
                    stage: 1,
                    category: "general"
                },
                {
                    id: 1003,
                    text: "⌨️ 按 Cmd+K 打开指令中心，试试预置的 Prompt",
                    done: false,
                    stage: 2,
                    category: "general"
                },
                {
                    id: 1004,
                    text: "💰 探索商业化模块，记录你的产品指标",
                    done: false,
                    stage: 3,
                    category: "general"
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
            }
        },
        {
            id: "project-demo",
            title: "🚀 示例：我的第一个产品",
            desc: "一个标准的 Saas 项目结构参考。",
            score: 4,
            answers: {
                clarity: true,
                dogfood: false,
                impact: true,
                value: true
            },
            foundingReason: "解决特定领域的问题。",
            category: "SaaS",
            graduatedAt: Date.now() - 1000000,
            subStage: 1,
            progress: 15,
            bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop", // 代码风格图片
            // 根级别任务
            tasks: [
                {
                    id: 2001,
                    text: "定义核心算法的数据处理流程",
                    done: true,
                    stage: 1,
                    category: "backend"
                },
                {
                    id: 2002,
                    text: "设计用户仪表盘的 UI 原型",
                    done: false,
                    stage: 1,
                    category: "frontend"
                },
                {
                    id: 2003,
                    text: "实现数据可视化图表组件",
                    done: false,
                    stage: 2,
                    category: "frontend"
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
            }
        }
    ],

    customCategories: [
        { id: "cat-dev", name: "开发", color: "blue" },
        { id: "cat-design", name: "设计", color: "pink" },
        { id: "cat-marketing", name: "市场", color: "orange" }
    ]
};
