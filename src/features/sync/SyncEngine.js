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

/**
 * SyncEngine
 * 
 * Manages the "Shadow Doc" synchronization protocol.
 * 
 * Architecture:
 * 1. Main Doc: The local Y.Doc that the user edits. Persisted to IndexedDB.
 * 2. Shadow Doc: A hidden Y.Doc that strictly tracks the server state.
 * 3. Sync Process:
 *    - Pull: Apply remote updates to BOTH Main Doc and Shadow Doc.
 *    - Push: Calculate diff (Main - Shadow) -> Send to Server -> Apply to Shadow.
 * 
 * Benefits:
 * - Robust Offline Support via accumulated diffs.
 * - Circuit Breaker for flaky connections.
 * - Clean separation of logic.
 */
export class SyncEngine {
    constructor(docId, userId, initialData = {}) {
        this.docId = docId;
        this.userId = userId;
        this.initialData = initialData;

        // State
        this.status = 'disconnected'; // disconnected | syncing | synced | offline
        this.pendingCount = 0;
        this.listeners = new Set();

        // Docs
        this.doc = new Y.Doc();
        this.shadowDoc = new Y.Doc();

        // Internal flags
        this.isPushing = false;
        this.hasPendingChanges = false;
        this.isServerLoaded = false;
        this.unsubscribes = [];
        this.pushTimeout = null;

        // Init
        this.init();
    }

