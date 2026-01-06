export default {
    defaultLanguage: 'en',
    languages: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'],
    // Domain is required for sitemap generation and canonical URLs
    domain: 'https://flowstudio.app',

    // Setup for automatic language detection
    languageDetection: {
        fallback: 'en',
        supported: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']
    },

    routes: {
        '/': {
            en: {
                title: 'Flow Studio - AI-Powered Development Lifecycle Management',
                description: 'Flow Studio empowers your development lifecycle with AI. From idea to implementation, manage everything in one place.',
                keywords: 'AI development, project management, software lifecycle, Flow Studio'
            },
            'zh-CN': {
                title: 'Flow Studio - AI 赋能的开发生命周期管理',
                description: 'Flow Studio 利用 AI 赋能，全流程管理您的开发生命周期。从创意到实现，一站式搞定。',
                keywords: 'AI 开发, 项目管理, 软件生命周期, Flow Studio'
            },
            'zh-TW': {
                title: 'Flow Studio - AI 賦能的開發生命週期管理',
                description: 'Flow Studio 利用 AI 賦能，全流程管理您的開發生命週期。從創意到實現，一站式搞定。',
                keywords: 'AI 開發, 專案管理, 軟體生命週期, Flow Studio'
            },
            ja: {
                title: 'Flow Studio - AIを活用した開発ライフサイクル管理',
                description: 'Flow StudioはAIを活用して開発ライフサイクルを支援します。アイデアから実装まで、すべてを一箇所で管理。',
                keywords: 'AI開発, プロジェクト管理, ソフトウェアライフサイクル, Flow Studio'
            },
            ko: {
                title: 'Flow Studio - AI 기반 개발 수명주기 관리',
                description: 'Flow Studio는 AI를 활용하여 개발 수명주기를 강화합니다. 아이디어에서 구현까지 모든 것을 한곳에서 관리하세요.',
                keywords: 'AI 개발, 프로젝트 관리, 소프트웨어 수명주기, Flow Studio'
            }
        },
        '/dashboard': {
            en: {
                title: 'Dashboard - Flow Studio',
                description: 'Manage your projects and workflows in Flow Studio Dashboard.',
            },
            'zh-CN': {
                title: '控制台 - Flow Studio',
                description: '在 Flow Studio 控制台中管理您的项目和工作流。',
            },
            'zh-TW': {
                title: '控制台 - Flow Studio',
                description: '在 Flow Studio 控制台中管理您的專案和工作流。',
            },
            ja: {
                title: 'ダッシュボード - Flow Studio',
                description: 'Flow Studioダッシュボードでプロジェクトとワークフローを管理します。',
            },
            ko: {
                title: '대시보드 - Flow Studio',
                description: 'Flow Studio 대시보드에서 프로젝트와 워크플로우를 관리하세요.',
            }
        },
        '/login': {
            en: {
                title: 'Login - Flow Studio',
                description: 'Sign in to Flow Studio to start your journey.',
            },
            'zh-CN': {
                title: '登录 - Flow Studio',
                description: '登录 Flow Studio，开启您的旅程。',
            },
            'zh-TW': {
                title: '登入 - Flow Studio',
                description: '登入 Flow Studio，開啟您的旅程。',
            },
            ja: {
                title: 'ログイン - Flow Studio',
                description: 'Flow Studioにログインして、旅を始めましょう。',
            },
            ko: {
                title: '로그인 - Flow Studio',
                description: 'Flow Studio에 로그인하여 여정을 시작하세요.',
            }
        },
        // Add more routes here as needed
    }
};
