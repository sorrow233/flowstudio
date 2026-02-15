<p align="center">
  <img src="./public/apple-touch-icon.png" width="88" alt="Flow Studio Logo"/>
</p>

# Flow Studio

<p align="center">
  <strong>From Inspiration to Realization.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Yjs-Sync-green?style=flat-square" alt="Yjs">
  <img src="https://img.shields.io/badge/Design-Glassmorphism-purple?style=flat-square" alt="Design">
</p>

---

### Overview

Flow Studio 是一款追求**极致视觉**与**心流体验**的全流程工作台。
集成灵感捕捉、沉浸写作、项目孵化与数据洞察，打造从点子到落地的完整闭环。

---

### Gallery

> *请在 `docs/images/` 目录下放入对应截图*

**01 Inspiration / 灵感**
![Inspiration](docs/images/01-inspiration.png)

**02 Flow Writing / 写作**
![Writing](docs/images/02-writing.png)

**03 Lifecycle / 孵化**
![Lifecycle](docs/images/03-lifecycle.png)

**04 Data / 洞察**
![Data](docs/images/04-datacenter.png)

---

### Features

- **Inspiration**: 卡片式灵感管理，支持图片联动与拖拽分类。
- **Flow Writing**: 基于 Prosemirror 的沉浸式编辑器，支持 Markdown、实时统计与版本回溯。
- **Lifecycle**: 从 `Pending` 到 `Flow` 的项目全生命周期管理，集成里程碑与命令蓝图。
- **Data Center**: 可视化热力图与趋势分析，回顾创作习惯。
- **Cloud Sync**: 基于 Yjs + Firebase 的多端实时同步，支持离线优先。

---

### Architecture

- **Frontend**: React, Vite, TailwindCSS
- **State**: Yjs (CRDTs), IndexedDB, Zustand
- **Backend**: Cloudflare Functions, Firebase