    init() {
        console.info(`[SyncEngine] Initializing for ${this.docId}`);

        // 1. IndexedDB (Local First)
        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            this.seedData();
        });

        // 2. Network Listeners
        const handleOnline = () => {
            console.info("[SyncEngine] Network Online. Resuming sync...");
            this.tryPushUpdates();
        };
        window.addEventListener('online', handleOnline);
        this.unsubscribes.push(() => window.removeEventListener('online', handleOnline));

        // 3. Firestore Listeners (if user exists)
        if (this.userId) {
            this.connectFirestore();
        } else {
            this.setStatus('offline');
            this.isServerLoaded = true; // No server to load
        }

        // 4. Local Update Listener
        const handleUpdate = (update, origin) => {
            if (origin !== 'remote') {
                // Ignore local updates until we have established a baseline from the server
                // This prevents initial IndexedDB load from being treated as "pending changes"
                if (!this.isServerLoaded) return;

                this.hasPendingChanges = true;
                this.updatePendingCount(); // Calculate simplistic pending count
                this.setStatus('syncing');
                this.debouncedPush();
            }
        };
        this.doc.on('update', handleUpdate);
        this.unsubscribes.push(() => this.doc.off('update', handleUpdate));
    }

    connectFirestore() {
        this.setStatus('syncing');
        const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);

        // Pull Logic
        const q = query(updatesColl, orderBy('createdAt', 'asc'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const updatesToApply = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.update) {
                        try {
                            const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                            updatesToApply.push(update);
                        } catch (e) {
                            console.error("[SyncEngine] Failed to parse update:", e);
                        }
                    }
                }
            });

            if (updatesToApply.length > 0) {
                // Apply to Main
                this.doc.transact(() => {
                    updatesToApply.forEach(u => Y.applyUpdate(this.doc, u, 'remote'));
                }, 'remote');

                // Apply to Shadow
                this.shadowDoc.transact(() => {
                    updatesToApply.forEach(u => Y.applyUpdate(this.shadowDoc, u));
                });
            }

            // Mark server as loaded on first successful snapshot
            if (!this.isServerLoaded) {
                this.isServerLoaded = true;
                console.info("[SyncEngine] Server state loaded.");
            }

            // Post-pull check: Do we have local changes that need pushing?
            // (e.g. we were offline, got new server data, now we merge ours)
            this.checkForPendingChanges();

        }, (error) => {
            if (error.code === 'permission-denied' || error.code === 'unavailable') {
                console.warn("[SyncEngine] Firestore Error (Offline Mode):", error.code);
            } else {
                console.error("[SyncEngine] Firestore Error:", error);
            }

            // Even on error, we mark server as "loaded" in the sense that we tried.
            // This allows subsequent local edits to be correctly marked as pending.
            this.isServerLoaded = true;
            this.setStatus('offline');
        });

        this.unsubscribes.push(unsubscribeSnapshot);
    }

    async tryPushUpdates() {
        if (this.isPushing || !this.hasPendingChanges || !navigator.onLine) return;

        // Safety: Prevent infinite hanging if Firestore is unresponsive (e.g. AdBlock blocking requests)
        const PUSH_TIMEOUT_MS = 15000;
        let timeoutId;

        try {
            this.isPushing = true;
            // console.debug("[SyncEngine] Push started...");

            // 1. Calculate Diff: Local - Shadow
            const stateVector = Y.encodeStateVector(this.shadowDoc);
            const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

            if (diff.byteLength === 0) {
                // console.debug("[SyncEngine] No diff found. Synced.");
                this.hasPendingChanges = false;
                this.pendingCount = 0;
                this.setStatus('synced');
                this.isPushing = false;
                return;
            }

            // 2. Prepare Push
            const updateStr = btoa(String.fromCharCode.apply(null, diff));
            const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);

            // 3. Race Firestore against Timeout
            const pushPromise = addDoc(updatesColl, {
                update: updateStr,
                createdAt: serverTimestamp(),
                userId: this.userId
            });

            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error("Push Timeout"));
                }, PUSH_TIMEOUT_MS);
            });

            await Promise.race([pushPromise, timeoutPromise]);
            clearTimeout(timeoutId);

            // console.info(`[SyncEngine] Push Success (${diff.byteLength} bytes).`);

            // 4. Update Shadow to match confirmed state
            Y.applyUpdate(this.shadowDoc, diff);

            // 5. Re-check for more changes
            this.checkForPendingChanges();

        } catch (error) {
            clearTimeout(timeoutId);
            console.warn(`[SyncEngine] Push Failed: ${error.message}`);

            // If timeout or error, we mark as offline so user knows.
            // Pending changes remain in flags for next retry.
            this.setStatus('offline');
        } finally {
            this.isPushing = false;
        }
    }

    checkForPendingChanges() {
        // Double check if we still have differences after the push
        const stateVector = Y.encodeStateVector(this.shadowDoc);
        const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

        if (diff.byteLength > 0) {
            this.hasPendingChanges = true;
            this.updatePendingCount();
            this.debouncedPush();
        } else {
            this.hasPendingChanges = false;
            this.pendingCount = 0;
            this.notifyListeners();
            this.setStatus('synced');
        }
    }

    updatePendingCount() {
        this.pendingCount = this.hasPendingChanges ? 1 : 0;
        this.notifyListeners();
    }

    debouncedPush() {
        clearTimeout(this.pushTimeout);
        this.pushTimeout = setTimeout(() => this.tryPushUpdates(), 1000); // 1s optimized debounce
    }

    seedData() {
        if (this.doc.getMap('data').keys().next().done && Object.keys(this.initialData).length > 0) {
            console.info(`[SyncEngine] Seeding default data for ${this.docId}`);
            this.doc.transact(() => {
                const map = this.doc.getMap('data');
                Object.entries(this.initialData).forEach(([k, v]) => {
                    map.set(k, v);
                });
            });
        }
    }

    setStatus(newStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            this.notifyListeners();
        }
    }

    // --- Public API ---

    getDoc() {
        return this.doc;
    }

    getStatus() {
        return {
            status: this.status,
            pendingCount: this.pendingCount
        };
    }

    subscribe(callback) {
        this.listeners.add(callback);
        // Initial call
        callback(this.getStatus());
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        const state = this.getStatus();
        this.listeners.forEach(cb => cb(state));
    }

    destroy() {
        console.info("[SyncEngine] Destroying...");
        this.unsubscribes.forEach(fn => fn());
        this.localProvider.destroy();
        clearTimeout(this.pushTimeout);
        this.listeners.clear();
        // this.doc.destroy(); // Optional: keeps memory clean
    }
}
