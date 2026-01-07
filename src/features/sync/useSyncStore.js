import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    limit,
    where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../auth/AuthContext';

// Global Map to store Y.Docs to prevent re-initialization
const docMap = new Map();

export const useSyncStore = (docId, initialData = {}) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('disconnected'); // disconnected, syncing, synced, offline
    const [syncedDoc, setSyncedDoc] = useState(null);
    const [sharedType, setSharedType] = useState(null);

    // Initialize Y.Doc and Providers
    useEffect(() => {
        if (!docId || !user) return;

        let doc = docMap.get(docId);
        if (!doc) {
            doc = new Y.Doc();
            docMap.set(docId, doc);
        }

        // 1. Local Persistence (IndexedDB)
        const localProvider = new IndexeddbPersistence(docId, doc);

        localProvider.on('synced', () => {
            console.log(`[Sync] ${docId} loaded from local DB`);
            // If empty, initialize with default data
            if (doc.getMap('data').keys().next().done && Object.keys(initialData).length > 0) {
                doc.transact(() => {
                    const map = doc.getMap('data');
                    Object.entries(initialData).forEach(([k, v]) => {
                        map.set(k, v);
                    });
                });
            }
        });

        // 2. Cloud Persistence (Firestore Custom Adapter)
        let unsubscribeFirestore = () => { };

        if (user) {
            setStatus('syncing');
            // User-scoped path: users/{uid}/rooms/{docId}/updates
            // This ensures users can only read/write their own data, solving permission errors (with standard rules).
            const updatesColl = collection(db, `users/${user.uid}/rooms/${docId}/updates`);

            // Listen for remote updates
            const q = query(updatesColl, orderBy('createdAt', 'asc')); // Simplification: Load all updates. optimizing later.
            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                doc.transact(() => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            // Apply update if it's not from local (optimization: checking origin/clientID usually better but here simple broadcast)
                            // In this simple model, we just apply everything. Yjs handles deduplication efficiently.
                            if (data.update) {
                                const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                                Y.applyUpdate(doc, update, 'remote');
                            }
                        }
                    });
                }, 'remote');
                setStatus('synced');
            }, (error) => {
                // Silece permission errors - they just mean we are offline/unauthorized, which is fine.
                // The user can still work locally.
                if (error.code === 'permission-denied') {
                    console.info("Firestore Permission Denied (Offline Mode active)");
                } else {
                    console.error("Firestore Sync Error:", error);
                }
                setStatus('offline');
            });

            // Push local updates
            const handleUpdate = (update, origin) => {
                if (origin !== 'remote') {
                    // Convert Uint8Array to Base64 for Firestore storage
                    const updateStr = btoa(String.fromCharCode.apply(null, update));
                    addDoc(updatesColl, {
                        update: updateStr,
                        createdAt: serverTimestamp(),
                        userId: user.uid
                    }).catch(err => {
                        if (err.code === 'permission-denied') {
                            // Ignore push errors due to permissions
                        } else {
                            console.error("Failed to push update", err);
                        }
                        setStatus('offline');
                    });
                }
            };

            doc.on('update', handleUpdate);

            // Cleanup
            return () => {
                doc.off('update', handleUpdate);
                unsubscribeFirestore();
                localProvider.destroy();
            };
        } else {
            setStatus('offline');
        }

        setSyncedDoc(doc);
        setSharedType(doc.getMap('data'));

    }, [docId, user]);

    // Helper to update data
    const update = useCallback((field, value) => {
        if (!syncedDoc) return;
        syncedDoc.transact(() => {
            syncedDoc.getMap('data').set(field, value);
        });
    }, [syncedDoc]);

    // Helper to get observer
    // Note: useSyncStore consumers should usually use useObserver equivalent or just manual Yjs observation.
    // For React, we often make a simplified "useYMap" hook.

    return { doc: syncedDoc, status, update };
};

