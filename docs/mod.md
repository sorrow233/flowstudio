# Flow Studio 深度技术文档

本文档旨在详尽记录 Flow Studio 的代码库功能、设计细节及构建逻辑。

## 1. 全局设计与构建逻辑

### 1.1 设计哲学
Flow Studio 采用 **模块化生命周期驱动 (Lifecycle-Driven Modular Architecture)** 的设计模式。
- **核心理念**：将一个抽象的“项目”看作一个有生命的对象，从“灵感 (Inspiration)”萌芽，经历“孵化 (Pending)”和“开发 (Development)”，最终走向“商业化 (Commercial)”。
- **构建逻辑**：
    - 应用的状态流转由 `ProjectContext` 和 `StageNavigation` 控制。
    - **页面搭建**：不仅仅是路由跳转，而是基于当前项目的 `stage` 属性动态渲染对应的 Feature Module。这种设计避免了传统的 SPA 路由割裂感，让用户感觉是在同一个工作台上打磨同一个作品。

### 1.2 全局视觉系统 (Visual System)
我们的视觉设计追求“高级感”与“动态交互”，核心配色数据源于 `tailwind.config.js` 及 CSS 变量。

#### **色彩系统 (Color Palette)**
用户界面主要采用 **Rose (玫瑰色)** 系列作为主色调，传达热情与创造力。

**Tailwind Rose 系列配置 (Brand Colors):**
- `rose-50`: `#fff1f2` (极淡背景)
- `rose-100`: `#ffe4e6` (淡雅背景)
- `rose-200`: `#fecdd3` (交互弱反馈)
- `rose-300`: `#fda4af` (装饰性边框)
- `rose-400`: `#fb7185` (次要按钮/高亮)
- `rose-500`: `#f43f5e` (主要品牌色，平衡点)
- `rose-600`: `#e11d48` (主要交互色，Hover 态)
- `rose-700`: `#be123c` (深色强调)
- `rose-800`: `#9f1239` (文字/重视觉元素)
- `rose-900`: `#881337` (极深装饰)

**CSS 变量定义 (`index.css`):**
- `--bg-primary`: `#ffffff` (卡片/主内容背景)
- `--bg-secondary`: `#f8f9fa` (应用整体背景，营造层次感)
- `--text-primary`: `#1a1a1a` (主要正文，高对比度)
- `--text-secondary`: `#666666` (次要信息，低干扰)

#### **字体栈 (Typography)**
优先使用现代化无衬线字体，确保多语言环境下的阅读体验：
`font-family: "Outfit", "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;`

---

## 2. 核心业务模块详解 (Core Modules)

### 2.1 Lifecycle Components (生命周期组件)
路径: `src/features/lifecycle`
这是应用的心脏，根据项目阶段加载不同界面。

#### **InspirationModule (灵感阶段)**
- **功能**：捕捉稍纵即逝的想法。
- **设计细节**：采用极简输入框，减少干扰。

#### **PendingModule (孵化/待办阶段)**
路径: `src/features/lifecycle/PendingModule.jsx`
- **功能**：通过问答形式评估项目价值，决定是否继续投入。
- **核心函数**：
    - **`handleAnswer(projectId, questionId, value)`**: 记录用户对“长期价值”或“利他之心”的思考。设计初衷是强迫开发者冷静下来思考项目的意义。
    - **`getSaplingState(score)`**: 核心视觉逻辑。根据项目的评估分数，返回树苗的生长状态。分数越高，树苗越茂盛。这是为了直观反馈项目的“生命力”。
    - **`getTreeVisual(stage)`**: 根据项目阶段（Stage > 1）返回对应的树木 SVG 或图片。确保即便到了后期，用户也能在列表中看到项目的成长历史。
    - **`handleGraduate(project)`**: “毕业”逻辑。当用户确认项目可行时，将其状态从 Pending 推进到 Development，像毕业典礼一样充满仪式感。

#### **Primary/Advanced Development (开发阶段)**
- **PrimaryDevModule**: 专注于执行。包含 `TaskList`（任务清单）和 `CommandList`（指令调用）。
- **AdvancedDevModule**: 专注于架构。用于总览系统设计。

#### **CommercialModule (商业化阶段)**
路径: `src/features/lifecycle/CommercialModule.jsx`
- **功能**：制定商业模式。
- **页面搭建**：利用 `UpdateStrategy` 卡片展示多种变现模式（Freemium, Ads 等）。
- **核心函数**：
    - **`handleUpdate(updates)`**: 将选定的商业策略同步回项目数据中心。设计原因是为了让商业决策和代码开发紧密绑定，不脱离实际。

### 2.2 Command Center (指令中心)
路径: `src/features/commands`
**核心定位**：开发者的“兵工厂”。用户在此存储常用的 Prompt、代码片段或工作流指令。

#### **CommandCenterModule.jsx**
- **构建逻辑**：左侧为分类导航，右侧为指令列表卡片。
- **核心函数**：
    - **`handleAdd()`**: 创建新指令。
    - **`handleImport(cmd)`**: 将选中的指令“导入”到当前活跃的项目开发计划中。这是连接“知识库”与“工作台”的桥梁。
    - **`handleCopy(id, content)`**: 一键复制指令内容。做了防抖和 Toast 反馈，优化用户体验。
    - **`handleReorder(reorderedCommands)`**: 拖拽排序逻辑。允许用户自定义指令优先级。

### 2.3 Authentication (用户认证)
路径: `src/features/auth`

#### **AuthModal.jsx**
- **功能**：处理登录与注册。
- **核心函数**：
    - **`validateEmailDomain(email)`**: 这是一个细微的安全设计。检查邮箱后缀，确保符合系统允许的域名列表（如有）。
    - **`handleGoogleLogin()`**: 集成 OAuth 登录流。
    - **`handleSubmit(e)`**: 传统的表单提交处理，包含错误状态管理。

---

## 3. 分布式同步架构 (Synchronization)

### 3.1 Sync Engine (基于 Yjs)
路径: `src/features/sync`
我们不依赖单纯的 HTTP API CURD，而是采用 **CRDT (Conflict-free Replicated Data Type)** 技术实现多端实时同步。

#### **useSyncStore.js**
- **设计原因**：为了支持离线优先 (Local-First) 和多设备无缝切换。
- **核心函数**：
    - **`useSyncedProjects(doc, arrayName)`**: 
        - 监听 Y.Array 的变化。
        - 自动将 Yjs 的二进制数据变更映射为 React 状态 (useState)，触发界面更新。
    - **`updateProject(id, updates)`**: 
        - **原子操作**：在 Yjs 事务 (Transaction) 中执行更新，确保数据一致性。
        - 相比普通 API 调用，这种方式不需要等待服务器响应即可在本地乐观更新 UI。
    - **`useDataMigration()`**: 
        - 负责处理从旧版 LocalStorage 数据到 Yjs 结构的迁移。这是一个一次性的“摆渡人”逻辑。

---

## 4. 全局组件 (Global UI)
- **Navbar**: 
    - 不仅仅是导航，它集成了 `SyncStatus`（同步状态指示灯）。
    - **设计细节**：当数据正在同步时显示动画，同步完成显示静止图标。让用户对数据安全有感知。
- **StageNavigation**:
    - 位于页面底部或侧边，作为“时间轴”导航，引导用户在项目的不同生命周期之间穿梭。

---

> **总结**：Flow Studio 的每一行代码，从颜色变量的定义到 Yjs 的同步逻辑，都是为了服务于“让创造更有机、更流畅”这一核心目标。
