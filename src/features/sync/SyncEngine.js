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
 * SyncEngine - Debug Version
 */
export class SyncEngine {
    constructor(docId, userId, initialData = {}) {
        this.docId = docId;
        this.userId = userId;
        this.initialData = initialData;

        // State
        this.status = 'disconnected';
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

        // Track processed updates to avoid re-processing our own pushes
        this.processedUpdateIds = new Set();

        // Init
        this.init();
    }

    init() {
        console.info(`[SyncEngine] Initializing for ${this.docId}, userId: ${this.userId}`);

        // 1. IndexedDB (Local First)
        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            console.info(`[SyncEngine] IndexedDB synced.`);
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
            console.warn("[SyncEngine] No userId, going offline mode.");
            this.setStatus('offline');
            this.isServerLoaded = true;
        }

        // 4. Local Update Listener
        const handleUpdate = (update, origin) => {
            if (origin !== 'remote') {
                if (!this.isServerLoaded) {
                    console.debug("[SyncEngine] Ignoring local update (server not loaded yet).");
                    return;
                }

                console.debug("[SyncEngine] Local update detected, marking pending.");
                this.hasPendingChanges = true;
                this.updatePendingCount();
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

        const q = query(updatesColl, orderBy('createdAt', 'asc'));
        console.info("[SyncEngine] Connecting to Firestore...");

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            console.info(`[SyncEngine] onSnapshot: ${snapshot.docChanges().length} changes.`);

            const updatesToApply = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const docId = change.doc.id;

                    // Skip if we already processed this (our own push)
                    if (this.processedUpdateIds.has(docId)) {
                        console.debug(`[SyncEngine] Skipping already processed update: ${docId}`);
                        return;
                    }

                    const data = change.doc.data();
                    if (data.update) {
                        try {
                            const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                            updatesToApply.push({ id: docId, update });
                        } catch (e) {
                            console.error("[SyncEngine] Failed to parse update:", e);
                        }
                    }
                }
            });

            if (updatesToApply.length > 0) {
                console.info(`[SyncEngine] Applying ${updatesToApply.length} updates from server.`);

                // Apply to Main
                this.doc.transact(() => {
                    updatesToApply.forEach(({ update }) => Y.applyUpdate(this.doc, update, 'remote'));
                }, 'remote');

                // Apply to Shadow
                this.shadowDoc.transact(() => {
                    updatesToApply.forEach(({ update }) => Y.applyUpdate(this.shadowDoc, update));
                });

                // Mark as processed
                updatesToApply.forEach(({ id }) => this.processedUpdateIds.add(id));
            }

            // Mark server as loaded
            if (!this.isServerLoaded) {
                this.isServerLoaded = true;
                console.info("[SyncEngine] Server state loaded. Now checking for pending local changes...");
            }

            this.checkForPendingChanges();

        }, (error) => {
            console.error("[SyncEngine] Firestore Error:", error.code, error.message);
            this.isServerLoaded = true;
            this.setStatus('offline');
        });

        this.unsubscribes.push(unsubscribeSnapshot);
    }

    async tryPushUpdates() {
        console.debug(`[SyncEngine] tryPushUpdates called. isPushing=${this.isPushing}, hasPendingChanges=${this.hasPendingChanges}, onLine=${navigator.onLine}`);

        if (this.isPushing) {
            console.debug("[SyncEngine] Already pushing, skipping.");
            return;
        }
        if (!this.hasPendingChanges) {
            console.debug("[SyncEngine] No pending changes, skipping.");
            return;
        }
        if (!navigator.onLine) {
            console.debug("[SyncEngine] Offline, skipping.");
            return;
        }

        const PUSH_TIMEOUT_MS = 15000;
        let timeoutId;

        try {
            this.isPushing = true;
            console.info("[SyncEngine] Push started...");

            // 1. Calculate Diff
            const stateVector = Y.encodeStateVector(this.shadowDoc);
            const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

            console.info(`[SyncEngine] Diff size: ${diff.byteLength} bytes`);

            if (diff.byteLength === 0) {
                console.info("[SyncEngine] No diff found. Already synced.");
                this.hasPendingChanges = false;
                this.pendingCount = 0;
                this.setStatus('synced');
                this.isPushing = false;
                return;
            }

            // 2. Send to Firestore
            const updateStr = btoa(String.fromCharCode.apply(null, diff));
            const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);

            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error("Push Timeout"));
                }, PUSH_TIMEOUT_MS);
            });

            console.info("[SyncEngine] Sending to Firestore...");
            const docRef = await Promise.race([
                addDoc(updatesColl, {
                    update: updateStr,
                    createdAt: serverTimestamp(),
                    userId: this.userId
                }),
                timeoutPromise
            ]);
            clearTimeout(timeoutId);

            // Mark this update ID as processed so we don't re-apply it from onSnapshot
            this.processedUpdateIds.add(docRef.id);

            console.info(`[SyncEngine] Push Success! DocId: ${docRef.id}`);

            // 3. Update Shadow
            Y.applyUpdate(this.shadowDoc, diff);

            // 4. Re-check
            this.checkForPendingChanges();

        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`[SyncEngine] Push Failed:`, error);
            this.setStatus('offline');
        } finally {
            this.isPushing = false;
        }
    }

    checkForPendingChanges() {
        const stateVector = Y.encodeStateVector(this.shadowDoc);
        const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

        console.debug(`[SyncEngine] checkForPendingChanges: diff=${diff.byteLength} bytes`);

        if (diff.byteLength > 0) {
            this.hasPendingChanges = true;
            this.updatePendingCount();
            // Don't immediately push again, debounce it
            if (!this.isPushing) {
                this.debouncedPush();
            }
        } else {
            console.info("[SyncEngine] No pending changes. Synced!");
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
        this.pushTimeout = setTimeout(() => this.tryPushUpdates(), 1500);
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
            console.info(`[SyncEngine] Status: ${this.status} -> ${newStatus}`);
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
    }
}
