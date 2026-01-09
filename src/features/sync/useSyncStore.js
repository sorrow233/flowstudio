import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { useAuth } from '../auth/AuthContext';
import { SyncEngine } from './SyncEngine';
import { DEFAULT_TEMPLATE } from '../../data/defaultTemplate';

// Global Map to store SyncEngines (one per docId)
const engineMap = new Map();

export const useSyncStore = (docId, initialData = {}) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('disconnected');
    const [pendingCount, setPendingCount] = useState(0);
    const [syncedDoc, setSyncedDoc] = useState(null);

    useEffect(() => {
        if (!docId) return;

        // 1. Get or Create Engine
        let engine = engineMap.get(docId);
        if (!engine) {
            engine = new SyncEngine(docId, user?.uid, initialData);
            engineMap.set(docId, engine);
        } else {
            // Update user if changed (e.g. login/logout)
            // Ideally SyncEngine handles this, but for now we might re-instantiate if strict user isolation needed.
            // Current design assumes docId is unique per user-room or shared correctly.
            // If user changes, we might want to re-connect firestore.
            if (user?.uid && engine.userId !== user.uid) {
                engine.userId = user.uid;
                engine.connectFirestore();
            }
        }

        setSyncedDoc(engine.getDoc());

        // 2. Subscribe to State Changes
        const unsubscribe = engine.subscribe((state) => {
            setStatus(state.status);
            setPendingCount(state.pendingCount);
        });

        return () => {
            unsubscribe();
            // Optional: destroy engine if no longer needed by any component?
            // For now, we keep it alive for cache.
        };

    }, [docId, user]);

    // Helper to update data
    const update = useCallback((field, value) => {
        if (!syncedDoc) return;
        syncedDoc.transact(() => {
            syncedDoc.getMap('data').set(field, value);
        });
    }, [syncedDoc]);

    return { doc: syncedDoc, status, update, pendingCount };
};

// Hook to subscribe to Y.Map changes in React
export const useYMap = (doc) => {
    const [data, setData] = useState({});

    useEffect(() => {
        if (!doc) return;
        const map = doc.getMap('data');
        const handleChange = () => setData(map.toJSON());

        handleChange();
        map.observeDeep(handleChange);
        return () => map.unobserveDeep(handleChange);
    }, [doc]);

    return data;
};

// --- CRDT Array Hook (for Projects) ---
export const useSyncedProjects = (doc, arrayName) => {
    const [projects, setProjects] = useState([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const undoManagerDisplayRef = useRef(null); // Keep a ref to the UndoManager

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        // Initialize UndoManager scoped to this specific array (and its children)
        const undoManager = new Y.UndoManager(yArray, {
            trackedOrigins: new Set([null, 'local']), // Track local changes (null origin or explicit 'local')
            ignoreRemoteOrigins: true // Don't undo other people's changes by default (optional, but usually good for UX)
        });
        undoManagerDisplayRef.current = undoManager;

        const handleChange = () => {
            // Use toJSON() to ensure we get POJOs (Plain Old JavaScript Objects)
            setProjects(yArray.toJSON());
        };

        const handleStackChange = () => {
            setCanUndo(undoManager.undoStack.length > 0);
            setCanRedo(undoManager.redoStack.length > 0);
        };

        handleChange();
        yArray.observeDeep(handleChange);
        undoManager.on('stack-item-added', handleStackChange);
        undoManager.on('stack-item-popped', handleStackChange);

        return () => {
            yArray.unobserveDeep(handleChange);
            undoManager.off('stack-item-added', handleStackChange);
            undoManager.off('stack-item-popped', handleStackChange);
            undoManager.destroy();
        };
    }, [doc, arrayName]);

    const addProject = (project) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);

        // Convert plain object to Y.Map for granular tracking
        const yMap = new Y.Map();
        Object.entries(project).forEach(([key, value]) => {
            yMap.set(key, value);
        });

        yArray.insert(0, [yMap]);
    };

    const removeProject = (id) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            let index = -1;
            const arr = yArray.toArray();
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                yArray.delete(index, 1);
            }
        });
    };

    const updateProject = (id, updates) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();
            let targetMap = null;

            // Find the Y.Map
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    targetMap = item;
                    break;
                }
            }

            if (targetMap && targetMap instanceof Y.Map) {
                // Granular update on the Y.Map
                Object.entries(updates).forEach(([key, value]) => {
                    targetMap.set(key, value);
                });
            } else if (targetMap) {
                // Fallback for non-Y.Map items
                const index = arr.indexOf(targetMap);
                const updated = { ...targetMap, ...updates };
                yArray.delete(index, 1);
                yArray.insert(index, [updated]);
            }
        });
    };

    const undo = useCallback(() => {
        undoManagerDisplayRef.current?.undo();
    }, []);

    const redo = useCallback(() => {
        undoManagerDisplayRef.current?.redo();
    }, []);

    return { projects, addProject, removeProject, updateProject, undo, redo, canUndo, canRedo };
};


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
            // 已经加载过默认模板，跳过
            if (localStorage.getItem(DEFAULT_TEMPLATE_KEY)) return;

            const yPending = doc.getArray('pending_projects');
            const yPrimary = doc.getArray('primary_projects');

            // 检查是否有任何项目数据
            const hasData = yPending.length > 0 || yPrimary.length > 0;

            if (!hasData) {
                console.info("[DefaultTemplate] 首次访问，加载默认模板数据...");

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

                    // 加载 Commands 到 localStorage
                    if (DEFAULT_TEMPLATE.commands && DEFAULT_TEMPLATE.commands.length > 0) {
                        localStorage.setItem('flowstudio_commands', JSON.stringify(DEFAULT_TEMPLATE.commands));
                        console.info(`[DefaultTemplate] 加载了 ${DEFAULT_TEMPLATE.commands.length} 个指令模板`);
                    }

                    // 加载 Custom Categories
                    if (DEFAULT_TEMPLATE.customCategories && DEFAULT_TEMPLATE.customCategories.length > 0) {
                        localStorage.setItem('flowstudio_categories_custom', JSON.stringify(DEFAULT_TEMPLATE.customCategories));
                    }

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
