# 📘 Flow Studio 系统架构深度文档

本文档详尽记录了 Flow Studio 的核心设计哲学、全生命周期架构、视觉系统及关键模块实现逻辑。旨在为开发者提供一个**清晰、可视、深度**的代码地图。

---

## 1. 🏗 全局架构设计 (System Architecture)

### 1.1 核心设计哲学
Flow Studio 不仅仅是一个项目管理工具，它是一个**“有机的孵化器”**。
- **有机生长 (Organic Growth)**: 项目不再是冷冰冰的列表项，而是像植物一样经历萌芽、生长、开花的过程。
- **模块化驱动 (Lifecycle-Based Modular)**: 不同的生命周期阶段对应完全独立的 Feature Module，防止界面臃肿，让开发者专注于当下的任务。
- **离线优先 (Local-First)**: 数据优先存储在本地，通过 Yjs + Cloudflare KV 实现多端静默同步，确保极致的响应速度。

### 1.2 架构概览 (Architecture Diagram)

```mermaid
graph TD
    User((开发者/用户)) --> Navbar[全局导航 StageNavigation]
    
    subgraph Core_State [核心状态管理]
        Auth[AuthContext]
        Sync[SyncContext (Yjs + IndexedDB)]
        Project[ProjectContext]
    end
    
    Navbar --> Auth
    Navbar --> Sync
    
    subgraph Lifecycle_System [生命周期流转系统]
        direction TB
        Stage0[Inspiration 灵感] -->|孵化| Stage1[Pending 待办]
        Stage1 -->|毕业| Stage2[Primary 开发]
        Stage2 -->|发布| Stage3[Commercial 商业化]
    end

    Sync <-->|Snapshot Sync| Cloud[(Cloudflare/Firebase)]
    Project --> Lifecycle_System
```

---

## 2. 🎨 全局视觉与交互系统 (Visual System)

我们的设计语言追求**“高级感 (Premium)”**与**“生命力 (Vitality)”**。

### 2.1 Rose 色彩系统 (Brand Colors)
虽然每个阶段有其代表色，但 **Rose (玫瑰色)** 是我们的品牌灵魂，传达热情与创造力。

| Token | Hex Value | 用途说明 |
| :--- | :--- | :--- |
| `rose-500` | `#f43f5e` | **主要品牌色，平衡视觉重心** |
| `rose-600` | `#e11d48` | 主要交互色 (Button Hover) |

### 2.2 阶段专属色 (Stage Identity)
为了强化“进度感”，每个开发阶段拥有独立的视觉识别色：

| Stage ID | Label | Color | Twin.macro Class | 寓意 |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Skeleton** | Blue | `bg-blue-400` | 蓝图与结构 |
| **2** | **Functionality** | Emerald | `bg-emerald-400` | 生长与功能 |
| **3** | **Modules** | Violet | `bg-violet-400` | 模块与集成 |
| **4** | **Optimization** | Amber | `bg-amber-400` | 打磨与光泽 |
| **5** | **Completion** | Rose | `bg-rose-400` | 完工与发布 |
| **6** | **Commercial** | Yellow | `bg-yellow-400` | 价值与金币 |

---

## 3. 🧩 核心业务模块详解 (Core Modules)

### 3.1 🌱 PendingModule (孵化阶段)
路径: `src/features/lifecycle/PendingModule.jsx`

这是项目的“胚胎期”。我们不仅是记录待办，更是**强制思考**。

#### **核心功能 (Features)**
1.  **灵魂四问 (Soul Questions)**: 必须回答关于“清晰度、自用需求、长期价值、利他之心”的四个问题，倒逼深度思考。
2.  **树苗可视化 (Visual Growth)**:
    - **Score 0-2**: 脆弱的萌芽 (`text-yellow-500`)
    - **Score 3-4**: 茁壮的树苗 (`text-lime-500`)
    - **Score 5+**: 稳定的形态 (`text-emerald-600`)
3.  **圣光特效 (Holy Glow)**: 当项目具有“利他之心”或特殊标记时，卡片会产生流光溢彩的边框动画 (`project.hasHolyGlow`)。

#### **关键函数解析**

