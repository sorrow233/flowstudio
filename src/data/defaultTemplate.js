/**
 * Flow Studio 默认模板数据
 * 这是新用户首次进入时看到的默认示例项目和指令
 * 基于 flowstudio-backup-2026-01-09.json，已清理敏感数据
 */

export const DEFAULT_TEMPLATE = {
    pendingProjects: [],
    primaryProjects: [
        {
            id: "77af0900-27da-448d-b245-f1dc1e013418",
            title: "Flow Studio",
            desc: "一句话描述这个创想...",
            score: 4,
            answers: {
                clarity: true,
                dogfood: true,
                impact: true,
                value: true
            },
            foundingReason: "是的",
            category: "frontend",
            graduatedAt: 1767885901060,
            subStage: 6,
            progress: 0,
            tasks: [],
            hasHolyGlow: true,
            bgImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
            modules: [
                {
                    id: "2ad525f1-02df-4fe4-9163-14002b71c1e9",
                    name: "User Preferences & Settings",
                    description: "Centralized management for user-specific configurations, interface themes, and account personalization options.",
                    category: "Feature",
                    priority: "Medium",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "be231fdb-3b70-423e-bc95-4469b7c2157b",
                    name: "Global Search Indexer",
                    description: "Advanced indexing logic to power the Spotlight component, enabling rapid discovery of commands, projects, and assets.",
                    category: "Core",
                    priority: "High",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "8e71057e-94a3-4966-8b7f-e9513859abb5",
                    name: "Asset Management Service",
                    description: "Handles the secure upload, storage, optimization, and retrieval of media files and project attachments.",
                    category: "Backend",
                    priority: "Medium",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "10f04ed2-c639-45fc-a933-0f448c086c7d",
                    name: "Team Collaboration Engine",
                    description: "Manages shared workspaces, granular permissions, and real-time user presence beyond basic synchronization.",
                    category: "Feature",
                    priority: "High",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "4d6f0649-3cb4-4d06-9b48-f23781764333",
                    name: "Audit & Activity Logger",
                    description: "Persists a history of user actions to support persistent undo/redo states and security auditing.",
                    category: "Security",
                    priority: "Low",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "81f2fccf-f398-4078-8dba-15d8f2a7cc5f",
                    name: "Subscription & Billing Gateway",
                    description: "Integration interface for payment processors to manage access rights for the Commercial lifecycle module.",
                    category: "Integration",
                    priority: "High",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "6b4b8145-50b7-4af3-88f2-d0cb5238a1aa",
                    name: "Notification Dispatcher",
                    description: "System for routing in-app alerts and external notifications triggered by project lifecycle events.",
                    category: "Feature",
                    priority: "Medium",
                    stage: 1,
                    progress: 0,
                    tasks: []
                }
            ],
            commercial: {
                model: "ads",
                proPrice: "5",
                marketingChannels: [],
                checklist: {
                    market_fit: false,
                    waitlist: false,
                    pricing: false,
                    legal: false,
                    analytics: false,
                    payments: false
                },
                paymentProvider: "revenuecat"
            }
        },
        {
            id: "cc1cbf7f-baf2-4c1f-a307-deeb315e4579",
            title: "你好",
            desc: "一句话描述这个创想...",
            score: 4,
            answers: {
                clarity: true,
                dogfood: true,
                impact: true,
                value: true
            },
            graduatedAt: 1767813096190,
            subStage: 2,
            progress: 0,
            tasks: [
                {
                    id: 1767858895078,
                    text: "多步骤确保代码完善",
                    done: true,
                    isCommand: true,
                    commandContent: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化功能.确保第一版交给用户的就是一个能够看的页面",
                    commandUrl: "",
                    commandId: "7a86a132-162c-4412-abed-105360ec3f62",
                    commandType: "utility",
                    commandTags: [
                        {
                            id: "359627e4-4aac-4b45-bf12-84eb9de1585f",
                            label: "最近Function",
                            value: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化最近你增加的功能.确保第一版交给用户的就是一个能够使用和完善的功能。"
                        },
                        {
                            id: "ae791c1f-db06-4fcf-8159-5a26d0c36987",
                            label: "这次 Function",
                            value: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化这次你增加的功能.确保第一版交给用户的就是一个能够使用和完善的功能。"
                        }
                    ],
                    stage: 1
                },
                {
                    id: 1767860747078,
                    text: "生成文档指令",
                    done: true,
                    isCommand: true,
                    commandContent: "# Task: Update Documentation Module\n**Target File:** `[INSERT_DOC_FILE_PATH]` (e.g., @docs/auth_module.md)\n\n**Instructions:**\n1. **Load Context:** Read the existing target file FIRST. Then read the current source code and `git diff` for this specific module.\n2. **In-Place Update:** Do NOT rewrite from scratch. Do NOT append to the end.\n   - **Identify** discrepancies between the doc and the code.\n   - **Modify** only the outdated sections directly.\n   - **Delete** any logic that no longer exists in the code.\n   - **Keep** the original formatting and structure strictly.\n\n**Output:** Return the *entire* updated markdown file content.\ndocs\n\n1、应该细致到每一个函数的复制的功能\n2、应该细致到用户用的色彩的数据，应该细致到每一个页面的每一个功能是怎么样搭建起来的\n3、用中文写\n4、要明确开一个文档总结整个代码库的功能，明确提到每个最细微的设计，并且解释好用户为什么要这样写这个功能",
                    commandUrl: "",
                    commandId: "bda3bd55-8dbd-48bf-823c-36c4ea1038e0",
                    commandType: "utility",
                    commandTags: [],
                    stage: 4
                },
                {
                    id: 1767858992921,
                    text: "撤回模块",
                    done: true,
                    isCommand: true,
                    commandContent: `技术路径： 利用 Yjs 自带的 Y.UndoManager。\n理由： 既然你的同步模块（1.4）已经基于 CRDT，直接使用其原生的撤回管理器是最稳妥的。它能自动处理多端冲突（如你在 MacBook Air 上撤回时，iPad Pro 上的内容也会同步回滚），不会破坏数据一致性。\n设计实现：\n作用域隔离： 不要建立一个全局死板的撤回栈。应为不同的核心领域分别建立独立的 UndoManager。\n场景： 你在“一个模块”误改了一个操作，撤回操作不应影响其他模块的操作\n\n2、撤回应支持“多步回溯”。不能只让用户撤回一次操作，此外应该还要有复原的逻辑`,
                    commandUrl: "",
                    commandId: "f15ea629-d553-4039-b869-f8f1bb1123f6",
                    commandType: "utility",
                    commandTags: [],
                    stage: 3
                }
            ],
            bgImage: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop",
            modules: [
                {
                    id: "995a17bd-e2fd-4100-9b6c-8e23f9ed4260",
                    name: "Landing Module",
                    description: "Public-facing marketing pages featuring visual heroes, infinite demos, and core concept introductions.",
                    category: "前端",
                    priority: "Medium",
                    stage: 1,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "6eccc224-332e-4c0f-b93d-04d2c9ced385",
                    name: "Board Editor Core",
                    description: "The central infinite canvas engine handling viewport manipulation, zooming, and interaction logic.",
                    category: "核心",
                    priority: "High",
                    stage: 3,
                    progress: 0,
                    tasks: []
                },
                {
                    id: "7bbfe3bf-74dc-40fc-bdb0-71204c123a41",
                    name: "Card & Node System",
                    description: "Manages the lifecycle, rendering, and state of content cards (text, image, note) on the board.",
                    category: "核心",
                    priority: "High",
                    stage: 1,
                    progress: 0,
                    tasks: []
                }
            ],
            commercial: {
                model: "one_time",
                checklist: {
                    market_fit: true,
                    waitlist: true,
                    legal: true,
                    pricing: true,
                    analytics: true,
                    payments: true
                },
                proPrice: "10"
            },
            link: "",
            stageNames: {
                "2": "Functionality"
            }
        }
    ],
    commands: [
        {
            id: "7a86a132-162c-4412-abed-105360ec3f62",
            title: "多步骤确保代码完善",
            content: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化功能.确保第一版交给用户的就是一个能够看的页面",
            url: "",
            type: "utility",
            stageId: 1,
            createdAt: 1767783266979,
            stageIds: [1, 3, 2, 5, 4],
            tags: [
                {
                    id: "359627e4-4aac-4b45-bf12-84eb9de1585f",
                    label: "最近Function",
                    value: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化最近你增加的功能.确保第一版交给用户的就是一个能够使用和完善的功能。"
                },
                {
                    id: "ae791c1f-db06-4fcf-8159-5a26d0c36987",
                    label: "这次 Function",
                    value: "继续优化我给你的文案的功能和设计，找到你之前没有弄好的，进行全面的检查，重新设计，重写优化这次你增加的功能.确保第一版交给用户的就是一个能够使用和完善的功能。"
                }
            ],
            category: "general"
        },
        {
            id: "77017c14-95fc-4f4e-ab8a-c9d874599ace",
            title: "SEO",
            content: "SEO 优化",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [5],
            createdAt: 1767854535351
        },
        {
            id: "a9238bec-b5cb-4632-ab3e-e6ef59839a3f",
            title: "语言适配",
            content: "语言适配",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [5],
            createdAt: 1767854523183
        },
        {
            id: "82d6c26f-38a1-43fa-9238-60f2f9fbb9ec",
            title: "快捷键模块",
            content: `我们正在开发快捷键系统\n第一阶段：地基与架构 (Foundation)\n✅ 1. 创建 keymap.config.ts (单一真理来源)\n任务内容： 建立一个静态配置文件，定义应用中所有的 actionId、defaultKeys（默认键位）、scope（作用域）和 label（显示文案）。\n\n为什么要这样写：\n\n理由 1 (可维护性)： 不要把 'mod+s' 这种字符串硬编码散落在几十个 React 组件里。一旦你想改键位，或者未来想支持"用户自定义键位"，集中管理是唯一的出路。\n\n理由 2 (自动化)： 你的"快捷键帮助面板"可以直接读取这个配置文件自动生成，无需人工维护两份数据，杜绝了"代码改了但文档没改"的低级错误。`,
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [3],
            createdAt: 1767883761985
        },
        {
            id: "02ebaf5a-c944-419c-9af8-a97589142099",
            title: "用户BUG 修复",
            content: "1、把导致这个功能出现 BUG 相关的代码文件逻辑写成文档,让我阅读目前的关于这个功能的清晰的逻辑\n2、用中文输出文档，告诉我目前这款一块相关的代码处理逻辑是怎么样的，一定要清晰并且完整，",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [4],
            createdAt: 1767861526345
        },
        {
            id: "c826b32e-e2bb-4cf2-83ea-a2c38d125514",
            title: "代码模块化",
            content: "1、告诉我目前这个软件由几个重要模块组成\n2、告诉我不同的主要模块之下还有哪些次要模块",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [4],
            createdAt: 1767861341060
        },
        {
            id: "bda3bd55-8dbd-48bf-823c-36c4ea1038e0",
            title: "生成文档指令",
            content: "# Task: Update Documentation Module\n**Target File:** `[INSERT_DOC_FILE_PATH]` (e.g., @docs/auth_module.md)\n\n**Instructions:**\n1. **Load Context:** Read the existing target file FIRST. Then read the current source code and `git diff` for this specific module.\n2. **In-Place Update:** Do NOT rewrite from scratch. Do NOT append to the end.\n   - **Identify** discrepancies between the doc and the code.\n   - **Modify** only the outdated sections directly.\n   - **Delete** any logic that no longer exists in the code.\n   - **Keep** the original formatting and structure strictly.\n\n**Output:** Return the *entire* updated markdown file content.\ndocs\n\n1、应该细致到每一个函数的复制的功能\n2、应该细致到用户用的色彩的数据，应该细致到每一个页面的每一个功能是怎么样搭建起来的\n3、用中文写\n4、要明确开一个文档总结整个代码库的功能，明确提到每个最细微的设计，并且解释好用户为什么要这样写这个功能",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [4],
            createdAt: 1767853927142
        },
        {
            id: "43e06097-4010-4810-ad95-17a405ce8c0b",
            title: "网络分享模块",
            content: "我想要网络分享模块，让用户分享自己的软件开发配置，其他用户可以直接导入到自己的分类，类似 Notion 那样，这个怎么实现",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [3],
            createdAt: 1767802915802
        },
        {
            id: "ffc072b9-fb1c-418b-a707-b037dc95f831",
            title: "离线功能",
            content: `本地持久化（离线存活的基础）\n\n核心逻辑： 强制集成 y-indexeddb，所有 Yjs 的更新必须同步写入浏览器或 App 的本地数据库。\n目的： 确保即便进程崩溃、关机或刷新页面，离线数据依然物理存在。\n预防： 杜绝因内存释放导致的离线数据"原地蒸发"`,
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [3],
            createdAt: 1767801986247
        },
        {
            id: "7852d147-13ff-4701-aa2a-97632a24850f",
            title: "导出功能",
            content: "增加用户数据的导入和导出功能",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [3],
            createdAt: 1767801959072
        },
        {
            id: "7140e2c3-716a-4033-aeb1-e0ccfdd20bb4",
            title: "进入 Firebase 复制 SDK 代码",
            content: "",
            url: "https://console.firebase.google.com/",
            type: "link",
            tags: [],
            category: "general",
            stageIds: [3],
            createdAt: 1767797919204
        },
        {
            id: "6f1b9e0b-7a0d-4c37-8f52-dd64847eaedd",
            title: "BUG 和上帝文件寻找",
            content: "从头到尾深入的扫描整个代码库的相关代码文件\n01 帮我寻找这个代码是否有明显的BUG，这要这个 BUG 不影响到我目前的效果，是明显的优化而不是破坏，请在找到之后直接开始修复。尤其是最近提交的 git 附近的代码要重点审查\n02 帮我找到上帝文件的存在，把他们模块化，但一定要确保不要影响到我的代码效果",
            url: "",
            type: "utility",
            tags: [],
            category: "general",
            stageIds: [4],
            createdAt: 1767796312719
        },
        {
            id: "47d257a5-86ff-46c9-93e0-7243e4a8c263",
            title: "新建窗口时，发给 AI",
            content: "在你开始编写之前,我希望你阅读我们完整的代码，以及读取我们的 Git 提交历史，理解我们的项目",
            url: "",
            type: "utility",
            tags: [],
            stageIds: [1],
            createdAt: 1767785821012,
            category: "general"
        },
        {
            id: "88c8cc6b-22b7-4ffe-b2af-d08332db9c40",
            title: "路由系统",
            content: "做一下网页路由系统，目前每次点击都会跳转到主页，每个页面没有自己的页面。",
            url: "",
            type: "utility",
            stageIds: [1],
            createdAt: 1767784379969,
            tags: [],
            category: "general"
        },
        {
            id: "0ed1b346-3522-4826-818b-eb37307525c6",
            title: "跳转 Gemini",
            content: "",
            url: "https://gemini.google.com/app",
            type: "link",
            stageId: 1,
            createdAt: 1767781661805,
            stageIds: [1],
            tags: [],
            category: "general"
        }
    ],
    customCategories: []
};
