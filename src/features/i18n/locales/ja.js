// Japanese Language Resources
export default {
    // Navbar
    navbar: {
        inspiration: 'インスピレーション',
        pending: '萌芽',
        primary: 'フロー',
        advanced: '高度',
        final: 'モジュール',
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
        all: 'すべて',
        allCategories: '全カテゴリ',
        loading: '読み込み中...',
        noData: 'データなし',
        lightMode: 'ライトモード',
        darkMode: 'ダークモード',
        back: '戻る',
        close: '閉じる',
        settings: '設定',
        projectTitle: 'プロジェクト名',
        projectDesc: '簡単な説明...',
        descPlaceholder: 'プロジェクトを説明...',
        linkPlaceholder: 'https://...',
        backgroundTheme: '背景テーマ',
        deleteProject: 'プロジェクトを削除',
        deleteProjectConfirm: 'このプロジェクトを削除しますか？',
        deleteTasks: 'タスクを削除',
        deleteTasksConfirm: '{count}件のアイテムを削除しますか？',
        plantSeed: '新しい種を植える...',
    },

    // Inspiration Module
    inspiration: {
        title: 'インスピレーション',
        subtitle: '瞬間のひらめきを捉え、未来のために蓄える。',
        placeholder: 'アイデアを記録...',
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

    // Pending Module
    pending: {
        title: 'アイデアステージング',
        subtitle: '構築前に検証',
        removeConfirmTitle: 'この種を削除しますか？',
        removeConfirmMessage: 'この操作は取り消せません。種は虚空に戻り、次のインスピレーションを待ちます。',
        remove: '削除',
        newSeedDesc: 'このアイデアを一文で説明...',
        nursery: '育苗室',
        growing: '成長中',
    },

    // フローモジュール
    primary: {
        title: 'フロー',
        subtitle: 'すべての困難と複雑さをフローに変える',
        emptyState: 'フロープロジェクトなし',
        tasks: 'タスク',
        progress: '進捗',
        noTasks: 'タスクなし',
        addTask: 'タスクを追加',
    },

    // 高度な最適化 (旧 最終)
    advanced: {
        title: '高度な最適化',
        subtitle: 'コア機能を超えたディープなパフォーマンス最適化と体験のブラッシュアップ',
        emptyState: '高度なプロジェクトはありません',
        stageOptimization: '低レベル最適化',
        stageNewModule: 'モジュールの進化',
        stageBugFix: '深度修正',
        createProject: '新規プロジェクト',
        projectName: 'プロジェクト名...',
        create: '作成',
        total: '合計',
        noProjectsTitle: '高度なプロジェクトなし',
        noProjectsDesc: '最適化と仕上げを開始するためにプロジェクトを作成',
        createFirst: '+ 最初のプロジェクトを作成',
        newProjectDefaultTitle: '新しい高度な開発プロジェクト',
        newProjectDefaultDesc: '最適化、機能、修正',
        newProjectDefaultTitle: '新しい高度な開発プロジェクト',
        newProjectDefaultDesc: '最適化、機能、修正',
        finalProjects: 'プロジェクト',
        items: 'アイテム',
        noDesc: '説明なし',
        launchProject: 'プロジェクトをローンチ',
        launchConfirm: 'このプロジェクトを商用化しますか？',
        launch: 'ローンチ',
        workspace: {
            design: 'デザイン',
            development: '開発',
            polish: '仕上げ',
            unknownStage: '不明なステージ',
            complete: '% 完了',
        },
        stage: {
            pipeline: 'パイプライン',
            add: 'ステージを追加',
            placeholder: 'ステージ名...',
            deleteTitle: 'ステージを削除',
            deleteConfirm: 'このステージを削除してもよろしいですか？',
            delete: '削除',
        },
    },

    // Project Settings Modal
    projectSettings: {
        manageDetails: 'プロジェクトの詳細と設定を管理',
        description: '説明',
        appearance: '外観',
        imageUrlHint: 'プロジェクト背景カードの有効な画像URLを入力してください。',
        preview: '背景プレビュー',
        deleteConfirm: 'このプロジェクトを削除しますか？この操作は取り消すことができません。',
        saveChanges: '変更を保存',
    },

    // Project Management
    project: {
        advancedStage: '高度なステージ',
        nurseryStage: '萌芽ステージ',
        pruneSeed: 'この芽を摘む',
        keepGrowing: 'キャンセルして育て続ける',
        waitingForSprout: '最初のインスピレーションの芽を待っています...',
        untitledProject: '無題のプロジェクト',
        descriptionPlaceholder: 'プロジェクトの説明を追加...',
        addLink: 'リンクを追加...',
        myVow: '私の誓い',
        vowEstablished: '確立済み',
        vowPlaceholder: '創設理由を書き留めてください...',
        promoteToAdvanced: '高度に昇格',
    },


    // 最終開発 (旧 高度)
    final: {
        title: '最終統合',
        subtitle: 'プロジェクトのコアロジックとシステム統合の最終段階',
        emptyState: '最終プロジェクトはありません',
    },

    // Commercial Module
    commercial: {
        title: '商用化',
        subtitle: '市場投入の準備ができているプロジェクト',
        emptyState: '商用化プロジェクトはありません',
        launchChecklist: 'ローンチチェックリスト',
        strategy: '商用戦略',
        strategyDesc: '経済エンジンを設計します。価値の価格設定、チャネル選択、発売準備。',
        strategyReadyDesc: '発売システム検証済み。成長エンジンとユーザー獲得に焦点を移します。',
        copyDirective: '運用指令をコピー',
        project: 'プロジェクト',
        noProjectsTitle: '商用プロジェクトなし',
        noProjectsDesc: '戦略をアンロックするには、メイン開発からプロジェクトを卒業させてください。',
        financialInfrastructure: '1. 金融インフラ',
        revenueModel: '2. 収益モデル',
        pricingStructure: '3. 価格体系',
        growthPhase: '成長フェーズ進行中',
        growthTitle: 'エンジン準備完了。',
        growthSubtitle: 'ユーザー獲得の時間です。',
        growthDesc: 'インフラは設定されました。金融レールも接続されています。戦略は今、配信とチャネル最適化に純粋に焦点を当てています。',
        activeChannels: 'アクティブなチャネル',
        launchReadiness: 'ローンチ準備度',
        readiness: '準備度',
        models: {
            subscription: 'サブスクリプション (SaaS)',
            subscriptionDesc: '月次/年次プランによる継続的な収益。',
            one_time: '買い切り',
            one_timeDesc: '生涯アクセスのための1回払い。',
            freemium: 'フリーミアム',
            freemiumDesc: 'コア機能は無料、アップグレードは有料。',
            ads: '広告モデル',
            adsDesc: '広告による収益化。',
        },
        payment: {
            stripe: 'Stripe',
            stripeDesc: 'カスタムSaaSの標準。',
            lemonsqueezy: 'Lemon Squeezy',
            lemonsqueezyDesc: 'MoR、グローバルな税務処理。',
            paddle: 'Paddle',
            paddleDesc: '統一B2B請求。',
            revenuecat: 'RevenueCat',
            revenuecatDesc: 'アプリ内課金(IAP)に最適。',
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
            analytics: '分析と追跡の設定',
            payments: '決済ゲートウェイ接続',
        },
        pricingTiers: {
            personal: '個人',
            pro: 'プロ',
            enterprise: 'エンタープライズ',
            custom: 'カスタム',
            features: {
                core: 'コア機能',
                community: 'コミュニティサポート',
                everything: '無料版の全機能',
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
            rationale: '選定理由',
            growth: '3. 成長エンジン',
            channels: 'アクティブチャネル',
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
        emptyStateHint: '新しいコマンドを追加するか、ライブラリからインポートしてください',
        community: 'コミュニティ',
        library: 'ライブラリ',
        newCommand: '新規',
        deleteConfirmLast: 'このコマンドを完全に削除しますか？',
        deleteConfirmStage: 'このステージからコマンドを削除しますか？（他のステージには残ります）',
        browseCommunity: 'コミュニティの共有を閲覧',
        importFromLibrary: 'グローバルライブラリからインポート',
        stage: 'ステージ',
        noImportableHint: 'ユーティリティとリンクタイプのみグローバルに共有できます',
        renameHint: 'ダブルクリックで名前を変更',
    },

    // Development Stages (5 Stages)
    devStages: {
        1: {
            label: '構造',
            title: 'プロジェクトアーキテクチャ',
            desc: 'コア構造、ナビゲーションロジック、基礎となるビルディングブロックを定義',
        },
        2: {
            label: '統合',
            title: 'ロジックとメカニズム',
            desc: 'バラバラの要素を接続し、主要なワークフローを実装し、データを処理',
        },
        3: {
            label: '強化',
            title: 'システムの洗練',
            desc: '高度な機能を追加し、外部サービスを統合し、UXを磨き上げる',
        },
        4: {
            label: '感官',
            title: 'ディテールと仕上げ',
            desc: 'トランジションを精査し、パフォーマンスを最適化し、エッジケースを処理',
        },
        5: {
            label: 'ローンチ',
            title: '成長への準備',
            desc: '最終的な検証、品質保証を行い、ユーザーへの展開に向けた準備を完了',
        },
    },

    // Final Stages (3 Stages)
    finalStages: {
        1: {
            label: '最適化',
            title: 'モジュール最適化',
            desc: '既存の実装を分析し、ボトルネックを特定し、パフォーマンスと可読性を向上させるためにコードを最適化',
        },
        2: {
            label: '新モジュール',
            title: '機能追加',
            desc: '新しいモジュールまたは機能を計画および実装し、既存のシステムとのシームレスな統合を確保',
        },
        3: {
            label: '修正',
            title: 'バグ解決',
            desc: '報告されたバグを特定、再現、解決し、システムの安定性と信頼性を確保',
        },
    },

    // Stage Empty States
    stageEmptyStates: {
        1: {
            title: 'アーキテクトの空白のキャンバス',
            desc: 'コアルートとレイアウトコンポーネントの定義から始めましょう。強固な基礎は将来の技術的負債を防ぎます。',
        },
        2: {
            title: 'エンジンはまだ始動していません',
            desc: '構造の準備が整いました。次はロジックとインタラクションで命を吹き込みましょう。',
        },
        3: {
            title: 'システムオフライン',
            desc: '独立したモジュールを統一されたエコシステムに接続する時が来ました。',
        },
        4: {
            title: '荒削りなエッジ',
            desc: 'アプリは機能しますが、「高級感」が必要です。細部に集中しましょう。',
        },
        5: {
            title: '離陸前のチェックリスト',
            desc: 'もうすぐ成功です。すべてのシステムの準備が整っていることを確認してください。',
        },
    },

    // Task List
    taskList: {
        importCommand: 'コマンドをインポート',
        completed: '完了',
        stageTasksCompleted: 'ステージタスク完了',
        stageTasksCompletedDesc: 'すべてのタスクが完了しました。次のステージに進めます',
        selectAll: 'すべて選択',
        deselectAll: '選択解除',
        selected: '選択済み',
        deleteSelected: '選択を削除',
        move: '移動',
        addTaskPlaceholder: '{stage}にタスクを追加...',
    },

    // Import Command Modal
    importCommandModal: {
        title: 'コマンドをインポート',
        subtitle: '事前設定されたコマンドをタスクリストに追加します。',
        searchPlaceholder: 'コマンドを検索...',
        recommendedFor: '{stage}に推奨',
        perfectMatch: '完璧な一致',
        stageCritical: 'ステージクリティカル',
        domainPreferred: 'ドメイン優先',
        otherCommands: 'その他のコマンド',
        noResults: 'フィルターに一致するコマンドが見つかりません。',
        added: '追加済み',
        add: '追加 +',
    },

    // Command Categories
    categories: {
        general: '一般',
        frontend: '生活',
        backend: '仕事',
        database: '財務',
        devops: '健康',
        testing: '旅行',
        final: '最終',
    },

    // Soul Queries
    questions: {
        clarity: {
            text: '自分が何を求めているのか、明確に表現できますか？',
            sub: '明確さ',
        },
        dogfood: {
            text: 'それが実現した場合、あなたは最も忠実なユーザーになりますか？',
            sub: '自己価値',
        },
        impact: {
            text: 'それは将来、あなたの生活や仕事を長期的に改善できますか？',
            sub: '長期的な改善',
        },
        value: {
            text: 'このアイデアが本当に他人の役に立つと信じていますか？',
            sub: '利他の心',
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
        signIn: 'ログイン',
        signOut: 'ログアウト',
        signInWithGoogle: 'Googleでログイン',
    },
};
