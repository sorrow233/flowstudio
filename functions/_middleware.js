/**
 * Cloudflare Pages Middleware for SEO Edge Injection
 * 
 * 核心功能：
 * 1. 检测爬虫 User-Agent
 * 2. 识别请求语言 (URL 前缀 > Accept-Language > 默认 zh)
 * 3. 动态注入对应语言的 SEO 标签到 HTML 响应中
 */

// SEO 配置内联 (Cloudflare Functions 不支持直接 import 根目录文件)
const seoConfig = {
    siteUrl: 'https://flowstudio.dev',
    defaultLang: 'zh',
    supportedLangs: ['zh', 'en', 'ja', 'ko'],

    site: {
        zh: {
            name: 'Flow Studio',
            defaultTitle: 'Flow Studio | AI 原生开发环境',
            defaultDescription: '使用 Flow Studio 编排您的 AI 开发工作流。从灵感到部署，全程陪伴。',
        },
        en: {
            name: 'Flow Studio',
            defaultTitle: 'Flow Studio | AI-Native Development Environment',
            defaultDescription: 'Orchestrate your AI development workflow with Flow Studio. From inspiration to deployment.',
        },
        ja: {
            name: 'Flow Studio',
            defaultTitle: 'Flow Studio | AIネイティブ開発環境',
            defaultDescription: 'Flow Studioで AI 開発ワークフローを編成。インスピレーションからデプロイまで。',
        },
        ko: {
            name: 'Flow Studio',
            defaultTitle: 'Flow Studio | AI 네이티브 개발 환경',
            defaultDescription: 'Flow Studio로 AI 개발 워크플로우를 조율하세요. 영감부터 배포까지.',
        },
    },

    pages: {
        '/': {
            zh: { title: 'Flow Studio | AI 原生开发环境', description: '使用 Flow Studio 编排您的 AI 开发工作流。从灵感捕捉到商业化部署，为开发者提供完整的项目生命周期管理。' },
            en: { title: 'Flow Studio | AI-Native Development Environment', description: 'Orchestrate your AI development workflow with Flow Studio. Complete project lifecycle management from inspiration capture to commercial deployment.' },
            ja: { title: 'Flow Studio | AIネイティブ開発環境', description: 'Flow StudioでAI開発ワークフローを編成。インスピレーションのキャプチャから商用デプロイまで、完全なプロジェクトライフサイクル管理。' },
            ko: { title: 'Flow Studio | AI 네이티브 개발 환경', description: 'Flow Studio로 AI 개발 워크플로우를 조율하세요. 영감 포착에서 상용화 배포까지 완전한 프로젝트 라이프사이클 관리.' },
        },
        '/inspiration': {
            zh: { title: '灵感捕捉 | Flow Studio', description: '记录瞬时灵感，为未来积蓄创意能量。Flow Studio 灵感模块帮助您捕捉一闪而过的想法。' },
            en: { title: 'Inspiration Capture | Flow Studio', description: 'Capture fleeting ideas, fuel your creative energy. Flow Studio Inspiration module helps you record thoughts as they come.' },
            ja: { title: 'インスピレーション | Flow Studio', description: '瞬間のひらめきを記録し、未来のクリエイティブエネルギーを蓄える。Flow Studioインスピレーションモジュール。' },
            ko: { title: '영감 포착 | Flow Studio', description: '순간적인 아이디어를 기록하고 창의적 에너지를 축적하세요. Flow Studio 영감 모듈.' },
        },
        '/pending': {
            zh: { title: '待定项目 | Flow Studio', description: '管理等待启动的项目构思。使用 Flow Studio 的灵魂四问验证项目可行性。' },
            en: { title: 'Pending Projects | Flow Studio', description: 'Manage project ideas awaiting kickoff. Validate project viability with Flow Studio Soul Questions.' },
            ja: { title: '保留プロジェクト | Flow Studio', description: 'キックオフ待ちのプロジェクトアイデアを管理。Flow Studioの魂の4つの質問でプロジェクトの実行可能性を検証。' },
            ko: { title: '대기 프로젝트 | Flow Studio', description: '시작을 기다리는 프로젝트 아이디어를 관리하세요. Flow Studio 영혼의 질문으로 프로젝트 실행 가능성을 검증.' },
        },
        '/primary': {
            zh: { title: '主力开发 | Flow Studio', description: '5 阶段开发流程：骨架 → 功能 → 模块 → 优化 → 完成。任务管理与进度追踪完美结合。' },
            en: { title: 'Primary Development | Flow Studio', description: '5-stage development flow: Skeleton → Functionality → Modules → Optimization → Completion. Task management meets progress tracking.' },
            ja: { title: 'メイン開発 | Flow Studio', description: '5段階の開発フロー：スケルトン → 機能 → モジュール → 最適化 → 完成。タスク管理と進捗追跡の完璧な融合。' },
            ko: { title: '메인 개발 | Flow Studio', description: '5단계 개발 플로우: 스켈레톤 → 기능 → 모듈 → 최적화 → 완료. 작업 관리와 진행 상황 추적의 완벽한 조화.' },
        },
        '/advanced': {
            zh: { title: '进阶开发 | Flow Studio', description: '复杂系统架构管理。模块化设计、依赖关系可视化、技术债务追踪。' },
            en: { title: 'Advanced Development | Flow Studio', description: 'Complex system architecture management. Modular design, dependency visualization, technical debt tracking.' },
            ja: { title: '高度な開発 | Flow Studio', description: '複雑なシステムアーキテクチャ管理。モジュール設計、依存関係の可視化、技術的負債の追跡。' },
            ko: { title: '고급 개발 | Flow Studio', description: '복잡한 시스템 아키텍처 관리. 모듈화 설계, 의존성 시각화, 기술 부채 추적.' },
        },
        '/final': {
            zh: { title: '终稿开发 | Flow Studio', description: '项目最终打磨阶段。模块优化、新功能追加、缺陷修复三阶段管理。' },
            en: { title: 'Final Development | Flow Studio', description: 'Project final polish stage. Three-phase management: optimization, feature additions, bug fixes.' },
            ja: { title: 'ファイナル開発 | Flow Studio', description: 'プロジェクトの最終ポリッシュ段階。最適化、新機能追加、バグ修正の3フェーズ管理。' },
            ko: { title: '최종 개발 | Flow Studio', description: '프로젝트 최종 마무리 단계. 최적화, 기능 추가, 버그 수정 3단계 관리.' },
        },
        '/commercial': {
            zh: { title: '商业化 | Flow Studio', description: '从开发到市场。定价策略、支付集成、营销渠道、上线清单一站式管理。' },
            en: { title: 'Commercialization | Flow Studio', description: 'From development to market. Pricing strategy, payment integration, marketing channels, launch checklist - all in one place.' },
            ja: { title: '商業化 | Flow Studio', description: '開発から市場へ。価格戦略、決済統合、マーケティングチャネル、ローンチチェックリストを一元管理。' },
            ko: { title: '상용화 | Flow Studio', description: '개발에서 시장으로. 가격 전략, 결제 통합, 마케팅 채널, 출시 체크리스트 올인원 관리.' },
        },
        '/commands': {
            zh: { title: '命令中心 | Flow Studio', description: '开发流程中的常用命令和链接管理。按阶段组织，一键复制，提升开发效率。' },
            en: { title: 'Command Center | Flow Studio', description: 'Manage common commands and links in your dev workflow. Organized by stage, one-click copy, boost development efficiency.' },
            ja: { title: 'コマンドセンター | Flow Studio', description: '開発ワークフロー内の一般的なコマンドとリンクを管理。ステージ別に整理、ワンクリックコピー、開発効率向上。' },
            ko: { title: '커맨드 센터 | Flow Studio', description: '개발 워크플로우에서 자주 사용하는 명령어와 링크 관리. 단계별 정리, 원클릭 복사로 개발 효율 향상.' },
        },
    },
};

