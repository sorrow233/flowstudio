// Korean Language Resources
export default {
    // Navbar
    navbar: {
        inspiration: '인스피레이션',
        pending: '보류',
        primary: '메인 개발',
        advanced: '고급',
        commercial: '상용화',
        command: '청사진',
        cloudSync: '클라우드 동기화',
        sync: '동기화',
        dataManagement: '데이터 관리',
    },

    // Common
    common: {
        save: '저장',
        cancel: '취소',
        delete: '삭제',
        edit: '편집',
        add: '추가',
        confirm: '확인',
        undo: '실행 취소',
        copy: '복사',
        copied: '복사됨',
        search: '검색...',
        notePlaceholder: '메모 추가...',
        new: '새로 만들기',
        profile: '프로필',
        all: '전체',
        allCategories: '모든 카테고리',
        loading: '로딩 중...',
        noData: '데이터 없음',
        lightMode: '라이트 모드',
        darkMode: '다크 모드',
    },

    // Inspiration Module
    inspiration: {
        title: '인스피레이션',
        subtitle: '찰나의 아이디어를 포착하여 미래의 에너지를 축적하세요.',
        placeholder: '한순간의 생각을 기록하세요...',
        emptyState: '영감이 없습니다. 첫 번째 아이디어를 기록해 보세요.',
        ideaDeleted: '영감이 삭제되었습니다',
        cmdEnter: 'CMD + ENTER',
    },

    // Pending Module
    pending: {
        title: '보류 중인 프로젝트',
        subtitle: '시작을 기다리는 프로젝트 구상',
        emptyState: '보류 중인 프로젝트가 없습니다',
        addProject: '프로젝트 추가',
        projectName: '프로젝트 이름',
        projectDescription: '프로젝트 설명',
    },

    // Primary Dev Module
    primary: {
        title: '개발',
        subtitle: '현재 활발히 개발 중인 프로젝트',
        emptyState: '개발 중인 프로젝트가 없습니다',
        tasks: '작업',
        progress: '진행 상황',
        noTasks: '작업 없음',
        addTask: '작업 추가',
    },

    // Advanced Refinement
    advanced: {
        title: '고급 워크스페이스',
        subtitle: '커스텀 플로우 및 고급 아키텍처 설계.',
        emptyState: '고급 프로젝트가 없습니다',
        createProject: '새 프로젝트',
        projectName: '프로젝트 이름...',
        create: '생성',
        total: '합계',
        noProjectsTitle: '고급 프로젝트가 없습니다',
        noProjectsDesc: '프로젝트를 생성하여 커스텀 아키텍처 플로우를 시작하세요',
        createFirst: '+ 첫 번째 프로젝트 생성',
        newProjectDefaultTitle: '새로운 고급 프로젝트',
        newProjectDefaultDesc: '커스텀 워크플로우',
    },

    // Commercial Module
    commercial: {
        title: '상용화',
        subtitle: '시장 출시 준비가 된 프로젝트',
        emptyState: '상용화 프로젝트가 없습니다',
        launchChecklist: '출시 체크리스트',
        strategy: '상용 전략',
        strategyDesc: '경제 엔진을 설계합니다. 가치를 책정하고, 채널을 선택하며, 출시를 준비하세요.',
        strategyReadyDesc: '출시 시스템이 검증되었습니다. 이제 초점은 성장 엔진과 사용자 확보로 이동합니다.',
        copyDirective: '운영 지침 복사',
        project: '프로젝트',
        noProjectsTitle: '상용화 프로젝트가 없습니다',
        noProjectsDesc: '메인 개발 단계에서 프로젝트를 졸업시켜 전략을 언락하세요.',
        financialInfrastructure: '1. 금융 인프라',
        revenueModel: '2. 수익 모델',
        pricingStructure: '3. 가격 체계',
        growthPhase: '성장 단계 활성화',
        growthTitle: '엔진이 준비되었습니다.',
        growthSubtitle: '사용자를 확보할 때입니다.',
        growthDesc: '인프라가 구축되었습니다. 금융 레일이 연결되었습니다. 당신의 전략은 이제 순수하게 유통 및 채널 최적화에 집중됩니다.',
        activeChannels: '활성 채널',
        launchReadiness: '출시 준비도',
        readiness: '준비도',
        models: {
            subscription: '구독 (SaaS)',
            subscriptionDesc: '월간/연간 요금제를 통한 반복 수익.',
            one_time: '일시불 구매',
            one_timeDesc: '평생 액세스를 위한 단일 결제.',
            freemium: '프리미엄 (Freemium)',
            freemiumDesc: '핵심 기능은 무료, 업그레이드는 유료.',
            ads: '광고 수익형',
            adsDesc: '광고를 통한 수익화.',
        },
        payment: {
            stripe: 'Stripe',
            stripeDesc: '커스텀 SaaS의 표준.',
            lemonsqueezy: 'Lemon Squeezy',
            lemonsqueezyDesc: 'MoR, 글로벌 세금 처리 지원.',
            paddle: 'Paddle',
            paddleDesc: '통합 B2B 결제 지원.',
            revenuecat: 'RevenueCat',
            revenuecatDesc: '앱 내 결제(IAP)에 최적.',
        },
        marketing: {
            twitter: 'X / Twitter',
            producthunt: 'Product Hunt',
            reddit: 'Reddit',
            linkedin: 'LinkedIn',
            seo: 'SEO 및 블로그',
            short_video: 'TikTok / 쇼츠',
            ads: '유료 광고',
        },
        checklist: {
            market_fit: '문제-해결 적합성 확인',
            waitlist: '대기자 명단 페이지 라이브',
            pricing: '가격 모델 확정',
            legal: '이용 약관 및 개인정보 처리방침',
            analytics: '분석 및 추적 설정',
            payments: '결제 게이트웨이 연결',
        },
        pricingTiers: {
            personal: '퍼스널',
            pro: '프로',
            enterprise: '엔터프라이즈',
            custom: '커스텀',
            features: {
                core: '핵심 기능',
                community: '커뮤니티 지원',
                everything: '무료 버전의 모든 기능 포함',
                priority: '우선 지원',
                analytics: '고급 분석',
                sso: 'SSO 및 보안',
                manager: '전담 매니저',
            }
        },
        directive: {
            title: '상용 운영 지침',
            model: '1. 비즈니스 모델',
            type: '유형',
            desc: '설명',
            pricing: '가격',
            infrastructure: '2. 금융 인프라',
            provider: '제공업체',
            rationale: '근거',
            growth: '3. 성장 엔진',
            channels: '활성 채널',
            readiness: '4. 출시 준비도',
            generated: 'Flow Studio 상용 모듈에서 생성됨',
            notSelected: '선택되지 않음',
            tbd: '미정',
            pending: '선택 대기 중',
            none: '선택 없음',
        }
    },

    // Command Center
    commands: {
        title: '청사진 센터',
        subtitle: '개발 워크플로우의 일반적인 청사진과 링크 관리',
        emptyState: '이 단계에는 명령이 없습니다',
        emptyStateHint: '새 명령을 추가하거나 라이브러리에서 가져오세요',
        community: '커뮤니티',
        library: '라이브러리',
        newCommand: '새로 만들기',
        deleteConfirmLast: '이 명령을 영구적으로 삭제하시겠습니까?',
        deleteConfirmStage: '이 단계에서 명령을 제거하시겠습니까? (다른 단계에는 남음)',
        browseCommunity: '커뮤니티 공유 탐색',
        importFromLibrary: '전역 라이브러리에서 가져오기',
        stage: '단계',
        // Profile related
        profileName: '프로필 이름',
        addProfile: '새 프로필',
        editProfile: '프로필 편집',
        deleteProfile: '프로필 삭제',
        deleteProfileConfirm: '이 프로필을 삭제하시겠습니까? 하위 명령은 데이터에 남습니다.',
        // Library related
        globalLibrary: '전역 명령 라이브러리',
        importFromOther: '다른 단계/프로필에서 가져오기',
        noImportable: '가져올 수 있는 명령이 없습니다',
        noImportableHint: '유틸리티 및 링크 유형만 전역적으로 공유할 수 있습니다',
        renameHint: '더블 클릭하여 이름 변경',
    },

    // Development Stages (5 stages)
    devStages: {
        1: {
            label: '뼈대',
            title: '아키텍처 청사진',
            desc: '구조적 무결성, 라우팅 로직 및 컴포넌트 계층 구조 정의.',
        },
        2: {
            label: '기능',
            title: '코어 로직',
            desc: '주요 비즈니스 로직, 데이터 플로우 및 상태 관리 구현.',
        },
        3: {
            label: '모듈',
            title: '시스템 통합',
            desc: '인증, 데이터베이스 바인딩 및 외부 API 서비스 연결.',
        },
        4: {
            label: '최적화',
            title: '퍼포먼스 다듬기',
            desc: 'UI/UX 트랜지션을 미세 조정하고 리렌더링을 최적화하며 예외 상황 처리.',
        },
        5: {
            label: '완료',
            title: '프로덕션 준비 완료',
            desc: '최종 QA, 빌드 검증 및 프로덕션 환경 배포.',
        },
    },

    // Stage Empty States
    stageEmptyStates: {
        1: {
            title: '아키텍트의 빈 캔버스',
            desc: '핵심 라우트 및 레이아웃 컴포넌트 정의부터 시작하세요. 튼튼한 기초는 미래의 기술 부채를 방지합니다.',
        },
        2: {
            title: '엔진尚未始動',
            desc: '구조가 준비되었습니다. 이제 로직과 인터랙션으로 생명력을 불어넣으세요.',
        },
        3: {
            title: '시스템 오프라인',
            desc: '고립된 모듈들을 하나의 통합된 생태계로 연결할 때입니다.',
        },
        4: {
            title: '거친 부분 다듬기',
            desc: '앱이 작동하지만 「고급스러운 느낌」이 필요합니다. 세부 사항에 집중하세요.',
        },
        5: {
            title: '비행 전 체크리스트',
            desc: '성공이 눈앞에 있습니다. 모든 시스템이 준비되었는지 확인하세요.',
        },
    },

    // Command Categories
    categories: {
        general: '일반',
        frontend: '프론트엔드',
        backend: '백엔드',
        database: '데이터베이스',
        devops: 'DevOps',
        testing: '테스트',
    },

    // Soul Questions
    questions: {
        clarity: {
            text: '자신이 진정으로 원하는 것이 무엇인지 명확하게 표현할 수 있습니까?',
            sub: '명확성',
        },
        dogfood: {
            text: '개발한 후 자기 자신이 자주 사용합니까?',
            sub: '도그푸딩',
        },
        impact: {
            text: '그것이 장기적으로 당신의 삶을 바꿀 수 있습니까?',
            sub: '장기적 영향',
        },
        value: {
            text: '이 프로젝트가 진정으로 다른 사람들에게 도움이 될 것이라고 믿습니까?',
            sub: '이타주의',
        },
    },

    // Sync Status
    sync: {
        synced: '동기화됨',
        syncing: '동기화 중...',
        offline: '오프라인',
        error: '동기화 오류',
        pending: '동기화 대기 중',
    },

    // Auth
    auth: {
        signIn: '로그인',
        signOut: '로그아웃',
        signInWithGoogle: 'Google로 로그인',
    },
};
