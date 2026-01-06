# FUTURE_BETA.md — 务实演进路线图

> **定位**：基于现有代码逻辑，聚焦即时可落地的高影响力 UX/性能升级。每个特性都解决真实痛点。

---

## 一、项目流程增强 (Project Flow Enhancement)

> 现有 `STAGES` 流程已具备基础验证逻辑，但缺乏可视化与交互深度。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **拖拽式阶段切换** | 在 `BacklogPage` / `WorkshopPage` 中集成 `@dnd-kit/core`，监听 `onDragEnd` 调用 `moveItemToStage`。 |
| 2 | **阶段进度条可视化** | 在卡片顶部添加 `<ProgressBar>` 组件，根据 `item.stage` 索引计算百分比。 |
| 3 | **批量操作模式** | 添加多选 checkbox，在 `ProjectContext` 中扩展 `bulkMoveItems(ids, stage)` 方法。 |
| 4 | **项目归档与恢复** | 新增 `STAGES.ARCHIVED` 状态，UI 上添加"归档"按钮，归档项目可在独立视图恢复。 |
| 5 | **项目搜索与过滤** | 在页面头部添加 `<SearchInput>`，使用 `useMemo` 对 `items.filter()` 进行关键词/阶段筛选。 |
| 6 | **阶段切换动画** | 使用 `framer-motion` 的 `AnimatePresence` 实现卡片进入/退出过渡动画。 |
| 7 | **项目卡片展开详情** | 点击卡片展开抽屉/Modal 显示 `goal`、`link`、`createdAt` 等完整信息。 |
| 8 | **项目颜色自定义** | 在详情编辑中添加 `<ColorPicker>`，调用 `updateItem(id, { color })` 保存。 |
| 9 | **项目优先级标签** | 扩展 `item.priority: 'high' | 'medium' | 'low'`，卡片左上角显示对应颜色标记。 |
| 10 | **阶段完成率统计** | Dashboard 添加饼图/环形图，统计各阶段项目数量占比，使用 `recharts` 或纯 CSS。 |

---

## 二、Command Tower 进化 (Command Hub 2.0)

> 现有命令存储仅支持标题+内容，缺乏执行反馈与组织能力。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **命令收藏夹** | 在 `commands[stage]` 结构中添加 `starred: boolean`，独立渲染"常用"区块。 |
| 2 | **复制成功反馈** | 调用 `copyToClipboard` 后显示 Toast 通知（使用 `react-hot-toast`）。 |
| 3 | **命令变量替换** | 支持 `{{projectName}}` 语法，复制时弹窗让用户填充变量值。 |
| 4 | **命令分组/标签** | 扩展 `cmd.tags: string[]`，添加标签筛选器 UI。 |
| 5 | **命令搜索** | 顶部添加 `<SearchInput>`，对 `title` + `content` 进行模糊匹配。 |
| 6 | **命令导入/导出** | 添加"导出 JSON"/"导入 JSON"按钮，操作 `localStorage` 数据。 |
| 7 | **命令拖拽排序** | 使用 `@dnd-kit/sortable` 实现同阶段内命令顺序调整。 |
| 8 | **命令快捷键绑定** | 允许用户为命令绑定 `Ctrl+数字` 快捷键，使用 `useHotkeys` 监听。 |
| 9 | **命令执行历史** | 新增 `historyLog: { cmdId, timestamp }[]`，在侧边栏显示最近使用记录。 |
| 10 | **Markdown 渲染支持** | 对 `cmd.content` 中的 Markdown 语法进行 `react-markdown` 渲染预览。 |

---

## 三、身份认证与安全 (Auth & Security)

> 现有 Guest 模式已可用，但缺乏会话管理与数据安全机制。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **登录状态持久化提示** | 在 Layout 侧边栏底部显示当前用户邮箱或"访客模式"标识。 |
| 2 | **Guest 数据迁移** | 登录后检测 `localStorage` 中 Guest 数据，提示用户选择合并或覆盖。 |
| 3 | **会话超时自动登出** | 使用 `setTimeout` 监听用户活动，30 分钟无操作调用 `logout()`。 |
| 4 | **密码找回功能** | 集成 Firebase `sendPasswordResetEmail`，添加"忘记密码"入口。 |
| 5 | **邮箱验证流程** | 登录后检查 `user.emailVerified`，未验证则显示提示横幅。 |
| 6 | **第三方登录扩展** | 添加 GitHub OAuth（`GithubAuthProvider`）作为第二社交登录选项。 |
| 7 | **多设备登录检测** | 利用 Firebase `onIdTokenChanged` 检测 token 刷新事件，提示异地登录。 |
| 8 | **敏感操作二次确认** | 删除项目/命令时弹窗确认，避免误操作。 |
| 9 | **登录失败计数限制** | 前端记录连续失败次数，超过 5 次锁定表单 60 秒。 |
| 10 | **匿名数据加密存储** | 对 `localStorage` 中 Guest 数据使用 AES 加密（`crypto-js`）。 |