// Hook to subscribe to Y.Map changes in React
export const useYMap = (doc) => {
    const [data, setData] = useState({});

    useEffect(() => {
        if (!doc) return;

        const map = doc.getMap('data');

        const handleChange = () => {
            setData(map.toJSON());
        };

        // Initial set
        handleChange();

        map.observeDeep(handleChange);

        return () => {
            map.unobserveDeep(handleChange);
        };
    }, [doc]);

    return data;
};

// --- CRDT Array Hook (for Projects) ---
export const useSyncedProjects = (doc, arrayName) => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        const handleChange = () => {
            setProjects(yArray.toArray());
        };

        // Initial load
        handleChange();

        // Observe
        yArray.observeDeep(handleChange);

        return () => {
            yArray.unobserveDeep(handleChange);
        };
    }, [doc, arrayName]);

    const addProject = (project) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);
        yArray.push([project]);
    };

    const removeProject = (id) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);
        // Find index (naive approach, for production usage with large lists consider Y.Map keyed by ID)
        // But for <100 items array is fine and preserves order easily.
        let index = -1;
        const arr = yArray.toArray();
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            yArray.delete(index, 1);
        }
    };

    const updateProject = (id, updates) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();
            let index = -1;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === id) {
                    index = i;
                    break;
                }
            }

            if (index !== -1) {
                // To update an object in Y.Array, we actually have to replace it or use a nested Y.Map.
                // For simplicity and since we are using JSON objects in Y.Array, we replace the item.
                // A better CRDT approach is to use Y.Map for each project, but that requires changing the data structure.
                // To support field-level granularity without full refactor:
                // We'll read the current, merge, delete, and insert at same position.
                // NOTE: This is "Last Write Wins" for the object. To do property merging properly with Y.Array of JSONs:
                // We should really be using Y.Array of Y.Maps.
                // But for now to fix the crash and support basic sync:

                const current = arr[index];
                const updated = { ...current, ...updates };

                yArray.delete(index, 1);
                yArray.insert(index, [updated]);
            }
        });
    };

    return { projects, addProject, removeProject, updateProject };
};


// --- Data Migration Hook ---
// Safely migrates data from localStorage to Y.Doc only once.
export const useDataMigration = (doc) => {
    useEffect(() => {
        if (!doc) return;

        const MIGRATION_KEY = 'flowstudio_migration_v1_completed';

        const migrate = () => {
            // 1. Check if migration already ran
            if (localStorage.getItem(MIGRATION_KEY)) {
                console.log("[Migration] Migration previously completed. Skipping.");
                return;
            }

            console.log("[Migration] Starting one-time migration from LocalStorage...");
            let hasMigrated = false;

            // 2. Pending Projects
            try {
                const yPending = doc.getArray('pending_projects');
                const localPending = localStorage.getItem('pending_projects');
                if (localPending) {
                    const parsed = JSON.parse(localPending);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`[Migration] Migrating ${parsed.length} pending projects`);
                        doc.transact(() => {
                            yPending.push(parsed);
                        });
                        hasMigrated = true;
                    }
                }
            } catch (e) {
                console.error("[Migration] Failed to migrate pending:", e);
            }

            // 3. Primary Projects
            try {
                const yPrimary = doc.getArray('primary_projects');
                const localPrimary = localStorage.getItem('primary_projects');
                if (localPrimary) {
                    const parsed = JSON.parse(localPrimary);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`[Migration] Migrating ${parsed.length} primary projects`);
                        doc.transact(() => {
                            yPrimary.push(parsed);
                        });
                        hasMigrated = true;
                    }
                }
            } catch (e) {
                console.error("[Migration] Failed to migrate primary:", e);
            }

            // 4. Mark as completed
            localStorage.setItem(MIGRATION_KEY, 'true');
            if (hasMigrated) {
                console.log("[Migration] Completed successfully.");
            } else {
                console.log("[Migration] No local data found to migrate. Marked as completed.");
            }
        };

        // Run immediately.
        migrate();

    }, [doc]);
};
