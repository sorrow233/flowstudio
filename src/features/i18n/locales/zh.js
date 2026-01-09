// 中文语言资源
export default {
    // 导航栏
    navbar: {
        inspiration: '灵感',
        pending: '萌芽',
        primary: '开发',
        advanced: '进阶',
        final: '模块',
        commercial: '商业化',
        command: '蓝图',
        cloudSync: '云同步',
        sync: '同步',
        dataManagement: '数据管理',
    },

    // 通用
    common: {
        save: '保存',
        cancel: '取消',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        confirm: '确认',
        undo: '撤销',
        copy: '复制',
        copied: '已复制',
        search: '搜索...',
        new: '新建',
        profile: '配置',
        all: '全部',
        allCategories: '所有分类',
        loading: '加载中...',
        noData: '暂无数据',
        lightMode: '亮色模式',
        darkMode: '暗色模式',
    },

    // 灵感模块
    inspiration: {
        title: '灵感',
        subtitle: '捕捉瞬时灵感，为未来积蓄能量。',
        placeholder: '记录一闪而过的念头...',
        emptyState: '暂无灵感，记录下第一个想法吧',
        ideaDeleted: '灵感已删除',
        cmdEnter: 'CMD + ENTER',
    },

    // 待定模块 (Renamed to Sprouting/萌芽)
    pending: {
        title: '萌芽',
        subtitle: '静待生长的项目构思',
        emptyState: '暂无萌芽项目',
        addProject: '添加项目',
        projectName: '项目名称',
        projectDescription: '项目描述',
    },

    // 主开发模块
    primary: {
        title: '开发',
        subtitle: '正在积极开发中的项目',
        emptyState: '暂无开发中项目',
        tasks: '任务',
        progress: '进度',
        noTasks: '暂无任务',
        addTask: '添加任务',
    },

    // 进阶优化 (原终稿)
    advanced: {
        title: '进阶优化',
        subtitle: '核心功能之外的深度性能优化与体验打磨',
        emptyState: '暂无进阶项目',
        stageOptimization: '底层优化',
        stageNewModule: '模块演进',
        stageBugFix: '深度修复',
        createProject: '新建项目',
        projectName: '项目名称...',
        create: '创建',
        total: '总计',
        noProjectsTitle: '暂无进阶项目',
        noProjectsDesc: '创建项目以开始优化与功能完善',
        createFirst: '+ 创建首个项目',
        newProjectDefaultTitle: '新的进阶优化项目',
        newProjectDefaultDesc: '优化、功能与修复',
    },

    // 模块 (原终稿/进阶)
    final: {
        title: '模块',
        subtitle: '全局查看并管理项目功能模块',
        emptyState: '暂无模块',
    },

    // 商业化模块
    commercial: {
        title: '商业化',
        subtitle: '准备进入市场的项目',
        emptyState: '暂无商业化项目',
        launchChecklist: '上线清单',
        strategy: '商业策略',
        strategyDesc: '设计经济引擎。定价价值，选择渠道，准备发布。',
        strategyReadyDesc: '发布系统已验证。重点转向增长引擎和用户获取。',
        copyDirective: '复制运营指令',
        project: '项目',
        noProjectsTitle: '暂无商业化项目',
        noProjectsDesc: '从主开发阶段毕业项目以解锁策略。',
        financialInfrastructure: '1. 财务基础设施',
        revenueModel: '2. 营收模式',
        pricingStructure: '3. 定价结构',
        growthPhase: '增长阶段已激活',
        growthTitle: '引擎已就绪。',
        growthSubtitle: '是时候获取用户了。',
        growthDesc: '基础设施已确立。财务轨道已连接。你的策略现在纯粹集中由于分发和渠道优化。',
        activeChannels: '活跃渠道',
        launchReadiness: '发布准备度',
        readiness: '准备度',
        models: {
            subscription: '订阅制 (SaaS)',
            subscriptionDesc: '通过月付/年付计划持续营收。',
            one_time: '一次性购买',
            one_timeDesc: '终身买断制付款。',
            freemium: '免费增值',
            freemiumDesc: '核心免费，升级付费。',
            ads: '广告支持',
            adsDesc: '通过广告变现。',
        },
        payment: {
            stripe: 'Stripe',
            stripeDesc: '自定义 SaaS 的标准。',
            lemonsqueezy: 'Lemon Squeezy',
            lemonsqueezyDesc: 'MoR，全球税务处理。',
            paddle: 'Paddle',
            paddleDesc: '统一 B2B 计费。',
            revenuecat: 'RevenueCat',
            revenuecatDesc: '最适合应用内购买 (IAP)。',
        },
        marketing: {
            twitter: 'X / Twitter',
            producthunt: 'Product Hunt',
            reddit: 'Reddit',
            linkedin: 'LinkedIn',
            seo: 'SEO & 博客',
            short_video: 'TikTok / 短视频',
            ads: '付费广告',
        },
        checklist: {
            market_fit: '确认痛点与解决方案匹配',
            waitlist: '等待名单落地页上线',
            pricing: '定价模式已定稿',
            legal: '条款与隐私政策',
            analytics: '分析与追踪设置',
            payments: '支付网关已连接',
        },
        pricingTiers: {
            personal: '个人版',
            pro: '专业版',
            enterprise: '企业版',
            custom: '定制',
            features: {
                core: '核心功能',
                community: '社区支持',
                everything: '包含免费版所有功能',
                priority: '优先支持',
                analytics: '高级分析',
                sso: 'SSO & 安全',
                manager: '专属经理',
            }
        },
        directive: {
            title: '商业运营指令',
            model: '1. 商业模式',
            type: '类型',
            desc: '描述',
            pricing: '定价',
            infrastructure: '2. 财务基础设施',
            provider: '提供商',
            rationale: '理由',
            growth: '3. 增长引擎',
            channels: '活跃渠道',
            readiness: '4. 发布准备度',
            generated: '通过 Flow Studio 商业模块生成',
            notSelected: '未选择',
            tbd: '待定',
            pending: '待选择',
            none: '未选择',
        },
        aiConfig: {
            title: 'AI 智能配置',
            desc: '配置商业参数，生成 AI 指令，快速构建您的商业化逻辑。',
            steps: {
                1: '配置左侧商业参数',
                2: '生成并复制 AI 指令',
                3: '发送给 AI 助手进行构建',
                4: '确认无误后解锁增长引擎',
            },
            copyAction: '生成 AI 指令',
            unlockAction: '解锁增长引擎',
            unlockDesc: '确任配置已完成？这将激活增长面板。',
            unlocked: '增长引擎已激活',
            unlockedDesc: '您可以随时重新生成指令以更新配置。',
        }

    },

    // 命令中心
    commands: {
        title: '蓝图中心',
        subtitle: '管理开发流程中的常用蓝图和链接',
        emptyState: '此阶段暂无命令',
        emptyStateHint: '添加新命令或从库中导入',
        community: '社区',
        library: '库',
        newCommand: '新建',
        deleteConfirmLast: '永久删除此命令？',
        deleteConfirmStage: '从此阶段移除命令？（其他阶段仍保留）',
        browseCommunity: '浏览社区分享',
        importFromLibrary: '从全局库导入',
        stage: '阶段',
        // Profile related
        profileName: '配置名称',
        addProfile: '新建配置',
        editProfile: '编辑配置',
        deleteProfile: '删除配置',
        deleteProfileConfirm: '确认删除此配置？配置下的指令将保留在数据中。',
        // Library related
        globalLibrary: '全局指令库',
        importFromOther: '从其他阶段/配置导入',
        noImportable: '暂无可导入的指令',
        noImportableHint: '仅 Utility 和 Link 类型可跨阶段共享',
    },

    // 开发阶段（5阶段）
    devStages: {
        1: {
            label: '骨架',
            title: '架构蓝图',
            desc: '定义结构完整性、路由逻辑和组件层次',
        },
        2: {
            label: '功能',
            title: '核心逻辑',
            desc: '实现主要业务逻辑、数据流和状态管理',
        },
        3: {
            label: '模块',
            title: '系统集成',
            desc: '连接认证、数据库绑定和外部API服务',
        },
        4: {
            label: '优化',
            title: '性能打磨',
            desc: '精细化UI/UX过渡效果、优化渲染、处理边缘情况',
        },
        5: {
            label: '完成',
            title: '生产就绪',
            desc: '最终QA、构建验证和生产环境部署',
        },
    },

    // 终稿阶段（3阶段）
    finalStages: {
        1: {
            label: '优化',
            title: '模块优化',
            desc: '分析现有实现、识别瓶颈、优化代码以提升性能和可读性',
        },
        2: {
            label: '新模块',
            title: '功能追加',
            desc: '规划并实现新模块或功能，确保与现有系统无缝集成',
        },
        3: {
            label: '修复',
            title: '缺陷解决',
            desc: '识别、复现并解决报告的Bug，确保系统稳定性和可靠性',
        },
    },

    // 阶段空状态
    stageEmptyStates: {
        1: {
            title: '架构师的空白画布',
            desc: '从定义核心路由和布局组件开始。良好的基础可以避免未来的技术债务。',
        },
        2: {
            title: '引擎尚未启动',
            desc: '结构已就绪。现在，用逻辑和交互赋予它生命。',
        },
        3: {
            title: '系统离线',
            desc: '是时候将独立的模块连接成一个统一的生态系统了。',
        },
        4: {
            title: '粗糙的边缘',
            desc: '应用可以工作了，但需要那种「高级感」。专注于细节。',
        },
        5: {
            title: '起飞前检查清单',
            desc: '你快成功了。确保所有系统准备就绪。',
        },
    },

    // 命令分类
    categories: {
        general: '通用',
        frontend: '前端',
        backend: '后端',
        database: '数据库',
        devops: 'DevOps',
        testing: '测试',
        final: '终稿',
    },

    // 灵魂四问
    questions: {
        clarity: {
            text: '你是否能够清晰地表达自己究竟想要什么？',
            sub: '清晰度',
        },
        dogfood: {
            text: '开发出来之后，你自己也会经常用它吗？',
            sub: '自用需求',
        },
        impact: {
            text: '它能在未来长期改变你的生活吗？',
            sub: '长期价值',
        },
        value: {
            text: '你是否相信这个项目能够真正帮助到大家？',
            sub: '利他之心',
        },
    },

    // 同步状态
    sync: {
        synced: '已同步',
        syncing: '同步中...',
        offline: '离线',
        error: '同步错误',
        pending: '待同步',
    },

    // 认证
    auth: {
        signIn: '登录',
        signOut: '退出登录',
        signInWithGoogle: '使用 Google 登录',
    },
};
