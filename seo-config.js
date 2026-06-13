/**
 * SEO Configuration - Single Source of Truth
 * 这是所有页面的 SEO 元数据配置，用于边缘注入和 sitemap 生成
 * 
 * 支持语言：简中(zh), English(en), 日本語(ja), 한국어(ko)
 */

const seoConfig = {
    // 生产环境 URL
    siteUrl: 'https://flowstudio.catzz.work',

    // 默认语言 (不添加 URL 前缀)
    defaultLang: 'zh',

    // 支持的语言列表
    supportedLangs: ['zh', 'en', 'ja', 'ko'],

    // 语言名称映射 (用于语言切换器)
    langNames: {
        zh: '简体中文',
        en: 'English',
        ja: '日本語',
        ko: '한국어',
    },

    // 全局站点元数据
    site: {
        zh: {
            name: 'Flow Studio',
            tagline: 'AI 原生开发环境',
            defaultTitle: 'Flow Studio | AI 原生开发环境',
            defaultDescription: '使用 Flow Studio 编排您的 AI 开发工作流。从灵感到部署，全程陪伴。',
        },
        en: {
            name: 'Flow Studio',
            tagline: 'AI-Native Development Environment',
            defaultTitle: 'Flow Studio | AI-Native Development Environment',
            defaultDescription: 'Orchestrate your AI development workflow with Flow Studio. From inspiration to deployment.',
        },
        ja: {
            name: 'Flow Studio',
            tagline: 'AIネイティブ開発環境',
            defaultTitle: 'Flow Studio | AIネイティブ開発環境',
            defaultDescription: 'Flow Studioで AI 開発ワークフローを編成。インスピレーションからデプロイまで。',
        },
        ko: {
            name: 'Flow Studio',
            tagline: 'AI 네이티브 개발 환경',
            defaultTitle: 'Flow Studio | AI 네이티브 개발 환경',
            defaultDescription: 'Flow Studio로 AI 개발 워크플로우를 조율하세요. 영감부터 배포까지.',
        },
    },

    // 页面级 SEO 配置
    pages: {
        '/': {
            zh: {
                title: 'Flow Studio | AI 原生开发环境',
                description: '使用 Flow Studio 编排您的 AI 开发工作流。从灵感捕捉到商业化部署，为开发者提供完整的项目生命周期管理。',
            },
            en: {
                title: 'Flow Studio | AI-Native Development Environment',
                description: 'Orchestrate your AI development workflow with Flow Studio. Complete project lifecycle management from inspiration capture to commercial deployment.',
            },
            ja: {
                title: 'Flow Studio | AIネイティブ開発環境',
                description: 'Flow StudioでAI開発ワークフローを編成。インスピレーションのキャプチャから商用デプロイまで、完全なプロジェクトライフサイクル管理。',
            },
            ko: {
                title: 'Flow Studio | AI 네이티브 개발 환경',
                description: 'Flow Studio로 AI 개발 워크플로우를 조율하세요. 영감 포착에서 상용화 배포까지 완전한 프로젝트 라이프사이클 관리.',
            },
        },

        '/inspiration': {
            zh: {
                title: '灵感捕捉 | Flow Studio',
                description: '记录瞬时灵感，为未来积蓄创意能量。Flow Studio 灵感模块帮助您捕捉一闪而过的想法。',
            },
            en: {
                title: 'Inspiration Capture | Flow Studio',
                description: 'Capture fleeting ideas, fuel your creative energy. Flow Studio Inspiration module helps you record thoughts as they come.',
            },
            ja: {
                title: 'インスピレーション | Flow Studio',
                description: '瞬間のひらめきを記録し、未来のクリエイティブエネルギーを蓄える。Flow Studioインスピレーションモジュール。',
            },
            ko: {
                title: '영감 포착 | Flow Studio',
                description: '순간적인 아이디어를 기록하고 창의적 에너지를 축적하세요. Flow Studio 영감 모듈.',
            },
        },

        '/inspiration/archive': {
            zh: {
                title: '灵感归档 | Flow Studio',
                description: '查看历史灵感记录，回顾创意历程。',
            },
            en: {
                title: 'Inspiration Archive | Flow Studio',
                description: 'View inspiration history and review your creative journey.',
            },
            ja: {
                title: 'インスピレーションアーカイブ | Flow Studio',
                description: '過去のインスピレーション履歴を表示し、クリエイティブな旅を振り返る。',
            },
            ko: {
                title: '영감 보관소 | Flow Studio',
                description: '영감 기록을 확인하고 창의적인 여정을 되돌아보세요.',
            },
        },

        '/advanced': {
            zh: {
                title: '进阶开发 | Flow Studio',
                description: '复杂系统架构管理。模块化设计、依赖关系可视化、技术债务追踪。',
            },
            en: {
                title: 'Advanced Development | Flow Studio',
                description: 'Complex system architecture management. Modular design, dependency visualization, technical debt tracking.',
            },
            ja: {
                title: '高度な開発 | Flow Studio',
                description: '複雑なシステムアーキテクチャ管理。モジュール設計、依存関係の可視化、技術的負債の追跡。',
            },
            ko: {
                title: '고급 개발 | Flow Studio',
                description: '복잡한 시스템 아키텍처 관리. 모듈화 설계, 의존성 시각화, 기술 부채 추적.',
            },
        },

        '/blueprint': {
            zh: {
                title: '命令中心 | Flow Studio',
                description: '开发流程中的常用命令和链接管理。按阶段组织，一键复制，提升开发效率。',
            },
            en: {
                title: 'Command Center | Flow Studio',
                description: 'Manage common commands and links in your dev workflow. Organized by stage, one-click copy, boost development efficiency.',
            },
            ja: {
                title: 'コマンドセンター | Flow Studio',
                description: '開発ワークフロー内の一般的なコマンドとリンクを管理。ステージ別に整理、ワンクリックコピー、開発効率向上。',
            },
            ko: {
                title: '커맨드 센터 | Flow Studio',
                description: '개발 워크플로우에서 자주 사용하는 명령어와 링크 관리. 단계별 정리, 원클릭 복사로 개발 효율 향상.',
            },
        },

        '/data': {
            zh: {
                title: '数据中心 | Flow Studio',
                description: '管理您的数据和本地备份。导入、导出和数据恢复。',
            },
            en: {
                title: 'Data Center | Flow Studio',
                description: 'Manage your data and local backups. Import, export, and data recovery.',
            },
            ja: {
                title: 'データセンター | Flow Studio',
                description: 'データとローカルバックアップの管理。インポート、エクスポート、データ復元。',
            },
            ko: {
                title: '데이터 센터 | Flow Studio',
                description: '데이터 및 로컬 백업 관리. 가져오기, 내보내기 및 데이터 복구.',
            },
        },
    },

    // 获取页面 SEO 数据的辅助函数
    getPageSeo(path, lang) {
        // 移除语言前缀 (如果存在)
        // 简单的正则表达式无法处理所有情况，但对于预定义语言列表足够
        let normalizedPath = path;
        for (const l of this.supportedLangs) {
            if (path.startsWith('/' + l + '/') || path === '/' + l) {
                normalizedPath = path.substring(l.length + 1);
                if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
                break;
            }
        }

        if (normalizedPath === '') normalizedPath = '/';
        // 去除尾部斜杠（除了根路径）
        if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        if (normalizedPath.startsWith('/inspiration/c/')) {
            normalizedPath = '/inspiration';
        }

        const pageConfig = this.pages[normalizedPath];
        const siteConfig = this.site[lang] || this.site[this.defaultLang];

        if (!pageConfig) {
            return {
                title: siteConfig?.defaultTitle || 'Flow Studio',
                description: siteConfig?.defaultDescription || '',
            };
        }

        return pageConfig[lang]
            || pageConfig[this.defaultLang]
            || {
                title: siteConfig?.defaultTitle || 'Flow Studio',
                description: siteConfig?.defaultDescription || '',
            };
    },

    // 获取规范 URL
    getCanonicalUrl(path, lang) {
        let normalizedPath = path;
        for (const l of this.supportedLangs) {
            if (path.startsWith('/' + l + '/') || path === '/' + l) {
                normalizedPath = path.substring(l.length + 1);
                if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
                break;
            }
        }

        if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        if (lang === this.defaultLang) {
            return `${this.siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
        }
        return `${this.siteUrl}/${lang}${normalizedPath === '/' ? '' : normalizedPath}`;
    },

    // 获取所有语言的备用链接
    getAlternateLinks(path) {
        let normalizedPath = path;
        for (const l of this.supportedLangs) {
            if (path.startsWith('/' + l + '/') || path === '/' + l) {
                normalizedPath = path.substring(l.length + 1);
                if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
                break;
            }
        }

        if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        const links = [];
        for (const lang of this.supportedLangs) {
            let href;
            if (lang === this.defaultLang) {
                href = `${this.siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
            } else {
                href = `${this.siteUrl}/${lang}${normalizedPath === '/' ? '' : normalizedPath}`;
            }

            links.push({
                hreflang: lang,
                href: href,
            });
        }
        // x-default 指向默认语言
        links.push({
            hreflang: 'x-default',
            href: `${this.siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
        });
        return links;
    },
};

// CommonJS 导出 (用于 Node.js 脚本)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = seoConfig;
}

// ES Module 导出 (用于前端)
export default seoConfig;
