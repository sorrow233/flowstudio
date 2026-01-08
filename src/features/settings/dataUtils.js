/**
 * 用户数据导入/导出工具函数
 */

import { STORAGE_KEYS } from '../../utils/constants';

const EXPORT_VERSION = '1.0';

/**
 * 收集并返回所有用户数据
 * @param {Y.Doc} doc - Y.Doc 实例
 * @returns {Object} 导出的数据对象
 */
export const exportAllData = (doc) => {
    const data = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
            pendingProjects: [],
            primaryProjects: [],
            commands: [],
            customCategories: []
        }
    };

    // 1. 从 Y.Doc 获取项目数据
    if (doc) {
        try {
            const pendingArray = doc.getArray('pending_projects');
            data.data.pendingProjects = pendingArray.toJSON();
        } catch (e) {
            console.warn('[Export] Failed to get pending_projects:', e);
        }

        try {
            const primaryArray = doc.getArray('primary_projects');
            data.data.primaryProjects = primaryArray.toJSON();
        } catch (e) {
            console.warn('[Export] Failed to get primary_projects:', e);
        }
    }

    // 2. 从 localStorage 获取命令和分类
    try {
        const savedCmds = localStorage.getItem(STORAGE_KEYS.COMMANDS);
        if (savedCmds) {
            data.data.commands = JSON.parse(savedCmds);
        }
    } catch (e) {
        console.warn('[Export] Failed to get commands:', e);
    }

    try {
        const savedCats = localStorage.getItem('flowstudio_categories_custom');
        if (savedCats) {
            data.data.customCategories = JSON.parse(savedCats);
        }
    } catch (e) {
        console.warn('[Export] Failed to get categories:', e);
    }

    return data;
};

/**
 * 验证导入数据的格式
 * @param {Object} data - 要验证的数据
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateImportData = (data) => {
    const errors = [];

    if (!data || typeof data !== 'object') {
        errors.push('数据格式无效：不是有效的 JSON 对象');
        return { valid: false, errors };
    }

    if (!data.version) {
        errors.push('缺少版本号');
    }

    if (!data.data || typeof data.data !== 'object') {
        errors.push('缺少 data 字段');
        return { valid: false, errors };
    }

    const { pendingProjects, primaryProjects, commands, customCategories } = data.data;

    if (pendingProjects && !Array.isArray(pendingProjects)) {
        errors.push('pendingProjects 必须是数组');
    }

    if (primaryProjects && !Array.isArray(primaryProjects)) {
        errors.push('primaryProjects 必须是数组');
    }

    if (commands && !Array.isArray(commands)) {
        errors.push('commands 必须是数组');
    }

    if (customCategories && !Array.isArray(customCategories)) {
        errors.push('customCategories 必须是数组');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * 将数据导入到存储中
 * @param {Y.Doc} doc - Y.Doc 实例
 * @param {Object} data - 已验证的导入数据
 * @param {'merge' | 'replace'} mode - 导入模式
 */
export const importData = (doc, data, mode = 'merge') => {
    const { pendingProjects, primaryProjects, commands, customCategories } = data.data;

    // 1. 导入 Y.Doc 项目数据
    if (doc) {
        doc.transact(() => {
            // Pending Projects
            if (pendingProjects && pendingProjects.length > 0) {
                const yPending = doc.getArray('pending_projects');
                if (mode === 'replace') {
                    yPending.delete(0, yPending.length);
                }
                // 使用 Y.Map 以支持 CRDT
                const yMaps = pendingProjects.map(p => {
                    const Y = doc.constructor; // 获取 Y 引用
                    const yMap = new Y.Map();
                    Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                    return yMap;
                });
                yPending.push(yMaps);
            }

            // Primary Projects
            if (primaryProjects && primaryProjects.length > 0) {
                const yPrimary = doc.getArray('primary_projects');
                if (mode === 'replace') {
                    yPrimary.delete(0, yPrimary.length);
                }
                const yMaps = primaryProjects.map(p => {
                    const Y = doc.constructor;
                    const yMap = new Y.Map();
                    Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                    return yMap;
                });
                yPrimary.push(yMaps);
            }
        });
    }

    // 2. 导入 localStorage 数据
    if (commands && commands.length > 0) {
        if (mode === 'replace') {
            localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
        } else {
            // 合并模式：去重合并
            const existingCmds = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMANDS) || '[]');
            const existingIds = new Set(existingCmds.map(c => c.id));
            const newCmds = commands.filter(c => !existingIds.has(c.id));
            localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify([...existingCmds, ...newCmds]));
        }
    }

    if (customCategories && customCategories.length > 0) {
        if (mode === 'replace') {
            localStorage.setItem('flowstudio_categories_custom', JSON.stringify(customCategories));
        } else {
            const existingCats = JSON.parse(localStorage.getItem('flowstudio_categories_custom') || '[]');
            const existingIds = new Set(existingCats.map(c => c.id));
            const newCats = customCategories.filter(c => !existingIds.has(c.id));
            localStorage.setItem('flowstudio_categories_custom', JSON.stringify([...existingCats, ...newCats]));
        }
    }
};

/**
 * 触发 JSON 文件下载
 * @param {Object} data - 要下载的数据
 * @param {string} filename - 文件名
 */
export const downloadAsJson = (data, filename = 'flowstudio-backup.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * 读取上传的 JSON 文件
 * @param {File} file - 上传的文件
 * @returns {Promise<Object>}
 */
export const readJsonFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (err) {
                reject(new Error('无法解析 JSON 文件'));
            }
        };
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsText(file);
    });
};
