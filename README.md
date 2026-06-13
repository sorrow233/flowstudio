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

Flow Studio 是一款追求**极致视觉**与**顺滑体验**的创作工作台。
集成灵感捕捉、蓝图管理与数据洞察，让想法记录和复盘保持轻盈。

---

### Gallery

**01 Inspiration / 灵感**
![Inspiration](docs/images/灵感.png)

**02 Blueprint / 蓝图**
![Lifecycle](docs/images/蓝图.png)

**03 Data / 洞察**
![Data](docs/images/数据.png)

---

### Features

- **Inspiration**: 卡片式灵感管理，支持图片联动与拖拽分类。
- **Blueprint**: 管理常用命令和链接，按阶段组织并支持快速复制。
- **Data Center**: 可视化热力图与趋势分析，回顾创作习惯。
- **Cloud Sync**: 基于 Yjs + Firebase 的多端实时同步，支持离线优先。

---

### Architecture

- **Frontend**: React, Vite, TailwindCSS
- **State**: Yjs (CRDTs), IndexedDB, Zustand
- **Backend**: Cloudflare Functions, Firebase