| 函数名 | 核心逻辑与设计意图 |
| :--- | :--- |
| `handleAnswer(projectId, qId, val)` | **逻辑**: 更新 `metadata.answers` 并根据 "Yes" 的数量计算 `score`。<br>**意图**: 将定性的“思考”量化为数据，分数越高，树苗越茂盛。 |
| `getTreeVisual(stage, projectId)` | **逻辑**: 对于 Advanced Stage (>=6)，根据 `projectId` 哈希值确定树种 (Sakura, Maple, Ginkgo, Cedar)。<br>**意图**: 赋予成熟项目独特的个性化视觉，樱花代表浪漫，松柏代表坚韧。 |
| `handleGraduate(project)` | **逻辑**: 将项目从 Pending 列表移除，并在 Primary 列表中新建条目 (Stage 2)。<br>**意图**: 充满仪式感的“毕业”，标志着从构思转向执行。 |

### 3.2 🛠 Command Center (指令中心)
路径: `src/features/commands/CommandCenterModule.jsx`

**定位**: 开发者的“外脑”与“兵工厂”。不仅存储指令，更管理开发者的工作流上下文。

#### **核心功能 (Features)**
1.  **多身份配置 (Profiles)**: 支持切换不同的开发身份（如 Default, Work, Personal），实现指令库的隔离与聚焦。
2.  **社区浏览 (Community)**: 查看并一键导入社区共享的高效指令。
3.  **库导入 (Library)**: 将通用指令库中的条目快速复用到当前阶段。

#### **模块实现细节**

| 组件/功能 | 说明 |
| :--- | :--- |
| `ProfileModal` | 管理用户的多重身份，数据持久化存储于 `localStorage`。 |
| `CommandList` | 支持拖拽排序，支持按 Category (Frontend/Backend/DevOps) 筛选。 |
| `handleImport(cmd)` | 智能判断当前 Profile，如果跨 Profile 则执行克隆 (Clone)，否则仅添加 Stage 引用。 |

### 3.3 � CommercialModule (商业化阶段)
路径: `src/features/lifecycle/CommercialModule.jsx`

**定位**: 帮助开发者完成从“代码”到“商品”的跨越。

- **功能**:
    - **Strategy Generator**: 选择 Revenue Model (Freemium/Ads) 和 Payment Provider (Stripe/Paddle)。
    - **Launch Checklist**: 交互式的发布检查单。
    - **AI Directive**: 一键生成商业化配置的 Prompt，方便 AI 辅助后续开发。

---

## 4. 🔄 SyncEngine v2 (分布式同步引擎)
路径: `src/features/sync/SyncEngine.js`

Flow Studio 采用 **Single-Document Snapshot** 策略，而非复杂的增量更新流，以确保最终一致性。

### 4.1 核心机制

```javascript
// 数据结构 (Firestore: users/{uid}/rooms/{docId})
{
    state: "base64_encoded_yjs_state", // 完整的 Yjs 文档快照
    version: 12,                       // 乐观锁版本号
    updatedAt: timestamp,
    sessionId: "unique_client_id"      // 防止回环更新
}
```

### 4.2 同步流程详解

| 步骤 | 动作 | 说明 |
| :--- | :--- | :--- |
| **1. 本地更新** | `doc.transact()` | 用户操作立即反映在 UI (Optimistic UI)。SyncEngine 监听到 `update` 事件，标记 `isDirty = true`。 |
| **2. 智能防抖** | `schedulePush()` | 默认防抖 10s，由于是全量快照，必须减少高频写入。最小推送间隔 30s。 |
| **3. 推送快照** | `tryPush()` | 将整个 Yjs Doc 编码为 Uint8Array -> Base64。版本号 `version + 1`，写入 Firestore。 |
| **4. 远端监听** | `onSnapshot()` | 此时其他客户端监听到变更。如果 `sessionId` 不是自己，则下载 Base64 并 `Y.applyUpdate` 合并状态。 |

**设计思考**:
为什么选择 **Snapshot** 而非 **Delta**？
- **可靠性**: 避免 Delta 丢失导致的状态错乱。
- **成本**: 减少 Firestore 的读写碎片，一次读取即可获得最新全站状态。
- **简单性**: 极大简化了回滚和冲突解决逻辑。

---

## 5. 🚀 总结

Flow Studio 的代码库是一个**高度内聚、低耦合**的有机体：
1. **视觉上**：通过 **Stage Colors** 和 **Dynamic Trees** 建立直观的进度反馈。
2. **逻辑上**：严格遵循生命周期，从 `Pending` (思考) -> `Primary` (执行) -> `Commercial` (变现)。
3. **数据上**：SyncEngine v2 实现了极其健壮的 **Local-First** 体验，让数据如呼吸般自然同步。

> **Pro Tip**: 任何时候感到迷茫，回到 Inspiration 阶段多种一颗树，或者去 Command Center 整理一下你的武器库。
