// Korean Language Resources
export default {
    // Navbar
    navbar: {
        inspiration: '인스피레이션',
        pending: '보류',
        primary: '메인 개발',
        advanced: '고급',
        final: '최종',
        commercial: '상용화',
        command: '명령',
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
        new: '새로 만들기',
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
        subtitle: '순간의 영감을 포착하여 미래를 위해 축적하세요.',
        placeholder: '떠오르는 아이디어를 기록하세요...',
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

    // Primary Development Module
    primary: {
        title: '주력 개발',
        subtitle: '현재 적극적으로 개발 중인 프로젝트',
        emptyState: '개발 중인 프로젝트가 없습니다',
        tasks: '작업',
        progress: '진행 상황',
        noTasks: '작업 없음',
        addTask: '작업 추가',
    },

    // Advanced Development Module
    advanced: {
        title: '고급 개발',
        subtitle: '더 깊은 작업이 필요한 복잡한 프로젝트',
        emptyState: '고급 프로젝트가 없습니다',
    },

    // Final Development Module
    final: {
        title: '최종 개발',
        subtitle: '최종 마무리 단계에 진입한 프로젝트',
        emptyState: '최종 단계의 프로젝트가 없습니다',
        stageOptimization: '모듈 최적화',
        stageNewModule: '새 기능 추가',
        stageBugFix: '버그 수정',
    },

    // Commercial Module
    commercial: {
        title: '상용화',
        subtitle: '시장 출시 준비가 된 프로젝트',
        emptyState: '상용화 프로젝트가 없습니다',
        launchChecklist: '출시 체크리스트',
    },

    // Command Center
    commands: {
        title: '명령 센터',
        subtitle: '개발 워크플로우의 일반적인 명령과 링크 관리',
        emptyState: '이 단계에는 명령이 없습니다',
        emptyStateHint: '새 명령을 추가하거나 라이브러리에서 가져오세요',
        community: '커뮤니티',
        library: '라이브러리',
        newCommand: '새로 만들기',
        deleteConfirmLast: '이 명령을 영구적으로 삭제하시겠습니까?',
        deleteConfirmStage: '이 단계에서 명령을 제거하시겠습니까? (다른 단계에는 유지됩니다)',
        browseCommunity: '커뮤니티 공유 찾아보기',
        importFromLibrary: '전역 라이브러리에서 가져오기',
        stage: '단계',
    },

    // Development Stages (5 Stages)
    devStages: {
        1: {
            label: '뼈대',
            title: '아키텍처 청사진',
            desc: '구조적 무결성, 라우팅 로직 및 컴포넌트 계층 구조 정의',
        },
        2: {
            label: '기능',
            title: '핵심 로직',
            desc: '주요 비즈니스 로직, 데이터 흐름 및 상태 관리 구현',
        },
        3: {
            label: '모듈',
            title: '시스템 통합',
            desc: '인증, 데이터베이스 바인딩 및 외부 API 서비스 연결',
        },
        4: {
            label: '최적화',
            title: '성능 다듬기',
            desc: 'UI/UX 전환 효과 개선, 렌더링 최적화, 엣지 케이스 처리',
        },
        5: {
            label: '완료',
            title: '프로덕션 준비 완료',
            desc: '최종 QA, 빌드 검증 및 프로덕션 환경 배포',
        },
    },

    // Final Stages (3 Stages)
    finalStages: {
        1: {
            label: '최적화',
            title: '모듈 최적화',
            desc: '기존 구현을 분석하고 병목 현상을 식별하며 성능과 가독성을 높이기 위해 코드 최적화',
        },
        2: {
            label: '새 모듈',
            title: '기능 추가',
            desc: '새로운 모듈 또는 기능을 계획 및 구현하고 기존 시스템과의 원활한 통합 보장',
        },
        3: {
            label: '수정',
            title: '버그 해결',
            desc: '보고된 버그를 식별, 재현 및 해결하여 시스템 안정성과 신뢰성 확보',
        },
    },

    // Stage Empty States
    stageEmptyStates: {
        1: {
            title: '아키텍트의 빈 캔버스',
            desc: '핵심 라우트 및 레이아웃 컴포넌트 정의부터 시작하세요. 튼튼한 기초는 미래의 기술 부채를 방지합니다.',
        },
        2: {
            title: '엔진이 아직 시동되지 않았습니다',
            desc: '구조가 준비되었습니다. 이제 로직과 상호작용으로 생명을 불어넣으세요.',
        },
        3: {
            title: '시스템 오프라인',
            desc: '독립적인 모듈들을 하나의 통합된 생태계로 연결할 때입니다.',
        },
        4: {
            title: '거친 모서리',
            desc: '앱은 작동하지만 "고급스러운 느낌"이 필요합니다. 디테일에 집중하세요.',
        },
        5: {
            title: '이륙 전 체크리스트',
            desc: '성공이 눈앞입니다. 모든 시스템이 준비되었는지 확인하세요.',
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
        final: '최종',
    },

    // Soul Queries
    questions: {
        clarity: {
            text: '자신이 진정으로 원하는 것이 무엇인지 명확하게 표현할 수 있습니까?',
            sub: '명확성',
        },
        dogfood: {
            text: '개발한 후에, 본인 스스로도 자주 사용할 것 같습니까?',
            sub: '자기 수요',
        },
        impact: {
            text: '그것이 미래에 당신의 삶을 장기적으로 변화시킬 수 있습니까?',
            sub: '장기적 가치',
        },
        value: {
            text: '이 프로젝트가 진정으로 사람들에게 도움이 될 것이라고 믿습니까?',
            sub: '이타심',
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
