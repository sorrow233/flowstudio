<p align="center">
  <img src="https://flowstudio.catzz.work/apple-touch-icon.png" width="80" alt="Flow Studio Logo"/>
</p>

<h1 align="center">Flow Studio</h1>

<p align="center">
  <strong>🚀 AI 原生开发环境 | AI-Native Development Environment</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.1.0-blue?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare" alt="Cloudflare">
</p>

---

## 🌟 简介

**Flow Studio** 是一个深度集成的项目生命周期管理平台。它突破了传统任务追踪工具的局限，为开发者提供一个从 **灵感捕捉** 到 **商业化部署** 的全流程、沉浸式、AI 原生的开发工作台。

通过 **Local-First** 架构，Flow Studio 确保了数据的极致私密与快速响应，同时通过 **Yjs** 实现了跨设备的高级同步。

---

## 🔥 核心特性 (重构更新)

### 📊 模块化项目生命周期
项目不再是简单的列表，而是经历六个有机生长阶段：
- **灵感捕捉 (Inspiration)**: 分层级管理海量创意，支持二十四节气视图。
- **待定项目 (Pending)**: 核心“灵魂四问”筛选高价值项目。
- **主力开发 (Primary)**: 骨架、功能、模块、优化、完成五步法。
- **进阶开发 (Advanced)**: 复杂的架构规划与技术债追踪。
- **终稿开发 (Final)**: 极致打磨与 Bug 修复阶段。
- **商业化 (Commercial)**: 定价策略与发布清单管理。

### 💹 数据中心 (Data Center)
**全新重构**的贝塞尔面积图可视化系统：
- **颗粒度统计**: 支持日/周/月维度的代码工作量与灵感产出分析。
- **智能趋势**: 通过点线图直观展现项目的成长轨迹。
- **多语言适配**: 深度汉化与国际化支持。

### 🛠️ 指令中心 (Command Center)
您的开发“外脑”：
- **分类管理**: 按 AI 工具、后端、前端等维度组织常用 Prompt 和命令。
- **一键执行**: 快速复制与集成到项目流中。

### 🌍 SEO 边缘注入 (Edge SEO)
基于 Cloudflare Workers 的创新方案：
- **极致速度**: 在边缘节点动态注入 Hreflang 与元数据。
- **SEO 友好**: 确保单页应用在搜索引擎中拥有最佳表现。

---

## 🛠️ 技术栈

| 领域 | 技术方案 |
|------|----------|
| **前端框架** | React 18.3 + Vite 5.0 |
| **样式系统** | Tailwind CSS 3.4 + Framer Motion |
| **状态/同步** | Yjs (CRDT) + y-indexeddb |
| **云服务** | Firebase (Auth/Store) |
| **托管/边缘** | Cloudflare Pages + Functions |
| **多语言** | 自研轻量级 i18n 引擎 |

---

## 📁 项目结构 (特征驱动)

```text
src/
├── features/              # 核心功能切片
│   ├── lifecycle/         # 生命周期生命周期 (灵感、开发、商业化)
│   ├── blueprint/         # 蓝图与指令中心
│   ├── i18n/              # 国际化引擎与语言包 (zh/en/ja/ko)
│   ├── sync/              # Yjs 同步引擎
│   ├── shortcuts/         # 全局快捷键系统
│   └── settings/          # 系统配置
├── lib/                   # 第三方配置 (Firebase, etc.)
├── components/            # 跨功能共享组件
└── hooks/                 # 全局 Context 与通用 Hooks
```

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 生产构建与 SEO 生成
npm run build
npm run generate:sitemap

# 部署至 Main 分支 (Cloudflare)
npm run deploy:main
```

---

## 📝 贡献与规范

- **模块化**: 严禁编写“上帝文件”，所有新功能应属于 `features/` 下的子模块。
- **国际化**: 所有 UI 文本必须通过 `t()` 函数进行国际化。
- **Git 流程**: 默认提交至 `main` 分支，详细说明变更逻辑。

---

<p align="center">
  Made with ❤️ by Flow Studio Team
</p>
