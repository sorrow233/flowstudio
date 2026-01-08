// 中文语言资源
export default {
    // 导航栏
    navbar: {
        inspiration: '灵感',
        pending: '待定',
        primary: '主开发',
        advanced: '进阶',
        final: '终稿',
        commercial: '商业化',
        command: '命令',
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

    // 待定模块
    pending: {
        title: '待定项目',
        subtitle: '等待启动的项目构思',
        emptyState: '暂无待定项目',
        addProject: '添加项目',
        projectName: '项目名称',
        projectDescription: '项目描述',
    },

    // 主开发模块
    primary: {
        title: '主力开发',
        subtitle: '当前正在积极开发的项目',
        emptyState: '暂无开发中项目',
        tasks: '任务',
        progress: '进度',
        noTasks: '暂无任务',
        addTask: '添加任务',
    },

    // 进阶开发模块
    advanced: {
        title: '进阶开发',
        subtitle: '需要更深入工作的复杂项目',
        emptyState: '暂无进阶项目',
    },

    // 终稿模块
    final: {
        title: '终稿开发',
        subtitle: '进入最终打磨阶段的项目',
        emptyState: '暂无终稿项目',
        stageOptimization: '模块优化',
        stageNewModule: '新增功能',
        stageBugFix: '缺陷修复',
    },

    // 商业化模块
    commercial: {
        title: '商业化',
        subtitle: '准备进入市场的项目',
        emptyState: '暂无商业化项目',
        launchChecklist: '上线清单',
    },

    // 命令中心
    commands: {
        title: '命令中心',
        subtitle: '管理开发流程中的常用命令和链接',
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
