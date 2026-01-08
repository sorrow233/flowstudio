import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { useAuth } from '../auth/AuthContext';
import { SyncEngine } from './SyncEngine';

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
        yArray.insert(0, [project]);
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
export const useDataMigration = (doc) => {
    useEffect(() => {
        if (!doc) return;

        const MIGRATION_KEY = 'flowstudio_migration_v1_completed';

        const migrate = () => {
            // 1. Check if migration already ran
            if (localStorage.getItem(MIGRATION_KEY)) return;

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
                            yPending.push(parsed);
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
                            yPrimary.push(parsed);
                        });
                        hasMigrated = true;
                    }
                }
            } catch (e) {
                console.error("[Migration] Failed primary:", e);
            }

            // 4. Mark as completed
            localStorage.setItem(MIGRATION_KEY, 'true');
            if (hasMigrated) {
                console.info("[Migration] Completed.");
            }
        };

        // Run immediately.
        migrate();

    }, [doc]);
};
