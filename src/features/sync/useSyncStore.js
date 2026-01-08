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
        if (!docId) return;

        let doc = docMap.get(docId);
        if (!doc) {
            doc = new Y.Doc();
            docMap.set(docId, doc);
            console.info(`[Sync] Initialized Doc: ${docId}`);
        }

        // 1. Local Persistence (IndexedDB)
        const localProvider = new IndexeddbPersistence(docId, doc);

        localProvider.on('synced', () => {
            // Only log if data was actually loaded or empty
            if (doc.getMap('data').keys().next().done && Object.keys(initialData).length > 0) {
                console.info(`[Sync] Seeding default data for ${docId}`);
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
            const updatesColl = collection(db, `users/${user.uid}/rooms/${docId}/updates`);

            // Listen for remote updates
            const q = query(updatesColl, orderBy('createdAt', 'asc'));
            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                doc.transact(() => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            if (data.update) {
                                const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                                Y.applyUpdate(doc, update, 'remote');
                            }
                        }
                    });
                }, 'remote');
                setStatus('synced');
            }, (error) => {
                if (error.code === 'permission-denied') {
                    console.warn("[Sync] Permission Denied (Offline Mode)");
                } else {
                    console.error("[Sync] Firestore Error:", error);
                }
                setStatus('offline');
            });

            // Push local updates
            const handleUpdate = (update, origin) => {
                if (origin !== 'remote') {
                    const updateStr = btoa(String.fromCharCode.apply(null, update));
                    addDoc(updatesColl, {
                        update: updateStr,
                        createdAt: serverTimestamp(),
                        userId: user.uid
                    }).catch(err => {
                        if (err.code !== 'permission-denied') {
                            console.error("[Sync] Push Failed:", err);
                        }
                        setStatus('offline');
                    });
                }
            };

            doc.on('update', handleUpdate);

            // CRITICAL: Set doc in state BEFORE cleanup return
            setSyncedDoc(doc);
            setSharedType(doc.getMap('data'));

            // Cleanup
            return () => {
                doc.off('update', handleUpdate);
                unsubscribeFirestore();
                localProvider.destroy();
            };
        } else {
            setStatus('offline');
            // Also set doc for offline/logged-out users so local persistence works
            setSyncedDoc(doc);
            setSharedType(doc.getMap('data'));
        }

    }, [docId, user]);

    // Helper to update data
    const update = useCallback((field, value) => {
        if (!syncedDoc) return;
        syncedDoc.transact(() => {
            syncedDoc.getMap('data').set(field, value);
        });
    }, [syncedDoc]);

    return { doc: syncedDoc, status, update };
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

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        const handleChange = () => {
            // console.debug(`[Sync] Array ${arrayName} updated. Length: ${yArray.length}`);
            setProjects(yArray.toArray());
        };

        handleChange();
        yArray.observeDeep(handleChange);
        return () => yArray.unobserveDeep(handleChange);
    }, [doc, arrayName]);

    const addProject = (project) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);
        yArray.insert(0, [project]);
    };

    const removeProject = (id) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);
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
