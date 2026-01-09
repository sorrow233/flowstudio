import { useEffect } from 'react';
import * as Y from 'yjs';
import { DEFAULT_TEMPLATE } from '../../../data/defaultTemplate';

// --- Data Migration Hook ---
// Safely migrates data from localStorage to Y.Doc only once.
// Also seeds default template data for new users directly to Sync.
export const useDataMigration = (doc) => {
    useEffect(() => {
        if (!doc) return;

        // Bump to v2 to force command migration check for existing users
        const MIGRATION_KEY = 'flowstudio_migration_v2_completed';
        const DEFAULT_TEMPLATE_KEY = 'flowstudio_default_template_seeded_v2';

        const migrate = () => {
            // 1. Check if v2 migration already ran
            if (localStorage.getItem(MIGRATION_KEY)) {
                return;
            }

            console.info("[Migration] Starting v2 migration (Commands & Categories)...");

            doc.transact(() => {
                // --- Migrate Commands from LocalStorage ---
                try {
                    const localCmds = localStorage.getItem('flowstudio_commands');
                    if (localCmds) {
                        const parsed = JSON.parse(localCmds);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const yCommands = doc.getArray('all_commands');
                            const existingIds = new Set(yCommands.toJSON().map(c => c.id));

                            const newCmds = parsed.filter(c => !existingIds.has(c.id));
                            if (newCmds.length > 0) {
                                const yMaps = newCmds.map(c => {
                                    const yMap = new Y.Map();
                                    Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                                    return yMap;
                                });
                                yCommands.push(yMaps);
                                console.info(`[Migration] Migrated ${yMaps.length} tasks/commands.`);
                            }
                        }
                    }
                } catch (e) {
                    console.error("[Migration] Failed command migration:", e);
                }

                // --- Migrate Categories from LocalStorage ---
                try {
                    const localCats = localStorage.getItem('flowstudio_categories_custom');
                    if (localCats) {
                        const parsed = JSON.parse(localCats);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const yCategories = doc.getArray('command_categories');
                            const existingIds = new Set(yCategories.toJSON().map(c => c.id));

                            const newCats = parsed.filter(c => !existingIds.has(c.id));
                            if (newCats.length > 0) {
                                const yMaps = newCats.map(c => {
                                    const yMap = new Y.Map();
                                    Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                                    return yMap;
                                });
                                yCategories.push(yMaps);
                                console.info(`[Migration] Migrated ${yMaps.length} categories.`);
                            }
                        }
                    }
                } catch (e) {
                    console.error("[Migration] Failed category migration:", e);
                }

                // --- Migrate Legacy Projects (if missed in v1) ---
                try {
                    // Check pending
                    const localPending = localStorage.getItem('pending_projects');
                    if (localPending) {
                        const parsed = JSON.parse(localPending);
                        const yAllProjects = doc.getArray('all_projects');
                        const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));

                        const newProjects = parsed.filter(p => !existingIds.has(p.id))
                            .map(p => ({ ...p, stage: 'pending' }));

                        if (newProjects.length > 0) {
                            const yMaps = newProjects.map(p => {
                                const yMap = new Y.Map();
                                Object.entries(p).forEach(([k, v]) => yMap.set(k, v));
                                return yMap;
                            });
                            yAllProjects.push(yMaps);
                        }
                    }
                } catch (e) { }

            });

            // Mark migration as completed
            localStorage.setItem(MIGRATION_KEY, 'true');
            console.info("[Migration] v2 Completed.");

            // Check for default template seeding
            seedDefaultTemplateIfEmpty();
        };

        const seedDefaultTemplateIfEmpty = () => {
            if (localStorage.getItem(DEFAULT_TEMPLATE_KEY)) return;

            // Check if we have ANY commands or projects
            const yCommands = doc.getArray('all_commands');
            const yProjects = doc.getArray('all_projects');

            // Heuristic: If we have absolutely 0 commands and 0 projects, we assume it's a fresh user.
            const hasData = yCommands.length > 0 || yProjects.length > 0;

            if (!hasData) {
                console.info("[DefaultTemplate] Seeding default data for new user...");
                doc.transact(() => {
                    // Seed Commands
                    if (DEFAULT_TEMPLATE.commands?.length > 0) {
                        const yCmds = doc.getArray('all_commands');
                        const yMaps = DEFAULT_TEMPLATE.commands.map(c => {
                            const yMap = new Y.Map();
                            Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                            return yMap;
                        });
                        yCmds.push(yMaps);
                    }

                    // Seed Categories
                    if (DEFAULT_TEMPLATE.customCategories?.length > 0) {
                        const yCats = doc.getArray('command_categories');
                        const yMaps = DEFAULT_TEMPLATE.customCategories.map(c => {
                            const yMap = new Y.Map();
                            Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                            return yMap;
                        });
                        yCats.push(yMaps);
                    }

                    // Seed Projects (Inspirations, etc handled via all_projects now)
                    if (DEFAULT_TEMPLATE.inspirations?.length > 0) {
                        const yProjs = doc.getArray('all_projects');
                        const yMaps = DEFAULT_TEMPLATE.inspirations.map(p => {
                            const yMap = new Y.Map();
                            // Ensure stage is set
                            const proj = { ...p, stage: p.stage || 'inspiration' };
                            Object.entries(proj).forEach(([k, v]) => yMap.set(k, v));
                            return yMap;
                        });
                        yProjs.push(yMaps);
                    }

                    if (DEFAULT_TEMPLATE.pendingProjects?.length > 0) {
                        const yProjs = doc.getArray('all_projects');
                        const yMaps = DEFAULT_TEMPLATE.pendingProjects.map(p => {
                            const yMap = new Y.Map();
                            const proj = { ...p, stage: 'pending' };
                            Object.entries(proj).forEach(([k, v]) => yMap.set(k, v));
                            return yMap;
                        });
                        yProjs.push(yMaps);
                    }

                    if (DEFAULT_TEMPLATE.primaryProjects?.length > 0) {
                        const yProjs = doc.getArray('all_projects');
                        const yMaps = DEFAULT_TEMPLATE.primaryProjects.map(p => {
                            const yMap = new Y.Map();
                            const proj = { ...p, stage: 'primary' };
                            Object.entries(proj).forEach(([k, v]) => yMap.set(k, v));
                            return yMap;
                        });
                        yProjs.push(yMaps);
                    }
                });
            }

            localStorage.setItem(DEFAULT_TEMPLATE_KEY, 'true');
        };

        migrate();

    }, [doc]);
};
