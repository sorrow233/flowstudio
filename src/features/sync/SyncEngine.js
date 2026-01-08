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
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * SyncEngine - Simplified & Robust
 * 
 * Key principle: Shadow Doc always equals Main Doc AFTER initialization.
 * Only user-initiated local changes (not remote updates) should create diffs.
 */
export class SyncEngine {
    constructor(docId, userId, initialData = {}) {
        this.docId = docId;
        this.userId = userId;
        this.initialData = initialData;
        this.sessionId = SESSION_ID;

        this.status = 'disconnected';
        this.pendingCount = 0;
        this.listeners = new Set();

        this.doc = new Y.Doc();
        this.shadowDoc = new Y.Doc();

        this.isPushing = false;
        this.isReady = false;  // Only true after BOTH sources loaded
        this.isIndexedDBLoaded = false;
        this.isServerLoaded = false;
        this.unsubscribes = [];
        this.pushTimeout = null;
        this.processedUpdateIds = new Set();

        this.init();
    }

    init() {
        console.info(`[SyncEngine] Init: ${this.docId}, session: ${this.sessionId.slice(0, 8)}`);

        // 1. IndexedDB
        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            console.info(`[SyncEngine] IndexedDB synced.`);
            this.isIndexedDBLoaded = true;
            this.seedData();
            this.tryReady();
        });

        // 2. Network
        window.addEventListener('online', () => {
            if (this.isReady) this.schedulePush();
        });

        // 3. Firestore
        if (this.userId) {
            this.connectFirestore();
        } else {
            this.setStatus('offline');
            this.isServerLoaded = true;
            this.tryReady();
        }

        // 4. Local changes - ONLY trigger push for non-remote changes AFTER ready
        this.doc.on('update', (update, origin) => {
            if (origin !== 'remote' && this.isReady) {
                console.debug("[SyncEngine] Local change detected.");
                this.setStatus('syncing');
                this.schedulePush();
            }
        });
    }

    connectFirestore() {
        this.setStatus('syncing');
        const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);
        const q = query(updatesColl, orderBy('createdAt', 'asc'));

        const unsub = onSnapshot(q, (snapshot) => {
            const updates = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const docId = change.doc.id;
                    const data = change.doc.data();

                    // Skip our own updates
                    if (this.processedUpdateIds.has(docId) || data.sessionId === this.sessionId) {
                        this.processedUpdateIds.add(docId);
                        return;
                    }

                    if (data.update) {
                        try {
                            updates.push(Uint8Array.from(atob(data.update), c => c.charCodeAt(0)));
                        } catch (e) {
                            console.error("[SyncEngine] Parse error:", e);
                        }
                    }
                }
            });

            if (updates.length > 0) {
                console.info(`[SyncEngine] Applying ${updates.length} remote updates.`);
                updates.forEach(u => {
                    Y.applyUpdate(this.doc, u, 'remote');
                    Y.applyUpdate(this.shadowDoc, u);
                });
            }

            if (!this.isServerLoaded) {
                this.isServerLoaded = true;
                console.info("[SyncEngine] Server loaded.");
                this.tryReady();
            }

        }, (error) => {
            console.error("[SyncEngine] Firestore error:", error.code);
            this.isServerLoaded = true;
            this.setStatus('offline');
            this.tryReady();
        });

        this.unsubscribes.push(unsub);
    }

    /**
     * Called when either source finishes loading.
     * When BOTH are ready, sync Shadow to Main and mark as ready.
     */
    tryReady() {
        if (this.isReady) return;  // Already done
        if (!this.isServerLoaded || !this.isIndexedDBLoaded) return;  // Not both yet

        // Sync Shadow to Main's current state
        const fullState = Y.encodeStateAsUpdate(this.doc);
        Y.applyUpdate(this.shadowDoc, fullState);

        this.isReady = true;
        console.info("[SyncEngine] Ready! Shadow synced to Main.");

        // Now check if there are any local changes that need pushing
        // (There shouldn't be, but just in case)
        const diff = Y.encodeStateAsUpdate(this.doc, Y.encodeStateVector(this.shadowDoc));
        if (diff.byteLength > 0) {
            console.warn(`[SyncEngine] Unexpected diff after ready: ${diff.byteLength} bytes. Pushing...`);
            this.setStatus('syncing');
            this.schedulePush();
        } else {
            console.info("[SyncEngine] No pending changes. Synced!");
            this.setStatus('synced');
        }
    }

    schedulePush() {
        clearTimeout(this.pushTimeout);
        this.pushTimeout = setTimeout(() => this.tryPush(), 1500);
    }

    async tryPush() {
        if (this.isPushing || !navigator.onLine) return;

        const sv = Y.encodeStateVector(this.shadowDoc);
        const diff = Y.encodeStateAsUpdate(this.doc, sv);

        if (diff.byteLength === 0) {
            this.setStatus('synced');
            return;
        }

        try {
            this.isPushing = true;
            console.info(`[SyncEngine] Pushing ${diff.byteLength} bytes...`);

            const updatesColl = collection(db, `users/${this.userId}/rooms/${this.docId}/updates`);
            const newDocRef = doc(updatesColl);
            this.processedUpdateIds.add(newDocRef.id);

            await setDoc(newDocRef, {
                update: btoa(String.fromCharCode.apply(null, diff)),
                createdAt: serverTimestamp(),
                userId: this.userId,
                sessionId: this.sessionId
            });

            console.info("[SyncEngine] Push success!");
            Y.applyUpdate(this.shadowDoc, diff);

            // Check again
            const newDiff = Y.encodeStateAsUpdate(this.doc, Y.encodeStateVector(this.shadowDoc));
            if (newDiff.byteLength > 0) {
                this.schedulePush();
            } else {
                this.setStatus('synced');
            }

        } catch (error) {
            console.error("[SyncEngine] Push failed:", error);
            this.setStatus('offline');
        } finally {
            this.isPushing = false;
        }
    }

    seedData() {
        if (this.doc.getMap('data').keys().next().done && Object.keys(this.initialData).length > 0) {
            this.doc.transact(() => {
                const map = this.doc.getMap('data');
                Object.entries(this.initialData).forEach(([k, v]) => map.set(k, v));
            });
        }
    }

    setStatus(s) {
        if (this.status !== s) {
            this.status = s;
            this.pendingCount = s === 'syncing' ? 1 : 0;
            this.notifyListeners();
        }
    }

    getDoc() { return this.doc; }
    getStatus() { return { status: this.status, pendingCount: this.pendingCount }; }

    subscribe(cb) {
        this.listeners.add(cb);
        cb(this.getStatus());
        return () => this.listeners.delete(cb);
    }

    notifyListeners() {
        const s = this.getStatus();
        this.listeners.forEach(cb => cb(s));
    }

    destroy() {
        this.unsubscribes.forEach(fn => fn());
        this.localProvider?.destroy();
        clearTimeout(this.pushTimeout);
        this.listeners.clear();
    }
}
