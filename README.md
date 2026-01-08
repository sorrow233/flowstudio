<p align="center">
  <img src="https://flowstudio.catzz.work/apple-touch-icon.png" width="80" alt="Flow Studio Logo"/>
</p>

<h1 align="center">Flow Studio</h1>

<p align="center">
  <strong>🚀 AI 原生开发环境 | AI-Native Development Environment</strong>
</p>

<p align="center">
  <a href="#简介">简介</a> •
  <a href="#核心功能">核心功能</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#国际化支持">国际化</a> •
  <a href="#贡献指南">贡献</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.7.0-blue?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite" alt="Vite">
</p>

---

## 简介

**Flow Studio** 是一个为 AI 时代打造的项目生命周期管理工具。它不仅仅是一个任务追踪器，而是一个从 **灵感萌发** 到 **商业化部署** 的完整开发流程编排平台。

### 设计哲学

- 🌱 **有机生长 (Organic Growth)**: 项目像植物一样经历萌芽、生长、开花的过程
- 🧩 **模块化驱动 (Lifecycle-Based Modular)**: 不同生命周期阶段对应独立的功能模块
- 💾 **本地优先 (Local-First)**: 数据优先存储在本地，通过 Yjs 实现静默同步

---

## 核心功能

### 📊 项目生命周期管理

Flow Studio 将项目开发划分为 6 个清晰的阶段：

| 阶段 | 图标 | 描述 |
|------|------|------|
| **灵感捕捉** | ✨ | 记录瞬时灵感，为未来积蓄创意能量 |
| **待定项目** | ⏰ | 使用"灵魂四问"验证项目可行性 |
| **主力开发** | 💻 | 5 阶段开发流程：骨架 → 功能 → 模块 → 优化 → 完成 |
| **进阶开发** | ⚡ | 复杂系统架构管理与技术债务追踪 |
| **终稿开发** | ✅ | 最终打磨：优化、新功能、缺陷修复 |
| **商业化** | 💼 | 定价策略、支付集成、上线清单 |

### 🎯 命令中心 (Command Center)

开发者的"外脑"与"兵工厂"：
- 📚 **指令库管理**: 按分类组织常用命令和链接
- 🔍 **智能推荐**: 根据当前开发阶段推荐相关指令
- ⚡ **一键导入**: 将命令快速导入到当前项目任务

### 🔄 云同步引擎

基于 **Local-First** 架构的分布式同步：
- 🔌 **离线可用**: 无网络时完全可用，联网后自动同步
- 🔀 **CRDT 同步**: 使用 Yjs 实现无冲突的多端同步
- 🔥 **Firebase 集成**: 用户认证与数据云端备份

### 🌍 多语言支持

完整的国际化方案：
- 🇨🇳 简体中文
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어

### 🎨 主题系统

- 🌙 **暗黑模式**: 舒适的深色界面
- ☀️ **亮色模式**: 清爽的浅色界面
- 🔄 **一键切换**: 导航栏快速切换主题

### ⌨️ 快捷键系统

全局快捷键支持，提升操作效率：
- 按 `Shift + ?` 查看所有可用快捷键
- 拦截浏览器默认快捷键，防止误操作

---

## 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3 | 前端框架 |
| **Vite** | 5.0 | 构建工具 |
| **React Router** | 7.x | 路由管理 |
| **Tailwind CSS** | 3.4 | 样式系统 |

### 状态与交互

| 技术 | 用途 |
|------|------|
| **Yjs** | CRDT 实时同步 |
| **y-indexeddb** | 本地持久化 |
| **Framer Motion** | 动画效果 |
| **Sonner** | Toast 通知 |

### 后端服务

| 技术 | 用途 |
|------|------|
| **Firebase** | 用户认证 + 数据存储 |
| **Cloudflare Pages** | 静态托管 + 边缘计算 |

### 工具库

| 技术 | 用途 |
|------|------|
| **Lucide React** | 图标库 |
| **clsx** + **tailwind-merge** | 样式合并 |
| **canvas-confetti** | 🎉 庆祝动画 |
| **uuid** | 唯一标识生成 |

