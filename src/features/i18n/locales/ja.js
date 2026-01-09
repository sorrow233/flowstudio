// Japanese Language Resources
export default {
    // Navbar
    navbar: {
        inspiration: 'インスピレーション',
        pending: '保留',
        primary: 'メイン開発',
        advanced: '高度',
        commercial: '商用化',
        command: '青写真',
        cloudSync: 'クラウド同期',
        sync: '同期',
        dataManagement: 'データ管理',
    },

    // Common
    common: {
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        add: '追加',
        confirm: '確認',
        undo: '元に戻す',
        copy: 'コピー',
        copied: 'コピーしました',
        search: '検索...',
        notePlaceholder: 'メモを追加...',
        new: '新規',
        profile: 'プロファイル',
        all: 'すべて',
        allCategories: 'すべてのカテゴリ',
        loading: '読み込み中...',
        noData: 'データなし',
        lightMode: 'ライトモード',
        darkMode: 'ダークモード',
    },

    // Inspiration Module
    inspiration: {
        title: 'インスピレーション',
        subtitle: ' fleeting アイデアを捉え、未来のエネルギーを蓄える。',
        placeholder: 'ふと思いついた考えを記録する...',
        emptyState: 'インスピレーションはまだありません。最初のアイデアを記録しましょう。',
        ideaDeleted: 'インスピレーションを削除しました',
        cmdEnter: 'CMD + ENTER',
    },

    // Pending Module
    pending: {
        title: '保留中のプロジェクト',
        subtitle: '開始を待っているプロジェクトの構想',
        emptyState: '保留中のプロジェクトはありません',
        addProject: 'プロジェクトを追加',
        projectName: 'プロジェクト名',
        projectDescription: 'プロジェクトの説明',
    },

    // Primary Dev Module
    primary: {
        title: '開発',
        subtitle: '現在アクティブに開発中のプロジェクト',
        emptyState: '開発中のプロジェクトはありません',
        tasks: 'タスク',
        progress: '進捗',
        noTasks: 'タスクなし',
        addTask: 'タスクを追加',
    },

    // Advanced Refinement
    advanced: {
        title: '高度なワークスペース',
        subtitle: 'カスタムフローと高度なアーキテクチャの設計。',
        emptyState: '高度なプロジェクトはありません',
        createProject: '新規プロジェクト',
        projectName: 'プロジェクト名...',
        create: '作成',
        total: '合計',
        noProjectsTitle: '高度なプロジェクトはありません',
        noProjectsDesc: 'プロジェクトを作成して、カスタムアーキテクチャフローを開始します',
        createFirst: '+ 最初のプロジェクトを作成',
        newProjectDefaultTitle: '新しい高度なプロジェクト',
        newProjectDefaultDesc: 'カスタムワークフロー',
    },

    // Commercial Module
    commercial: {
        title: '商用化',
        subtitle: '市場投入の準備ができているプロジェクト',
        emptyState: '商用化プロジェクトはありません',
        launchChecklist: 'ローンチチェックリスト',
        strategy: '商用戦略',
        strategyDesc: '経済エンジンを設計します。価値の価格を設定し、チャネルを選択し、リリースの準備をします。',
        strategyReadyDesc: 'リリースシステムが検証されました。焦点は成長エンジンとユーザー獲得に移ります。',
        copyDirective: '運用指令をコピー',
        project: 'プロジェクト',
        noProjectsTitle: '商用化プロジェクトはありません',
        noProjectsDesc: 'メイン開発フェーズからプロジェクトを卒業させて、戦略をアンロックします。',
        financialInfrastructure: '1. 金融インフラ',
        revenueModel: '2. 収益モデル',
        pricingStructure: '3. 価格体系',
        growthPhase: '成長フェーズが有効',
        growthTitle: 'エンジンは準備完了です。',
        growthSubtitle: 'ユーザーを獲得する時です。',
        growthDesc: 'インフラストラクチャが確立されました。金融レールが接続されました。あなたの戦略は現在、配信とチャネルの最適化に純粋に集中しています。',
        activeChannels: 'アクティブなチャネル',
        launchReadiness: 'ローンチ準備度',
        readiness: '準備度',
        models: {
            subscription: 'サブスクリプション (SaaS)',
            subscriptionDesc: '月次/年次プランによる継続的な収益。',
            one_time: '買い切り',
            one_timeDesc: '生涯買い切りの支払い。',
            freemium: 'フリーミアム',
            freemiumDesc: 'コア機能は無料、アップグレードは有料。',
            ads: '広告収益',
            adsDesc: '広告によって収益化。',
        },
        payment: {
            stripe: 'Stripe',
            stripeDesc: 'カスタム SaaS の標準。',
            lemonsqueezy: 'Lemon Squeezy',
            lemonsqueezyDesc: 'MoR、グローバルな税務処理。',
            paddle: 'Paddle',
            paddleDesc: '統合された B2B ビリング。',
            revenuecat: 'RevenueCat',
            revenuecatDesc: 'アプリ内課金 (IAP) に最適。',
        },
        marketing: {
            twitter: 'X / Twitter',
            producthunt: 'Product Hunt',
            reddit: 'Reddit',
            linkedin: 'LinkedIn',
            seo: 'SEO & ブログ',
            short_video: 'TikTok / ショート動画',
            ads: '有料広告',
        },
        checklist: {
            market_fit: '課題と解決策の適合確認',
            waitlist: 'ウェイティングリストLP公開',
            pricing: '価格モデル確定',
            legal: '利用規約とプライバシーポリシー',
            analytics: '分析とトラッキングの設定',
            payments: '決済ゲートウェイの接続',
        },
        pricingTiers: {
            personal: 'パーソナル',
            pro: 'プロ',
            enterprise: 'エンタープライズ',
            custom: 'カスタム',
            features: {
                core: 'コア機能',
                community: 'コミュニティサポート',
                everything: '無料版のすべての機能を含む',
                priority: '優先サポート',
                analytics: '高度な分析',
                sso: 'SSO & セキュリティ',
                manager: '専任マネージャー',
            }
        },
        directive: {
            title: '商用運用指令',
            model: '1. ビジネスモデル',
            type: 'タイプ',
            desc: '説明',
            pricing: '価格',
            infrastructure: '2. 金融インフラ',
            provider: 'プロバイダー',
            rationale: '理由',
            growth: '3. 成長エンジン',
            channels: 'アクティブなチャネル',
            readiness: '4. ローンチ準備度',
            generated: 'Flow Studio 商用モジュールで生成',
            notSelected: '未選択',
            tbd: '未定',
            pending: '選択待ち',
            none: '選択なし',
        }
    },

    // Command Center
    commands: {
        title: '青写真センター',
        subtitle: '開発フローの一般的な青写真とリンクを管理',
        emptyState: 'この段階にはコマンドがありません',
        emptyStateHint: '新しいコマンドを追加するか、ライブラリからインポートします',
        community: 'コミュニティ',
        library: 'ライブラリ',
        newCommand: '新規',
        deleteConfirmLast: 'このコマンドを永久に削除しますか？',
        deleteConfirmStage: 'この段階からコマンドを削除しますか？（他の段階には残ります）',
        browseCommunity: 'コミュニティの共有を閲覧',
        importFromLibrary: 'グローバルライブラリからインポート',
        stage: 'ステージ',
        // Profile related
        profileName: 'プロファイル名',
        addProfile: '新規プロファイル',
        editProfile: 'プロファイルを編集',
        deleteProfile: 'プロファイルを削除',
        deleteProfileConfirm: 'このプロファイルを削除しますか？配下のコマンドはデータに残ります。',
        // Library related
        globalLibrary: 'グローバルコマンドライブラリ',
        importFromOther: '他のステージ/プロファイルからインポート',
        noImportable: 'インポート可能なコマンドはありません',
        noImportableHint: 'ユーティリティとリンクタイプのみグローバルに共有できます',
        renameHint: 'ダブルクリックで名前を変更',
    },

    // Development Stages (5 stages)
    devStages: {
        1: {
            label: 'スケルトン',
            title: 'アーキテクチャ設計図',
            desc: '構造の整合性、ルーティングロジック、コンポーネント階層を定義。',
        },
        2: {
            label: '機能',
            title: 'コアロジック',
            desc: '主要なビジネスロジック、データフロー、状態管理を実装。',
        },
        3: {
            label: 'モジュール',
            title: 'システム統合',
            desc: '認証、データベースバインディング、外部APIサービスを接続。',
        },
        4: {
            label: '最適化',
            title: 'パフォーマンスの磨き上げ',
            desc: 'UI/UXの遷移を微調整し、再レンダリングを最適化し、エッジケースを処理。',
        },
        5: {
            label: '完了',
            title: '本番準備完了',
            desc: '最終QA、ビルド検証、本番環境へのデプロイ。',
        },
    },

    // Stage Empty States
    stageEmptyStates: {
        1: {
            title: 'アーキテクトの空白のキャンバス',
            desc: 'コアのルートとレイアウトコンポーネントを定義することから始めます。強固な基盤は将来の技術負債を防ぎます。',
        },
        2: {
            title: 'エンジン尚未始動',
            desc: '構造は準備できました。今度は、ロジックとインタラクションで命を吹き込みます。',
        },
        3: {
            title: 'システムオフライン',
            desc: '孤立したモジュールを一つの統合されたエコシステムに接続する時です。',
        },
        4: {
            title: '粗削りな部分',
            desc: 'アプリは動作しますが、「高級感」が必要です。細部に焦点を当てます。',
        },
        5: {
            title: 'フライト前チェックリスト',
            desc: '成功はもうすぐです。すべてのシステムが準備完了していることを確認します。',
        },
    },

    // Command Categories
    categories: {
        general: '全般',
        frontend: 'フロントエンド',
        backend: 'バックエンド',
        database: 'データベース',
        devops: 'DevOps',
        testing: 'テスト',
    },

    // Soul Questions
    questions: {
        clarity: {
            text: '自分が本当に何を求めているのか、明確に表現できますか？',
            sub: '明確さ',
        },
        dogfood: {
            text: '開発した後、自分自身で頻繁に使いますか？',
            sub: 'ドッグフーディング',
        },
        impact: {
            text: 'それはあなたの生活を長期的に変えることができますか？',
            sub: '長期的な影響',
        },
        value: {
            text: 'このプロジェクトが本当に他の人の役に立つと信じていますか？',
            sub: '利他主義',
        },
    },

    // Sync Status
    sync: {
        synced: '同期済み',
        syncing: '同期中...',
        offline: 'オフライン',
        error: '同期エラー',
        pending: '同期待機中',
    },

    // Auth
    auth: {
        signIn: 'サインイン',
        signOut: 'サインアウト',
        signInWithGoogle: 'Googleでサインイン',
    },
};
