import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Refs for synchronization state
    const shadowDocRef = useRef(null);
    const hasPendingChanges = useRef(false);
    const isPushing = useRef(false);

    // Initialize Y.Doc and Providers
    useEffect(() => {
        if (!docId) return;

        // 1. Initialize Main Doc (Local State)
        let doc = docMap.get(docId);
        if (!doc) {
            doc = new Y.Doc();
            docMap.set(docId, doc);
            console.info(`[Sync] Initialized Doc: ${docId}`);
        }

        // 2. Initialize Shadow Doc (Server State)
        // We use this to compute "what the server doesn't know about yet"
        if (!shadowDocRef.current) {
            shadowDocRef.current = new Y.Doc();
        }
        const shadowDoc = shadowDocRef.current;


        // 3. Local Persistence (IndexedDB) - Local First!
        const localProvider = new IndexeddbPersistence(docId, doc);

        localProvider.on('synced', () => {
            // Seeding default data if empty
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

        // 4. Cloud Persistence & Synchronization Logic
        let unsubscribeFirestore = () => { };

        if (user) {
            setStatus('syncing');
            const updatesColl = collection(db, `users/${user.uid}/rooms/${docId}/updates`);

            // --- A. PUSH LOGIC (Local -> Cloud) ---
            const tryPushUpdates = async () => {
                if (isPushing.current || !hasPendingChanges.current || !navigator.onLine) return;

                // Circuit breaker: If we are marked offline due to error, we might want to check network first
                // For now, let's assume we try if we are logically "online"

                try {
                    isPushing.current = true;

                    // 1. Calculate diff: What changes does Main Doc have that Shadow Doc (Server) doesn't?
                    const stateVector = Y.encodeStateVector(shadowDoc);
                    const diff = Y.encodeStateAsUpdate(doc, stateVector);

                    // 2. If no meaningful changes, skip
                    if (diff.byteLength === 0) {
                        hasPendingChanges.current = false;
                        setStatus('synced');
                        isPushing.current = false;
                        return;
                    }

                    // 3. Send to Firestore
                    // Encode as Base64 string for Firestore storage
                    const updateStr = btoa(String.fromCharCode.apply(null, diff));

                    await addDoc(updatesColl, {
                        update: updateStr,
                        createdAt: serverTimestamp(),
                        userId: user.uid
                    });

                    // 4. On Success: Apply same update to Shadow Doc so it catches up
                    Y.applyUpdate(shadowDoc, diff);

                    // 5. Check if more changes happened while we were pushing
                    const moreChanges = Y.encodeStateAsUpdate(doc, Y.encodeStateVector(shadowDoc));
                    if (moreChanges.byteLength > 0) {
                        hasPendingChanges.current = true;
                        // Schedule next push
                        setTimeout(tryPushUpdates, 500);
                    } else {
                        hasPendingChanges.current = false;
                        setStatus('synced');
                    }

                } catch (error) {
                    if (error.code === 'permission-denied' || error.code === 'unavailable') {
                        console.warn("[Sync] Push Failed (Offline Condition):", error.code);
                        setStatus('offline'); // UI shows Yellow "Offline Saving"
                    } else {
                        console.error("[Sync] Push Error:", error);
                        setStatus('offline');
                    }
                    // Keep hasPendingChanges = true, will retry later
                } finally {
                    isPushing.current = false;
                }
            };

            // Debounced push
            let pushTimeout;
            const debouncedPush = () => {
                clearTimeout(pushTimeout);
                pushTimeout = setTimeout(tryPushUpdates, 500); // Debounce interactions
            };

            // Listen for local updates
            const handleLocalUpdate = (update, origin) => {
                if (origin !== 'remote') {
                    setStatus('syncing'); // Immediate UI feedback (Yellow/Gray -> "Saving...")
                    hasPendingChanges.current = true;
                    debouncedPush();
                }
            };
            doc.on('update', handleLocalUpdate);


            // --- B. PULL LOGIC (Cloud -> Local) ---
            // Listen for ALL remote updates to build valid Server State (Shadow Doc)
            const q = query(updatesColl, orderBy('createdAt', 'asc'));

            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                // Apply updates to BOTH Main Doc and Shadow Doc
                // This ensures Shadow Doc accurately reflects "What is on the server"

                const updatesToApply = [];
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        if (data.update) {
                            const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                            updatesToApply.push(update);
                        }
                    }
                });

                if (updatesToApply.length > 0) {
                    doc.transact(() => {
                        updatesToApply.forEach(u => {
                            Y.applyUpdate(doc, u, 'remote'); // Apply to Main
                        });
                    }, 'remote');

                    shadowDoc.transact(() => {
                        updatesToApply.forEach(u => {
                            Y.applyUpdate(shadowDoc, u); // Apply to Shadow
                        });
                    });

                    // After applying remote changes, we might want to check if we are in sync or need to push latent changes
                    // (e.g. we reconnected, got server updates, now we merge ours)
                    const localDiff = Y.encodeStateAsUpdate(doc, Y.encodeStateVector(shadowDoc));
                    if (localDiff.byteLength > 0) {
                        hasPendingChanges.current = true;
                        debouncedPush();
                    } else {
                        if (!hasPendingChanges.current) {
                            setStatus('synced');
                        }
                    }
                } else {
                    // Initial load empty or no changes
                    // Check if we have local pending changes to push (e.g. started offline)
                    const localDiff = Y.encodeStateAsUpdate(doc, Y.encodeStateVector(shadowDoc));
                    if (localDiff.byteLength > 0) {
                        hasPendingChanges.current = true;
                        debouncedPush();
                    } else {
                        setStatus('synced');
                    }
                }

            }, (error) => {
                console.warn("[Sync] Listener Error (Offline):", error.code);
                setStatus('offline');
            });

            // --- C. RECONNECTION LISTENERS ---
            const handleOnline = () => {
                console.info("[Sync] Network Online. Attempting sync...");
                setStatus('syncing');
                tryPushUpdates();
            };
            window.addEventListener('online', handleOnline);


            // CRITICAL: Set doc in state
            setSyncedDoc(doc);
            setSharedType(doc.getMap('data'));

            return () => {
                cancelAnimationFrame(pushTimeout); // actually clearTimeout
                clearTimeout(pushTimeout);
                doc.off('update', handleLocalUpdate);
                unsubscribeFirestore();
                window.removeEventListener('online', handleOnline);
                localProvider.destroy();
                // We keep docMap and shadowDocRef for cache, or could destroy them.
                // For this architecture, keeping them avoids re-sync overhead on remounts.
            };

        } else {
            // Logged out / No User
            // Still allow local editing via IndexedDB
            setStatus('offline');
            setSyncedDoc(doc);
            setSharedType(doc.getMap('data'));

            // Cleanup just local
            return () => {
                localProvider.destroy();
            };
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
            // console.debug(`[Sync] Array ${arrayName} updated. Length: ${yArray.length}`);
            setProjects(yArray.toArray());
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
        // Ensure this transaction is tracked if needed, though standard manipulations on yArray are tracked by default
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
