import { useEffect } from 'react';
import * as Y from 'yjs';
import { DEFAULT_TEMPLATE } from '../../../data/defaultTemplate';

// --- Data Migration Hook ---
// Safely migrates data from localStorage to Y.Doc only once.
// Also seeds default template data for new users.
export const useDataMigration = (doc) => {
    useEffect(() => {
        if (!doc) return;

        const MIGRATION_KEY = 'flowstudio_migration_v1_completed';
        const DEFAULT_TEMPLATE_KEY = 'flowstudio_default_template_seeded';

        const migrate = () => {
            // 1. Check if migration already ran
            if (localStorage.getItem(MIGRATION_KEY)) {
                // 老用户：迁移已完成，不需要加载默认模板
                // 直接标记 DEFAULT_TEMPLATE_KEY 防止后续误触发
                if (!localStorage.getItem(DEFAULT_TEMPLATE_KEY)) {
                    localStorage.setItem(DEFAULT_TEMPLATE_KEY, 'true');
                    console.info("[DefaultTemplate] 老用户跳过默认模板加载");
                }
                return;
            }

            console.info("[Migration] Starting one-time migration...");
            let hasMigrated = false;

            // 2. Pending Projects
            try {
                const yPending = doc.getArray('pending_projects');
                const localPending = localStorage.getItem('pending_projects');
                if (localPending) {
                    const parsed = JSON.parse(localPending);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        doc.transact(() => {
                            const yMaps = parsed.map(p => {
                                const yMap = new Y.Map();
                                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yPending.push(yMaps);
                        });
                        hasMigrated = true;
                    }
                }
            } catch (e) {
                console.error("[Migration] Failed pending:", e);
            }

            // 3. Primary Projects
            try {
                const yPrimary = doc.getArray('primary_projects');
                const localPrimary = localStorage.getItem('primary_projects');
                if (localPrimary) {
                    const parsed = JSON.parse(localPrimary);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        doc.transact(() => {
                            const yMaps = parsed.map(p => {
                                const yMap = new Y.Map();
                                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yPrimary.push(yMaps);
                        });
                        hasMigrated = true;
                    }
                }
            } catch (e) {
                console.error("[Migration] Failed primary:", e);
            }

            // 4. Mark migration as completed
            localStorage.setItem(MIGRATION_KEY, 'true');
            if (hasMigrated) {
                console.info("[Migration] Completed.");
            } else {
                // No local data was migrated, check if we should seed default template
                seedDefaultTemplateIfEmpty();
            }
        };

        // --- 默认模板加载逻辑 ---
        // 如果用户是新用户且没有任何数据，则加载默认模板
        const seedDefaultTemplateIfEmpty = () => {
            const COMMANDS_KEY = 'flowstudio_commands';
            const CATEGORIES_KEY = 'flowstudio_categories_custom';

            // 1. 单独处理命令加载（不管项目数据是否存在）
            // 只在命令为空时加载默认命令
            const existingCommands = localStorage.getItem(COMMANDS_KEY);
            if (!existingCommands || existingCommands === '[]') {
                if (DEFAULT_TEMPLATE.commands && DEFAULT_TEMPLATE.commands.length > 0) {
                    localStorage.setItem(COMMANDS_KEY, JSON.stringify(DEFAULT_TEMPLATE.commands));
                    console.info(`[DefaultTemplate] 加载了 ${DEFAULT_TEMPLATE.commands.length} 个默认指令`);
                }
            }

            // 2. 加载自定义分类（如果不存在）
            if (!localStorage.getItem(CATEGORIES_KEY)) {
                if (DEFAULT_TEMPLATE.customCategories && DEFAULT_TEMPLATE.customCategories.length > 0) {
                    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_TEMPLATE.customCategories));
                }
            }

            // 3. 检查是否已加载过项目数据
            if (localStorage.getItem(DEFAULT_TEMPLATE_KEY)) return;

            const yPending = doc.getArray('pending_projects');
            const yPrimary = doc.getArray('primary_projects');

            // 检查是否有任何项目数据
            const hasData = yPending.length > 0 || yPrimary.length > 0;

            if (!hasData) {
                console.info("[DefaultTemplate] 首次访问，加载默认项目和灵感数据...");

                try {
                    doc.transact(() => {
                        // 加载 Pending Projects
                        if (DEFAULT_TEMPLATE.pendingProjects && DEFAULT_TEMPLATE.pendingProjects.length > 0) {
                            const yMaps = DEFAULT_TEMPLATE.pendingProjects.map(p => {
                                const yMap = new Y.Map();
                                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yPending.push(yMaps);
                        }

                        // 加载 Primary Projects
                        if (DEFAULT_TEMPLATE.primaryProjects && DEFAULT_TEMPLATE.primaryProjects.length > 0) {
                            const yMaps = DEFAULT_TEMPLATE.primaryProjects.map(p => {
                                const yMap = new Y.Map();
                                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yPrimary.push(yMaps);
                        }

                        // 加载 Inspirations (灵感数据)
                        if (DEFAULT_TEMPLATE.inspirations && DEFAULT_TEMPLATE.inspirations.length > 0) {
                            const yInspiration = doc.getArray('inspiration');
                            const yMaps = DEFAULT_TEMPLATE.inspirations.map(i => {
                                const yMap = new Y.Map();
                                Object.entries(i).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yInspiration.push(yMaps);
                            console.info(`[DefaultTemplate] 加载了 ${DEFAULT_TEMPLATE.inspirations.length} 条灵感数据`);
                        }
                    });

                    console.info("[DefaultTemplate] 默认模板加载完成！");
                } catch (e) {
                    console.error("[DefaultTemplate] 加载默认模板失败:", e);
                }
            }

            // 标记默认模板已处理（无论是否加载）
            localStorage.setItem(DEFAULT_TEMPLATE_KEY, 'true');
        };

        // Run immediately.
        migrate();

    }, [doc]);
};
