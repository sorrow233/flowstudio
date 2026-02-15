<p align="center">
  <img src="./public/apple-touch-icon.png" width="88" alt="Flow Studio Logo"/>
</p>

<h1 align="center">Flow Studio</h1>

<p align="center">
  基于 <strong>React + Yjs + Firebase + Cloudflare Pages</strong> 的项目生命周期工作台
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.5.27-blue?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare" alt="Cloudflare">
</p>

---

## 项目定位

Flow Studio 是一个「从灵感到落地」的一体化工作台，当前代码已实现以下主流程：

- 灵感采集与分类（`/inspiration`）
- 长文写作与版本管理（`/writing`）
- 待孵化项目筛选（`/sprout`）
- 主力开发任务推进（`/flow`）
- 指令/Prompt 蓝图库（`/blueprint`）
- 数据统计中心（`/data`）
- 进阶项目工作区（`/advanced`，需在设置中开启）

---

## 已实现功能（按代码现状）

### 1) 灵感模块（Inspiration）

- 灵感卡片增删改查、颜色标记、归档
- 自定义分类管理（分类增删改）
- 多选批量分类迁移
- 内容复制、项目标签联想
- 支持通过 URL 参数 `import_text` 导入内容
- 支持 iOS/Web Share Target 接收共享内容（`/share-receiver`）
- 支持图片上传到 Cloudflare R2（白名单校验）
- 删除卡片时可清理内容内关联的 R2 图片

### 2) 写作模块（Writing）

- 文档分类、搜索、文档列表管理
- 富文本编辑（自定义标记格式）
- 自动保存（1 秒节流）
- 自动版本快照（按时间与内容变化阈值）
- 手动保存版本（快捷键 `Cmd/Ctrl + S`）
- 冲突检测与处理（保留本地 / 使用远端）
- 导出为 `Markdown / HTML / TXT`

### 3) 待定与主力开发（Sprout / Flow）

- 待定项目评分问答与毕业流程（Pending -> Primary）
- 毕业时按分类继承蓝图命令为初始任务
- 主力开发的阶段看板、任务增删改查、排序、命令关联
- 项目编辑、任务完成度推进、阶段晋级

### 4) 蓝图与分享（Blueprint / Share）

- 命令库管理：分类、标签、类型（utility/link）
- 命令按阶段关联（`stageIds`）
- 社区分享发布（Firestore `shared_commands`）
- 社区浏览与导入（分页、分类过滤）
- 分享落地页（`/share/:id`）

### 5) 数据中心（Data）

- 统计项目、命令、写作等多维数据
- 日/周/月聚合图表数据
- 总字数、今日、当周等核心指标

### 6) 同步与数据安全

- 本地优先：Yjs + IndexedDB 持久化
- 登录后云同步：Firestore 单文档状态同步
- 同步策略：防抖、最小推送间隔、失败重试（指数退避）
- 本地自动备份：每小时备份，保留 3 天
- 数据导入导出：JSON 预览、校验、合并/覆盖导入

### 7) 基础体验能力

- 多语言：`zh / en / ja / ko`
- 明暗主题切换
- 全局快捷键系统（含帮助面板）
- 认证：邮箱密码 + Google 登录

---

## 路由总览

| 路由 | 说明 |
| --- | --- |
| `/inspiration` | 灵感主模块 |
| `/inspiration/archive` | 灵感归档 |
| `/writing` | 写作模块 |
| `/sprout` | 待孵化项目 |
| `/flow` | 主力开发 |
| `/advanced` | 进阶项目模块（设置中开启） |
| `/blueprint` | 指令中心 |
| `/data` | 数据中心 |
| `/share/:id` | 分享详情页 |
| `/share-receiver` | Web Share 接收页 |

---

## 技术栈

- 前端：React 18 + Vite 5
- 状态与同步：Yjs + y-indexeddb + Firestore
- 动效与样式：Framer Motion + Tailwind CSS
- 后端能力：Cloudflare Pages Functions
- 认证/数据库：Firebase Auth + Firestore
- 部署：Cloudflare Pages（Wrangler）

---

## 目录结构

```text
src/
  components/                 # 全局共享组件
  data/                       # 默认模板等
  features/
    auth/                     # 登录注册
    blueprint/                # 命令中心
    i18n/                     # 国际化
    lifecycle/                # 灵感/写作/待定/开发/数据
    settings/                 # 数据导入导出
    share/                    # 社区分享
    shortcuts/                # 快捷键系统
    sync/                     # 同步引擎与 hooks
  hooks/                      # 全局 context hooks
  lib/                        # Firebase 等基础库
functions/
  api/upload.js               # R2 上传
  api/delete-image.js         # R2 删除
  api/import.js               # 跨项目导入
  _middleware.js              # SEO 注入
```

---

## 本地开发

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

---

## 部署（Cloudflare Pages）

项目内置脚本：

```bash
npm run deploy:main
```

该脚本会执行：

1. 生成 `sitemap`
2. 前端构建
3. 部署 `dist/` 到 Cloudflare Pages 的 `main` 分支

---

## Cloudflare Functions 环境变量

图片上传/删除依赖以下变量：

- `R2_CONFIG`（JSON 字符串）
- `UPLOAD_WHITELIST`（逗号分隔 UID）

`R2_CONFIG` 示例：

```json
{
  "accessKeyId": "xxx",
  "secretAccessKey": "xxx",
  "bucket": "flowstudio",
  "endpoint": "https://xxx.r2.cloudflarestorage.com",
  "publicUrl": "https://pub-xxx.r2.dev"
}
```

---

## 截图补充位置（你要补图就放这里）

建议把 README 用图统一放在：

- `docs/images/`

建议文件名：

- `docs/images/01-inspiration.png`
- `docs/images/02-writing.png`
- `docs/images/03-sprout.png`
- `docs/images/04-flow.png`
- `docs/images/05-blueprint.png`
- `docs/images/06-data.png`

然后在 README 对应模块下插入：

```md
![灵感模块截图](docs/images/01-inspiration.png)
![写作模块截图](docs/images/02-writing.png)
```

如果你希望首页先展示一张总览图，建议放在标题下面：

```md
![Flow Studio 总览](docs/images/00-overview.png)
```

---

## 备注

- 新用户（未登录）在空数据状态下会自动注入一份默认引导模板。
- 当前代码中 `deploy:main` 已固定部署到 `main` 分支。
