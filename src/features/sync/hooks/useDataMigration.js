import { useEffect } from 'react';
import * as Y from 'yjs';
import { DEFAULT_TEMPLATE } from '../../../data/defaultTemplate';

// --- Data Migration Hook ---
// V3: Strict deduplication, skip seeding for logged-in users
export const useDataMigration = (doc, isLoggedIn = false) => {
    useEffect(() => {
        if (!doc) return;

        // V3: Force command migration with strict deduplication
        const MIGRATION_KEY = 'flowstudio_migration_v3_completed';
        const DEFAULT_TEMPLATE_KEY = 'flowstudio_default_template_seeded_v3';

        const migrate = () => {
            // 1. Check if v3 migration already ran
            if (localStorage.getItem(MIGRATION_KEY)) {
                console.info("[Migration] v3 already completed, skipping.");
                return;
            }

            console.info("[Migration] Starting v3 migration (Commands & Categories)...");

            doc.transact(() => {
                // --- Migrate Commands from LocalStorage ---
                try {
                    const localCmds = localStorage.getItem('flowstudio_commands');
                    if (localCmds) {
                        const parsed = JSON.parse(localCmds);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const yCommands = doc.getArray('all_commands');
                            // V3: Strict deduplication - get ALL existing IDs
                            const existingIds = new Set(yCommands.toJSON().map(c => c.id));

                            const newCmds = parsed.filter(c => c.id && !existingIds.has(c.id));
                            if (newCmds.length > 0) {
                                const yMaps = newCmds.map(c => {
                                    const yMap = new Y.Map();
                                    Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                                    return yMap;
                                });
                                yCommands.push(yMaps);
                                console.info(`[Migration] Migrated ${newCmds.length} commands.`);
                            } else {
                                console.info("[Migration] No new commands to migrate.");
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

                            const newCats = parsed.filter(c => c.id && !existingIds.has(c.id));
                            if (newCats.length > 0) {
                                const yMaps = newCats.map(c => {
                                    const yMap = new Y.Map();
                                    Object.entries(c).forEach(([k, v]) => yMap.set(k, v));
                                    return yMap;
                                });
                                yCategories.push(yMaps);
                                console.info(`[Migration] Migrated ${newCats.length} categories.`);
                            }
                        }
                    }
                } catch (e) {
                    console.error("[Migration] Failed category migration:", e);
                }

                // --- Migrate Legacy Projects ---
                try {
                    const localPending = localStorage.getItem('pending_projects');
                    if (localPending) {
                        const parsed = JSON.parse(localPending);
                        const yAllProjects = doc.getArray('all_projects');
                        const existingIds = new Set(yAllProjects.toJSON().map(p => p.id));

                        const newProjects = parsed.filter(p => p.id && !existingIds.has(p.id))
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
            console.info("[Migration] v3 Completed.");

            // Check for default template seeding (only for guests)
            seedDefaultTemplateIfEmpty();
        };

        const seedDefaultTemplateIfEmpty = () => {
            if (localStorage.getItem(DEFAULT_TEMPLATE_KEY)) return;

            // V3: Skip seeding for logged-in users - their data will sync from server
            if (isLoggedIn) {
                console.info("[DefaultTemplate] Skipping seeding for logged-in user.");
                localStorage.setItem(DEFAULT_TEMPLATE_KEY, 'true');
                return;
            }

            // Check if we have ANY commands or projects
            const yCommands = doc.getArray('all_commands');
            const yProjects = doc.getArray('all_projects');

            const hasData = yCommands.length > 0 || yProjects.length > 0;

            if (!hasData) {
                console.info("[DefaultTemplate] Seeding default data for new guest user...");
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

                    // Seed Projects
                    if (DEFAULT_TEMPLATE.inspirations?.length > 0) {
                        const yProjs = doc.getArray('all_projects');
                        const yMaps = DEFAULT_TEMPLATE.inspirations.map(p => {
                            const yMap = new Y.Map();
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

    }, [doc, isLoggedIn]);
};
