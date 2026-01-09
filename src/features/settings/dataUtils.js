/**
 * 用户数据导入/导出工具函数
 * IMPORTANT: This module now uses synced Y.Doc arrays for all data.
 */

import * as Y from 'yjs';
import { STORAGE_KEYS } from '../../utils/constants';

const EXPORT_VERSION = '2.0'; // Bumped version for new format

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
            // Unified project storage
            allProjects: [],
            // Commands and categories
            allCommands: [],
            commandCategories: [],
            // Legacy fields for backward compatibility (empty but present)
            pendingProjects: [],
            primaryProjects: [],
            inspirations: [],
            commands: [],
            customCategories: []
        }
    };

    if (!doc) {
        console.warn('[Export] No Y.Doc provided, returning empty data.');
        return data;
    }

    // 1. Export all_projects (unified storage)
    try {
        const allProjectsArray = doc.getArray('all_projects');
        data.data.allProjects = allProjectsArray.toJSON();
        console.info(`[Export] Exported ${data.data.allProjects.length} projects from all_projects.`);
    } catch (e) {
        console.warn('[Export] Failed to get all_projects:', e);
    }

    // 2. Export all_commands (synced commands) - with localStorage fallback
    try {
        const commandsArray = doc.getArray('all_commands');
        const syncedCommands = commandsArray.toJSON();

        // If Y.Doc is empty, fallback to localStorage
        if (syncedCommands.length === 0) {
            const localCommands = localStorage.getItem('flowstudio_commands');
            if (localCommands) {
                data.data.allCommands = JSON.parse(localCommands);
                console.info(`[Export] Exported ${data.data.allCommands.length} commands from localStorage (fallback).`);
            }
        } else {
            data.data.allCommands = syncedCommands;
            console.info(`[Export] Exported ${data.data.allCommands.length} commands from all_commands.`);
        }
    } catch (e) {
        console.warn('[Export] Failed to get all_commands:', e);
        // Final fallback
        const localCommands = localStorage.getItem('flowstudio_commands');
        if (localCommands) {
            data.data.allCommands = JSON.parse(localCommands);
        }
    }

    // 3. Export command_categories (synced categories) - with localStorage fallback
    try {
        const categoriesArray = doc.getArray('command_categories');
        const syncedCategories = categoriesArray.toJSON();

        // If Y.Doc is empty, fallback to localStorage
        if (syncedCategories.length === 0) {
            const localCategories = localStorage.getItem('flowstudio_categories_custom');
            if (localCategories) {
                data.data.commandCategories = JSON.parse(localCategories);
                console.info(`[Export] Exported ${data.data.commandCategories.length} categories from localStorage (fallback).`);
            }
        } else {
            data.data.commandCategories = syncedCategories;
            console.info(`[Export] Exported ${data.data.commandCategories.length} categories from command_categories.`);
        }
    } catch (e) {
        console.warn('[Export] Failed to get command_categories:', e);
        // Final fallback
        const localCategories = localStorage.getItem('flowstudio_categories_custom');
        if (localCategories) {
            data.data.commandCategories = JSON.parse(localCategories);
        }
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

    const { allProjects, allCommands, commandCategories, pendingProjects, primaryProjects, commands, customCategories } = data.data;

    // Check new format arrays
    if (allProjects && !Array.isArray(allProjects)) {
        errors.push('allProjects 必须是数组');
    }
    if (allCommands && !Array.isArray(allCommands)) {
        errors.push('allCommands 必须是数组');
    }
    if (commandCategories && !Array.isArray(commandCategories)) {
        errors.push('commandCategories 必须是数组');
    }

    // Check legacy format arrays (for backward compatibility)
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
    const {
        allProjects, allCommands, commandCategories,
        // Legacy fields for backward compatibility
        pendingProjects, primaryProjects, inspirations, commands, customCategories
    } = data.data;

    if (!doc) {
        console.error('[Import] No Y.Doc provided, cannot import.');
        return;
    }

    doc.transact(() => {
        // === NEW FORMAT: all_projects ===
        if (allProjects && allProjects.length > 0) {
            const yAllProjects = doc.getArray('all_projects');
            if (mode === 'replace') {
                yAllProjects.delete(0, yAllProjects.length);
            }
            const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));
            const newProjects = allProjects.filter(p => !existingIds.has(p.id));

            const yMaps = newProjects.map(p => {
                const yMap = new Y.Map();
                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllProjects.push(yMaps);
                console.info(`[Import] Imported ${yMaps.length} projects to all_projects.`);
            }
        }

        // === NEW FORMAT: all_commands ===
        if (allCommands && allCommands.length > 0) {
            const yAllCommands = doc.getArray('all_commands');
            if (mode === 'replace') {
                yAllCommands.delete(0, yAllCommands.length);
            }
            const existingIds = new Set(yAllCommands.toJSON().map(c => c.id));
            const newCommands = allCommands.filter(c => !existingIds.has(c.id));

            const yMaps = newCommands.map(c => {
                const yMap = new Y.Map();
                Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllCommands.push(yMaps);
                console.info(`[Import] Imported ${yMaps.length} commands to all_commands.`);
            }
        }

        // === NEW FORMAT: command_categories ===
        if (commandCategories && commandCategories.length > 0) {
            const yCategories = doc.getArray('command_categories');
            if (mode === 'replace') {
                yCategories.delete(0, yCategories.length);
            }
            const existingIds = new Set(yCategories.toJSON().map(c => c.id));
            const newCats = commandCategories.filter(c => !existingIds.has(c.id));

            const yMaps = newCats.map(c => {
                const yMap = new Y.Map();
                Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yCategories.push(yMaps);
                console.info(`[Import] Imported ${yMaps.length} categories to command_categories.`);
            }
        }

        // === LEGACY FORMAT: Convert to new format ===
        // Pending Projects -> all_projects with stage: 'pending'
        if (pendingProjects && pendingProjects.length > 0) {
            const yAllProjects = doc.getArray('all_projects');
            const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));
            const newProjects = pendingProjects
                .filter(p => !existingIds.has(p.id))
                .map(p => ({ ...p, stage: 'pending' }));

            const yMaps = newProjects.map(p => {
                const yMap = new Y.Map();
                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllProjects.push(yMaps);
                console.info(`[Import] Migrated ${yMaps.length} legacy pending projects.`);
            }
        }

        // Primary Projects -> all_projects with stage: 'primary'
        if (primaryProjects && primaryProjects.length > 0) {
            const yAllProjects = doc.getArray('all_projects');
            const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));
            const newProjects = primaryProjects
                .filter(p => !existingIds.has(p.id))
                .map(p => ({ ...p, stage: 'primary' }));

            const yMaps = newProjects.map(p => {
                const yMap = new Y.Map();
                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllProjects.push(yMaps);
                console.info(`[Import] Migrated ${yMaps.length} legacy primary projects.`);
            }
        }

        // Inspirations -> all_projects with stage: 'inspiration'
        if (inspirations && inspirations.length > 0) {
            const yAllProjects = doc.getArray('all_projects');
            const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));
            const newProjects = inspirations
                .filter(p => !existingIds.has(p.id))
                .map(p => ({ ...p, stage: 'inspiration' }));

            const yMaps = newProjects.map(p => {
                const yMap = new Y.Map();
                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllProjects.push(yMaps);
                console.info(`[Import] Migrated ${yMaps.length} legacy inspirations.`);
            }
        }

        // Legacy commands -> all_commands
        if (commands && commands.length > 0) {
            const yAllCommands = doc.getArray('all_commands');
            const existingIds = new Set(yAllCommands.toJSON().map(c => c.id));
            const newCommands = commands.filter(c => !existingIds.has(c.id));

            const yMaps = newCommands.map(c => {
                const yMap = new Y.Map();
                Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yAllCommands.push(yMaps);
                console.info(`[Import] Migrated ${yMaps.length} legacy commands.`);
            }
        }

        // Legacy customCategories -> command_categories
        if (customCategories && customCategories.length > 0) {
            const yCategories = doc.getArray('command_categories');
            const existingIds = new Set(yCategories.toJSON().map(c => c.id));
            const newCats = customCategories.filter(c => !existingIds.has(c.id));

            const yMaps = newCats.map(c => {
                const yMap = new Y.Map();
                Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                return yMap;
            });
            if (yMaps.length > 0) {
                yCategories.push(yMaps);
                console.info(`[Import] Migrated ${yMaps.length} legacy custom categories.`);
            }
        }
    });
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
