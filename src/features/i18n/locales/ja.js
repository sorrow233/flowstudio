// Japanese Language Resources
export default {
    // Navbar
    navbar: {
        inspiration: 'インスピレーション',
        pending: '保留',
        primary: 'メイン開発',
        advanced: '高度',
        final: '最終',
        commercial: '商用化',
        command: 'コマンド',
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
        new: '新規',
        all: 'すべて',
        allCategories: '全カテゴリ',
        loading: '読み込み中...',
        noData: 'データなし',
        lightMode: 'ライトモード',
        darkMode: 'ダークモード',
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

    // Primary Development Module
    primary: {
        title: '主力開発',
        subtitle: '現在積極的に開発中のプロジェクト',
        emptyState: '開発中のプロジェクトはありません',
        tasks: 'タスク',
        progress: '進捗',
        noTasks: 'タスクなし',
        addTask: 'タスクを追加',
    },

    // Advanced Development Module
    advanced: {
        title: '高度な開発',
        subtitle: 'より深い作業が必要な複雑なプロジェクト',
        emptyState: '高度なプロジェクトはありません',
    },

    // Final Development Module
    final: {
        title: '最終開発',
        subtitle: '最終的な仕上げ段階に入ったプロジェクト',
        emptyState: '最終段階のプロジェクトはありません',
        stageOptimization: 'モジュール最適化',
        stageNewModule: '新機能追加',
        stageBugFix: 'バグ修正',
    },

    // Commercial Module
    commercial: {
        title: '商用化',
        subtitle: '市場投入の準備ができているプロジェクト',
        emptyState: '商用化プロジェクトはありません',
        launchChecklist: 'ローンチチェックリスト',
    },

    // Command Center
    commands: {
        title: 'コマンドセンター',
        subtitle: '開発フローの一般的なコマンドとリンクを管理',
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
    },

    // Development Stages (5 Stages)
    devStages: {
        1: {
            label: 'スケルトン',
            title: 'アーキテクチャ設計図',
            desc: '構造の整合性、ルールのロジック、コンポーネント階層を定義',
        },
        2: {
            label: '機能',
            title: 'コアロジック',
            desc: '主要なビジネスロジック、データフロー、状態管理を実装',
        },
        3: {
            label: 'モジュール',
            title: 'システム統合',
            desc: '認証、データベースバインディング、外部APIサービスを接続',
        },
        4: {
            label: '最適化',
            title: 'パフォーマンス向上',
            desc: 'UI/UXのトランジションを洗練させ、レンダリングを最適化し、エッジケースを処理',
        },
        5: {
            label: '完了',
            title: '本番準備完了',
            desc: '最終QA、ビルド検証、本番環境へのデプロイ',
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

    // Command Categories
    categories: {
        general: '一般',
        frontend: 'フロントエンド',
        backend: 'バックエンド',
        database: 'データベース',
        devops: 'DevOps',
        testing: 'テスト',
        final: '最終',
    },

    // Soul Queries
    questions: {
        clarity: {
            text: '自分が本当に何を求めているのか、明確に表現できますか？',
            sub: '明確さ',
        },
        dogfood: {
            text: '開発した後、自分自身でも頻繁に使いますか？',
            sub: '自己需要',
        },
        impact: {
            text: 'それは将来、あなたの生活を長期的に変えることができますか？',
            sub: '長期的価値',
        },
        value: {
            text: 'このプロジェクトが本当にみんなの役に立つと信じていますか？',
            sub: '利他の心',
        },
    },

    // Sync Status
    sync: {
        synced: '同期完了',
        syncing: '同期中...',
        offline: 'オフライン',
        error: '同期エラー',
        pending: '同期待機中',
    },

    // Auth
    auth: {
        signIn: 'ログイン',
        signOut: 'ログアウト',
        signInWithGoogle: 'Googleでログイン',
    },
};
