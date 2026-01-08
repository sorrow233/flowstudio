# Flow Studio 模块结构分析

根据代码库结构分析，Flow Studio 主要由以下 **4 个核心业务各个模块** 和 **1 个全局基础模块** 组成。

## 1. 核心业务模块

### 1.1 Lifecycle Components (项目全生命周期模块)
- **核心定位**：软件的主体部分，管理项目从“灵感”到“商业化”的全流程开发阶段。
- **路径**：`src/features/lifecycle`
- **次要模块 (子组件)**:
    - **主要阶段页面**:
        - `InspirationModule.jsx`: 灵感阶段，负责记录和管理初步的创意。
        - `PendingModule.jsx`: 孵化/待办阶段，包含项目树状可视化成长逻辑。
        - `PrimaryDevModule.jsx`: 初级开发阶段，核心开发界面之一。
        - `FinalDevModule.jsx`: 最终开发阶段，交付前的收尾。
        - `AdvancedDevModule.jsx`: 高级开发阶段，用于更复杂的系统架构设计。
        - `CommercialModule.jsx`: 商业化阶段，发布和商业化逻辑。
    - **Primary Development 子功能**:
        - `TaskList`: 任务列表管理。
        - `ImportCommandModal`: 从指令中心导入指令的弹窗。
        - `StageNavigation`: 阶段切换导航。
    - **Advanced Development 子功能**:
        - `AdvancedProjectWorkspace`: 高级工作区主界面。
        - `ModuleLibraryModal` / `ModuleCard`: 模块化组件库管理。
        - `ArchitectureImportModal`: 系统架构图导入。

### 1.2 Command Center Module (指令/代码中心模块)
- **核心定位**：作为“兵工厂”或“知识库”，管理可复用的指令、代码片段和Prompt库，为项目开发提供支持。
- **路径**：`src/features/commands`
- **次要模块 (子组件)**:
    - `CommandCenterModule.jsx`: 主入口文件。
    - `CommandList`: 指令列表，包含搜索和过滤。
    - `CommandForm`: 新建或编辑指令的表单。
    - `LibraryImportModal`: 导入外部指令库。
    - `CategoryRenameModal`: 分类管理。

### 1.3 Authentication Module (用户认证模块)
- **核心定位**：处理用户登录、注册、Session 保持以及用户身份识别。
- **路径**：`src/features/auth`
- **次要模块 (子组件)**:
    - `AuthModal`: 登录/注册弹窗界面。
    - `AuthContext`: 用户登录状态管理 (Context API)。

### 1.4 Synchronization Module (云端同步模块)
- **核心定位**：负责本地数据与云端数据库（如 Supabase/Cloudflare）的实时同步、冲突解决和数据迁移。
- **路径**：`src/features/sync`
- **次要模块 (子组件)**:
    - `useSyncStore`: 核心同步逻辑 Hook (基于 Yjs/CRDT)。
    - `SyncContext`: 同步状态上下文。

## 2. 全局基础模块

### 2.1 Global UI Components (全局基础组件)
- **核心定位**：提供全局通用的 UI 框架。
- **路径**：`src/components`
- **次要模块 (子组件)**:
    - `Navbar`: 顶部导航栏，集成路由、用户头像、同步状态。
    - `ErrorBoundary`: 全局错误边界。