---

## 四、国际化与本地化深化 (i18n Mastery)

> 现有 5 语言基础已稳定，需深化日期/货币格式与内容完整性。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **相对时间显示** | 使用 `date-fns/formatDistanceToNow` + locale 动态显示"3 天前"。 |
| 2 | **货币格式化** | 在 Pricing 页面使用 `Intl.NumberFormat` 根据 locale 显示 ¥/$/€。 |
| 3 | **语言切换平滑过渡** | 切换语言时添加全局 `opacity` 过渡动画避免闪烁。 |
| 4 | **自动检测系统语言变化** | 使用 `window.matchMedia('(prefers-lang)')` 监听系统语言切换事件。 |
| 5 | **翻译缺失自动上报** | 在 `i18n.on('missingKey')` 中收集缺失 key，开发模式下控制台警告。 |
| 6 | **语言包按需加载** | 将 `common.json` 拆分为 `auth.json` / `modules.json`，使用 `i18next-http-backend` 懒加载。 |
| 7 | **RTL 布局预备** | 在 `index.css` 添加 `[dir="rtl"]` 选择器，为阿拉伯语/希伯来语预留样式。 |
| 8 | **语言偏好同步到云端** | 登录用户将 `i18nextLng` 同步到 Firestore `users/{uid}/preferences`。 |
| 9 | **可视化翻译编辑器入口** | 添加 DEV 模式下的"翻译模式"开关，直接在 UI 上编辑翻译文本。 |
| 10 | **翻译覆盖率仪表盘** | 在 Settings 中显示各语言翻译完成百分比（对比 key 数量）。 |

---

## 五、性能与体验优化 (Performance & UX)

> 现有架构清晰，但缺乏加载状态、骨架屏、错误边界等生产级打磨。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **骨架屏加载** | 在 `Dashboard` / 各模块添加 `<Skeleton>` 组件，数据加载中显示占位。 |
| 2 | **路由级代码分割** | 使用 `React.lazy()` + `Suspense` 对模块页面进行动态导入。 |
| 3 | **错误边界组件** | 创建 `<ErrorBoundary>` 包裹主内容，捕获渲染错误显示友好提示。 |
| 4 | **离线检测提示** | 使用 `navigator.onLine` + 事件监听，断网时显示全局横幅。 |
| 5 | **PWA 基础支持** | 添加 `vite-plugin-pwa`，生成 `manifest.json` 和 Service Worker。 |
| 6 | **图片懒加载** | 使用 `loading="lazy"` 或 `react-lazy-load-image-component` 优化图片。 |
| 7 | **虚拟滚动大列表** | 当项目数 > 50 时，使用 `react-window` 虚拟化渲染列表。 |
| 8 | **首屏关键 CSS 内联** | 使用 `vite-plugin-critical` 提取首屏 CSS 内联到 HTML。 |
| 9 | **预取重要路由** | 在 Dashboard 悬停模块卡片时使用 `<link rel="prefetch">` 预加载目标页面。 |
| 10 | **性能指标监控** | 集成 `web-vitals` 上报 LCP、FID、CLS 到控制台或分析服务。 |

---

## 六、UI/UX 精雕细琢 (Visual Polish)

> 遵循"和风侘び"美学，在简约中提升触感反馈与视觉层次。

| # | 特性 | 实现逻辑 |
|---|------|----------|
| 1 | **深色模式完善** | 补全所有组件的 `@media (prefers-color-scheme: dark)` 适配。 |
| 2 | **手动主题切换** | 在 Settings 中添加"浅色/深色/跟随系统"三选项，存储到 `localStorage`。 |
| 3 | **卡片悬停微动效** | 使用 `transform: translateY(-4px)` + `box-shadow` 增强悬浮层次感。 |
| 4 | **按钮点击涟漪效果** | 添加 Material 风格 ripple 效果到主要按钮。 |
| 5 | **表单验证即时反馈** | 输入框失焦时实时校验，显示红色边框和错误文字。 |
| 6 | **空状态插图** | 各模块无数据时显示 SVG 插图 + 引导文案（"添加你的第一个项目"）。 |
| 7 | **Tooltip 统一风格** | 创建全局 `<Tooltip>` 组件，替换原生 `title` 属性。 |
| 8 | **键盘导航支持** | 为主要交互元素添加 `tabindex`，支持 Tab/Enter 操作。 |
| 9 | **页面过渡动画** | 使用 `framer-motion` 的 `page transitions` 实现路由切换淡入淡出。 |
| 10 | **响应式断点优化** | 针对 tablet (768px) 和 mobile (480px) 完善侧边栏折叠与布局适配。 |

---

> 💡 **BETA 路线图总计 60+ 功能点**，每项均可独立拆分为 Sprint User Story，按优先级逐步推进。
