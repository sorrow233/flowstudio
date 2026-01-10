/**
 * Flow Studio 默认模板数据 (中文版)
 * 设计理念：极简、极客、中文原生、注重实效
 */

export const DEFAULT_TEMPLATE = {
    // 灵感作为"新手引导"展示
    inspirations: [
        {
            id: "welcome-001",
            content: "你好啊，这里是FlowStudio 团队",
            timestamp: Date.now()
        },
        {
            id: "guide-inspiration",
            content: "**Inspiration** 可以收集你的想法，感动。（左滑删除卡片）",
            timestamp: Date.now() - 60000
        },
        {
            id: "guide-sprout",
            content: "**Sprout** 见证一个个想法是如何变成参天大树的（添加随记）",
            timestamp: Date.now() - 120000
        },
        {
            id: "guide-blueprint",
            content: "**Blueprint** 每次不可承受之重，都会变成下一次的轻盈（点击卡片复制）",
            timestamp: Date.now() - 180000
        },
        {
            id: "guide-flow",
            content: "**Flow** 带你进入心流（双击卡片完成）",
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
