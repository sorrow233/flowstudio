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
        }

        // 4. Local Update Listener
        const handleUpdate = (update, origin) => {
            if (origin !== 'remote') {
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

            // Post-pull check: Do we have local changes that need pushing?
            // (e.g. we were offline, got new server data, now we merge ours)
            this.checkForPendingChanges();

        }, (error) => {
            if (error.code === 'permission-denied' || error.code === 'unavailable') {
                console.warn("[SyncEngine] Firestore Error (Offline Mode):", error.code);
            } else {
                console.error("[SyncEngine] Firestore Error:", error);
            }
            this.setStatus('offline');
        });

        this.unsubscribes.push(unsubscribeSnapshot);
    }

    async tryPushUpdates() {
        if (this.isPushing || !this.hasPendingChanges || !navigator.onLine) return;

        try {
            this.isPushing = true;

            // Calculate Diff: Local - Shadow
            const stateVector = Y.encodeStateVector(this.shadowDoc);
            const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

            if (diff.byteLength === 0) {
                this.hasPendingChanges = false;
                this.pendingCount = 0;
                this.setStatus('synced');
                this.isPushing = false;
                return;
            }

            // Send
            const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);
            const updateStr = btoa(String.fromCharCode.apply(null, diff));

            await addDoc(updatesColl, {
                update: updateStr,
                createdAt: serverTimestamp(),
                userId: this.userId
            });

            // Update Shadow to match confirmed state
            Y.applyUpdate(this.shadowDoc, diff);

            // Re-check
            this.checkForPendingChanges();

        } catch (error) {
            console.warn("[SyncEngine] Push Failed:", error.code);
            this.setStatus('offline');
            // Don't clear pending changes; retry later
        } finally {
            this.isPushing = false;
        }
    }

    checkForPendingChanges() {
        const stateVector = Y.encodeStateVector(this.shadowDoc);
        const diff = Y.encodeStateAsUpdate(this.doc, stateVector);
        if (diff.byteLength > 0) {
            this.hasPendingChanges = true;
            this.updatePendingCount();
            this.debouncedPush();
        } else {
            this.hasPendingChanges = false;
            this.pendingCount = 0;
            this.notifyListeners(); // Update UI to show 0 pending
            this.setStatus('synced');
        }
    }

    updatePendingCount() {
        // Estimating complexity of pending changes is hard in binary Yjs.
        // We will just use a generic "Pending" flag or try to estimate bytes.
        // For UI "Saving (3)...", exact operation count is complex.
        // We'll stick to a simple byte-size check or valid updates count.
        // For this iteration, let's just assume 1 composite update pending if hasPendingChanges is true.
        // Or we could track local 'update' events since last sync.

        // Let's refine this: We can't easily know "how many cards" changed.
        // But we can show "Unsaved Changes" text.
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