// 爬虫 User-Agent 检测正则
const CRAWLER_REGEX = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver|applebot|twitterbot|linkedinbot|pinterest|slackbot|whatsapp|telegrambot|discordbot/i;

/**
 * 检测是否为爬虫
 */
function isCrawler(userAgent) {
    return CRAWLER_REGEX.test(userAgent || '');
}

/**
 * 从 URL 路径中提取语言前缀
 * /en/inspiration -> { lang: 'en', path: '/inspiration' }
 * /inspiration -> { lang: null, path: '/inspiration' }
 */
function extractLangFromPath(pathname) {
    const langMatch = pathname.match(/^\/(en|ja|ko)(\/.*)?$/);
    if (langMatch) {
        return {
            lang: langMatch[1],
            path: langMatch[2] || '/',
        };
    }
    return {
        lang: null,
        path: pathname,
    };
}

/**
 * 从 Accept-Language 头部解析首选语言
 */
function parseAcceptLanguage(acceptLanguage) {
    if (!acceptLanguage) return null;

    const langMap = {
        'zh': 'zh',
        'zh-cn': 'zh',
        'zh-hans': 'zh',
        'en': 'en',
        'en-us': 'en',
        'en-gb': 'en',
        'ja': 'ja',
        'ja-jp': 'ja',
        'ko': 'ko',
        'ko-kr': 'ko',
    };

    const langs = acceptLanguage.toLowerCase().split(',');
    for (const lang of langs) {
        const code = lang.split(';')[0].trim();
        if (langMap[code]) {
            return langMap[code];
        }
        // 尝试匹配语言前缀
        const prefix = code.split('-')[0];
        if (langMap[prefix]) {
            return langMap[prefix];
        }
    }
    return null;
}