---

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/flow-studio.git
cd flow-studio

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 可用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run generate:sitemap` | 生成 SEO sitemap |
| `npm run deploy:main` | 部署到 Cloudflare Pages |

---

## 项目结构

```
flow-studio/
├── public/                    # 静态资源
├── functions/                 # Cloudflare 边缘函数
│   └── _middleware.js         # SEO 元数据注入
├── scripts/                   # 构建脚本
│   └── generate-sitemap.cjs   # Sitemap 生成器
├── docs/                      # 项目文档
├── src/
│   ├── components/            # 共享组件
│   │   ├── Navbar.jsx         # 全局导航栏
│   │   ├── ErrorBoundary.jsx  # 错误边界
│   │   └── shared/            # 通用 UI 组件
│   │
│   ├── features/              # 功能模块 (按领域划分)
│   │   ├── auth/              # 用户认证
│   │   │   ├── AuthContext.jsx
│   │   │   └── AuthModal.jsx
│   │   │
│   │   ├── commands/          # 命令中心
│   │   │   └── CommandCenterModule.jsx
│   │   │
│   │   ├── i18n/              # 国际化
│   │   │   ├── LanguageContext.jsx
│   │   │   └── locales/       # 语言包
│   │   │       ├── zh.js      # 简体中文
│   │   │       ├── en.js      # English
│   │   │       ├── ja.js      # 日本語
│   │   │       └── ko.js      # 한국어
│   │   │
│   │   ├── lifecycle/         # 生命周期模块
│   │   │   ├── InspirationModule.jsx  # 灵感捕捉
│   │   │   ├── PendingModule.jsx      # 待定项目
│   │   │   ├── PrimaryDevModule.jsx   # 主力开发
│   │   │   ├── AdvancedDevModule.jsx  # 进阶开发
│   │   │   ├── FinalDevModule.jsx     # 终稿开发
│   │   │   ├── CommercialModule.jsx   # 商业化
│   │   │   └── components/            # 生命周期子组件
│   │   │
│   │   ├── settings/          # 设置管理
│   │   ├── share/             # 分享功能
│   │   ├── shortcuts/         # 快捷键系统
│   │   └── sync/              # 同步引擎
│   │       ├── SyncContext.jsx
│   │       ├── SyncEngine.js
│   │       └── useSyncStore.js
│   │
│   ├── hooks/                 # 自定义 Hooks
│   │   └── ThemeContext.jsx   # 主题管理
│   │
│   ├── lib/                   # 第三方库配置
│   ├── utils/                 # 工具函数
│   │
│   ├── App.jsx                # 应用入口
│   ├── main.jsx               # React 挂载点
│   └── index.css              # 全局样式
│
├── seo-config.js              # SEO 配置 (SSR 单一数据源)
├── tailwind.config.js         # Tailwind 配置
├── vite.config.js             # Vite 配置
└── package.json
```

---

## 国际化支持

Flow Studio 使用自研的轻量级 i18n 方案，支持完整的多语言体验。

### 使用方法

```jsx
import { useTranslation } from '../features/i18n';

function MyComponent() {
    const { t, currentLang, setLanguage } = useTranslation();
    
    return (
        <div>
            <h1>{t('navbar.inspiration')}</h1>
            <button onClick={() => setLanguage('en')}>English</button>
        </div>
    );
}
```

### 添加新语言

1. 在 `src/features/i18n/locales/` 创建新的语言文件（如 `fr.js`）
2. 在 `seo-config.js` 的 `supportedLangs` 中添加语言代码
3. 在 `LanguageContext.jsx` 中注册新语言

### SEO 优化

边缘中间件自动为搜索引擎爬虫注入正确语言的元数据：

```javascript
// functions/_middleware.js
// 自动检测语言并注入 <title>, <meta description>, <link hreflang>
```

---

## 开发指南

### 添加新的生命周期阶段

1. 在 `src/features/lifecycle/` 创建新模块文件
2. 在 `App.jsx` 中添加路由
3. 在 `Navbar.jsx` 中添加导航项
4. 在各语言文件中添加翻译

### 添加新的命令分类

在 `CommandCenterModule.jsx` 中扩展 `CATEGORIES` 常量。

### 自定义主题颜色

编辑 `src/index.css` 中的 CSS 变量：

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
}

.dark {
    --bg-primary: #1a1a1a;
    --bg-secondary: #0f0f0f;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
}
```

---

## 部署

### Cloudflare Pages

```bash
# 生成 sitemap 并部署到 main 分支
npm run deploy:main
```

### 手动部署

```bash
# 1. 构建
npm run build

# 2. 使用 Wrangler 部署
npx wrangler pages deploy dist --project-name flow-studio
```

---

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范

- 使用 ES Modules
- 遵循 React Hooks 规范
- 保持模块化，避免"上帝文件"
- 所有 UI 文本使用 i18n

---

## 更新日志

### v4.7.0 (2026-01-09)
- ✨ 完整的暗黑模式支持
- 🌍 四语国际化（中/英/日/韩）
- 🔍 SEO 边缘注入优化
- 🐛 多项 UI 修复与优化

---

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

<p align="center">
  Made with ❤️ by Flow Studio Team
</p>

<p align="center">
  <a href="https://flowstudio.catzz.work">🌐 在线访问</a> •
  <a href="https://github.com/your-username/flow-studio/issues">🐛 报告问题</a> •
  <a href="https://github.com/your-username/flow-studio/discussions">💬 讨论区</a>
</p>
