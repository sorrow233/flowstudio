import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    limit,
    where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Generate a unique session ID for this browser tab
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * SyncEngine - Final Robust Version
 * 
 * Strategy:
 * 1. Pre-generate Doc ID: We know the ID *before* we send the request.
 * 2. Block-list: Add this ID to `processedUpdateIds` immediately.
 * 3. Session ID: Double-check filter as backup.
 * 
 * This combination eliminates the race condition where `onSnapshot` sees the new doc
 * before `addDoc` returns the ID.
 */
export class SyncEngine {
    constructor(docId, userId, initialData = {}) {
        this.docId = docId;
        this.userId = userId;
        this.initialData = initialData;
        this.sessionId = SESSION_ID;

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

        // De-duplication Set
        this.processedUpdateIds = new Set();

        // Init
        this.init();
    }

    init() {
        console.info(`[SyncEngine] Init: docId=${this.docId}, sessionId=${this.sessionId}`);

        // 1. IndexedDB (Local First)
        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            console.info(`[SyncEngine] IndexedDB synced.`);
            this.seedData();
        });

        // 2. Network Listeners
        const handleOnline = () => {
            console.info("[SyncEngine] Network Online.");
            if (this.hasPendingChanges) {
                this.debouncedPush();
            }
        };
        window.addEventListener('online', handleOnline);
        this.unsubscribes.push(() => window.removeEventListener('online', handleOnline));

        // 3. Firestore Listeners (if user exists)
        if (this.userId) {
            this.connectFirestore();
        } else {
            console.warn("[SyncEngine] No userId, offline mode.");
            this.setStatus('offline');
            this.isServerLoaded = true;
        }

        // 4. Local Update Listener
        const handleUpdate = (update, origin) => {
            if (origin !== 'remote') {
                if (!this.isServerLoaded) return;

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
            const updatesToApply = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const docId = change.doc.id;
                    const data = change.doc.data();

                    // FILTER 1: Processed IDs (Pre-emptive)
                    if (this.processedUpdateIds.has(docId)) {
                        console.debug(`[SyncEngine] Filter: Blocked own update ID: ${docId}`);
                        return;
                    }

                    // FILTER 2: Session ID (Backup)
                    if (data.sessionId === this.sessionId) {
                        console.debug(`[SyncEngine] Filter: Blocked own session: ${data.sessionId}`);
                        // Add to processed set just in case
                        this.processedUpdateIds.add(docId);
                        return;
                    }

                    // Debug log to see what we ARE accepting
                    // console.debug(`[SyncEngine] Accepting update: ${docId}, session: ${data.sessionId}`);

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
                console.info(`[SyncEngine] Applying ${updatesToApply.length} remote updates.`);

                // Apply to Main Doc
                this.doc.transact(() => {
                    updatesToApply.forEach(u => Y.applyUpdate(this.doc, u, 'remote'));
                }, 'remote');

                // Apply to Shadow Doc
                this.shadowDoc.transact(() => {
                    updatesToApply.forEach(u => Y.applyUpdate(this.shadowDoc, u));
                });
            }

            // Mark server as loaded
            if (!this.isServerLoaded) {
                this.isServerLoaded = true;
                console.info("[SyncEngine] Server loaded.");
            }

            this.checkForPendingChanges();

        }, (error) => {
            console.error("[SyncEngine] Firestore Error:", error.code);
            this.isServerLoaded = true;
            this.setStatus('offline');
        });

        this.unsubscribes.push(unsubscribeSnapshot);
    }

    async tryPushUpdates() {
        if (this.isPushing || !this.hasPendingChanges || !navigator.onLine) {
            return;
        }

        const PUSH_TIMEOUT_MS = 15000;
        let timeoutId;

        try {
            this.isPushing = true;

            // Calculate Diff
            const stateVector = Y.encodeStateVector(this.shadowDoc);
            const diff = Y.encodeStateAsUpdate(this.doc, stateVector);

            if (diff.byteLength === 0) {
                console.info("[SyncEngine] No diff. Synced!");
                this.hasPendingChanges = false;
                this.pendingCount = 0;
                this.setStatus('synced');
                this.isPushing = false;
                return;
            }

            console.info(`[SyncEngine] Pushing ${diff.byteLength} bytes...`);

            // 1. Generate ID locally
            const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);
            const newDocRef = doc(updatesColl); // Auto-generated ID, but now we know it!

            // 2. Block this ID immediately
            this.processedUpdateIds.add(newDocRef.id);
            console.debug(`[SyncEngine] Generated Push ID: ${newDocRef.id} (Blocked locally)`);

            // 3. Send
            const updateStr = btoa(String.fromCharCode.apply(null, diff));

            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error("Push Timeout"));
                }, PUSH_TIMEOUT_MS);
            });

            await Promise.race([
                setDoc(newDocRef, {
                    update: updateStr,
                    createdAt: serverTimestamp(),
                    userId: this.userId,
                    sessionId: this.sessionId
                }),
                timeoutPromise
            ]);
            clearTimeout(timeoutId);

            console.info("[SyncEngine] Push Success!");

            // 4. Update Shadow
            Y.applyUpdate(this.shadowDoc, diff);

            // 5. Re-check
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

        if (diff.byteLength > 0) {
            this.hasPendingChanges = true;
            this.updatePendingCount();
            if (!this.isPushing) {
                this.debouncedPush();
            }
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
        this.pushTimeout = setTimeout(() => this.tryPushUpdates(), 1500);
    }

    seedData() {
        if (this.doc.getMap('data').keys().next().done && Object.keys(this.initialData).length > 0) {
            console.info(`[SyncEngine] Seeding default data.`);
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
            // console.info(`[SyncEngine] Status: ${this.status} -> ${newStatus}`);
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