/**
 * 获取页面 SEO 数据
 */
function getPageSeo(path, lang) {
    const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
    const pageConfig = seoConfig.pages[normalizedPath];

    if (!pageConfig) {
        const siteData = seoConfig.site[lang] || seoConfig.site[seoConfig.defaultLang];
        return {
            title: siteData.defaultTitle,
            description: siteData.defaultDescription,
        };
    }

    return pageConfig[lang] || pageConfig[seoConfig.defaultLang];
}

/**
 * 获取规范 URL
 */
function getCanonicalUrl(path, lang) {
    const basePath = path === '/' ? '' : path;
    if (lang === seoConfig.defaultLang) {
        return `${seoConfig.siteUrl}${basePath}`;
    }
    return `${seoConfig.siteUrl}/${lang}${basePath}`;
}

/**
 * 生成 hreflang 链接标签
 */
function generateHreflangTags(path) {
    const tags = [];
    for (const lang of seoConfig.supportedLangs) {
        tags.push(`<link rel="alternate" hreflang="${lang}" href="${getCanonicalUrl(path, lang)}" />`);
    }
    tags.push(`<link rel="alternate" hreflang="x-default" href="${getCanonicalUrl(path, seoConfig.defaultLang)}" />`);
    return tags.join('\n    ');
}

/**
 * 注入 SEO 标签到 HTML
 */
function injectSeoTags(html, seoData, lang, path) {
    let modifiedHtml = html;

    // 1. 替换 <html lang="...">
    modifiedHtml = modifiedHtml.replace(
        /<html\s+lang="[^"]*"/i,
        `<html lang="${lang}"`
    );

    // 2. 替换 <title>
    modifiedHtml = modifiedHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${seoData.title}</title>`
    );

    // 3. 替换 <meta name="description">
    modifiedHtml = modifiedHtml.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${seoData.description}" />`
    );

    // 4. 在 </head> 前插入 hreflang 标签和 canonical
    const hreflangTags = generateHreflangTags(path);
    const canonicalUrl = getCanonicalUrl(path, lang);
    const additionalTags = `
    <!-- SEO Edge Injection -->
    <link rel="canonical" href="${canonicalUrl}" />
    ${hreflangTags}
    <meta property="og:title" content="${seoData.title}" />
    <meta property="og:description" content="${seoData.description}" />
    <meta property="og:locale" content="${lang === 'zh' ? 'zh_CN' : lang === 'ja' ? 'ja_JP' : lang === 'ko' ? 'ko_KR' : 'en_US'}" />
    <meta name="twitter:title" content="${seoData.title}" />
    <meta name="twitter:description" content="${seoData.description}" />
`;

    modifiedHtml = modifiedHtml.replace('</head>', `${additionalTags}</head>`);

    return modifiedHtml;
}

/**
 * Cloudflare Pages Middleware 入口
 */
export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';

    // 静态资源直接放行
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp4|webm)$/i)) {
        return next();
    }

    // API 请求直接放行
    if (url.pathname.startsWith('/api/')) {
        return next();
    }

    // sitemap.xml 直接放行
    if (url.pathname === '/sitemap.xml') {
        return next();
    }

    // 非爬虫直接返回 SPA
    if (!isCrawler(userAgent)) {
        // 处理语言前缀路由重写 (用户访问 /en/inspiration 时仍然返回 SPA)
        const { lang, path } = extractLangFromPath(url.pathname);
        if (lang) {
            // 重写 URL 到根路径，让 SPA 路由处理
            const newUrl = new URL(request.url);
            newUrl.pathname = path;
            return fetch(new Request(newUrl.toString(), request));
        }
        return next();
    }

    // === 爬虫处理逻辑 ===

    // 1. 获取原始 HTML 响应
    const response = await next();

    // 只处理 HTML 响应
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
        return response;
    }

    // 2. 检测语言
    const { lang: urlLang, path } = extractLangFromPath(url.pathname);
    const detectedLang = urlLang || parseAcceptLanguage(acceptLanguage) || seoConfig.defaultLang;

    // 3. 获取 SEO 数据
    const seoData = getPageSeo(path, detectedLang);

    // 4. 读取并修改 HTML
    const html = await response.text();
    const modifiedHtml = injectSeoTags(html, seoData, detectedLang, path);

    // 5. 返回修改后的响应
    return new Response(modifiedHtml, {
        status: response.status,
        headers: {
            ...Object.fromEntries(response.headers),
            'content-type': 'text/html; charset=utf-8',
            'x-seo-injected': 'true',
            'x-seo-lang': detectedLang,
        },
    });
}
