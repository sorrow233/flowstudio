/**
 * Flow Studio 默认模板数据 (中文版)
 * 设计理念：极简、极客、中文原生、注重实效
 */

export const DEFAULT_TEMPLATE = {
    // 灵感作为"新手引导"展示
    inspirations: [
        {
            id: "welcome-001",
            content: "你好啊，我们是FlowStudio 团队，感谢你的使用，请允许我们为你介绍这个软件",
            timestamp: Date.now()
        },
        {
            id: "guide-inspiration",
            content: "**inspiration** 让你不再孤单，可以收集你的想法，感动。（左滑删除卡片）",
            timestamp: Date.now() - 60000
        },
        {
            id: "guide-sprout",
            content: "**Sprout** 见证一个个想法是如何变成参天大树的，一回头，你会发现自己已走过路漫漫（点击左边圆点添加文本）",
            timestamp: Date.now() - 120000
        },
        {
            id: "guide-blueprint",
            content: "**blueprint** 让你不再害怕困难——每次不可承受之重，都会变成下一次的轻盈（任意点击卡片区域复制）",
            timestamp: Date.now() - 180000
        },
        {
            id: "guide-flow",
            content: "**Flow** 带你进入心流，一切都是那么自然流畅（双击卡片完成）",
            timestamp: Date.now() - 240000
        },
        {
            id: "start-journey",
            content: "现在，祝你开启心流之旅",
            timestamp: Date.now() - 300000
        }
    ],

    // 默认指令集 - 空白开始
    commands: [],

    pendingProjects: [],

    // 主项目 - 空白开始
    primaryProjects: [],

    customCategories: []
};
