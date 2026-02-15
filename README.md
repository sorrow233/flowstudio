<p align="center">
  <img src="./public/apple-touch-icon.png" width="88" alt="Flow Studio Logo"/>
</p>

<h1 align="center">Flow Studio</h1>

<p align="center">从灵感到落地的项目工作台（当前文档仅保留代码核心介绍）</p>

---

## 核心代码介绍（单块）

Flow Studio 采用 `React + Yjs + Firebase + Cloudflare Functions`，核心逻辑集中在以下代码模块：

- 灵感系统：`/Users/kang/Documents/Flow Studio/src/features/lifecycle/InspirationModule.jsx`
  - 灵感卡片增删改查、分类管理、批量迁移、归档、导入（`import_text`）、图片上传/删除联动。

- 写作系统：`/Users/kang/Documents/Flow Studio/src/features/lifecycle/WritingModule.jsx`
  - 文档管理、富文本编辑、自动保存、版本快照、冲突处理、导出（Markdown/HTML/TXT）。

- 项目孵化与开发：
  - 待定项目：`/Users/kang/Documents/Flow Studio/src/features/lifecycle/PendingModule.jsx`
  - 主力开发：`/Users/kang/Documents/Flow Studio/src/features/lifecycle/PrimaryDevModule.jsx`
  - 实现从项目筛选到任务推进的全流程（含命令模板继承与阶段推进）。

- 命令蓝图库与分享：`/Users/kang/Documents/Flow Studio/src/features/blueprint/CommandCenterModule.jsx`
  - 命令分类、标签、阶段绑定、社区发布/浏览/导入。

- 数据中心：`/Users/kang/Documents/Flow Studio/src/features/lifecycle/DataCenterModule.jsx`
  - 聚合项目/命令/写作数据，生成日周月统计视图。

- 同步引擎（核心）：`/Users/kang/Documents/Flow Studio/src/features/sync/SyncEngine.js`
  - 本地优先（IndexedDB）+ 云端同步（Firestore），含防抖、最小间隔、重试与冲突合并。

- 数据备份与迁移：
  - 本地备份：`/Users/kang/Documents/Flow Studio/src/features/sync/LocalBackupService.js`
  - 数据导入导出：`/Users/kang/Documents/Flow Studio/src/features/settings/dataUtils.js`

- 云函数接口：
  - 上传图片：`/Users/kang/Documents/Flow Studio/functions/api/upload.js`
  - 删除图片：`/Users/kang/Documents/Flow Studio/functions/api/delete-image.js`
  - 跨项目导入：`/Users/kang/Documents/Flow Studio/functions/api/import.js`

---

## 图片补充位置

把 README 用图放到：`/Users/kang/Documents/Flow Studio/docs/images/`

示例：

- `/Users/kang/Documents/Flow Studio/docs/images/01-inspiration.png`
- `/Users/kang/Documents/Flow Studio/docs/images/02-writing.png`

对应写法：

```md
![灵感模块](docs/images/01-inspiration.png)
![写作模块](docs/images/02-writing.png)
```
