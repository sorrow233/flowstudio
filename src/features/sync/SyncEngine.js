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
 * SyncEngine - No Shadow Doc Version
 * 
 * Key change: Instead of maintaining a Shadow Doc (which fails due to Yjs clientID issues),
 * we simply track whether we have pending local changes using a flag.
 * 
 * Strategy:
 * 1. All remote updates are applied with origin='remote'
 * 2. Local changes (origin !== 'remote') set a "dirty" flag
 * 3. Push sends ALL local state (not a diff) - simpler and more reliable
 * 4. After push, clear the dirty flag
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

        this.isPushing = false;
        this.isDirty = false;  // Simple flag: true if local changes exist
        this.isReady = false;
        this.isIndexedDBLoaded = false;
        this.isServerLoaded = false;
        this.unsubscribes = [];
        this.pushTimeout = null;
        this.processedUpdateIds = new Set();

        // Track latest known server state vector for comparison
        this.lastSyncedStateVector = null;

        this.init();
    }

    init() {
        console.info(`[SyncEngine] Init: ${this.docId}`);

        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            console.info(`[SyncEngine] IndexedDB synced.`);
            this.isIndexedDBLoaded = true;
            this.seedData();
            this.tryReady();
        });

        window.addEventListener('online', () => {
            if (this.isReady && this.isDirty) this.schedulePush();
        });

        if (this.userId) {
            this.connectFirestore();
        } else {
            this.setStatus('offline');
            this.isServerLoaded = true;
            this.tryReady();
        }

        // Track local changes
        this.doc.on('update', (update, origin) => {
            if (origin !== 'remote' && this.isReady) {
                this.isDirty = true;
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
            let appliedCount = 0;

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const docId = change.doc.id;
                    const data = change.doc.data();

                    if (this.processedUpdateIds.has(docId) || data.sessionId === this.sessionId) {
                        this.processedUpdateIds.add(docId);
                        return;
                    }

                    if (data.update) {
                        try {
                            const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                            Y.applyUpdate(this.doc, update, 'remote');
                            appliedCount++;
                        } catch (e) {
                            console.error("[SyncEngine] Parse error:", e);
                        }
                    }
                }
            });

            if (appliedCount > 0) {
                console.info(`[SyncEngine] Applied ${appliedCount} remote updates.`);
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

    tryReady() {
        if (this.isReady) return;
        if (!this.isServerLoaded || !this.isIndexedDBLoaded) return;

        this.isReady = true;
        this.lastSyncedStateVector = Y.encodeStateVector(this.doc);

        console.info("[SyncEngine] Ready!");
        this.setStatus('synced');
    }

    schedulePush() {
        clearTimeout(this.pushTimeout);
        this.pushTimeout = setTimeout(() => this.tryPush(), 2000);
    }

    async tryPush() {
        if (this.isPushing || !navigator.onLine || !this.isDirty) {
            if (!this.isDirty) this.setStatus('synced');
            return;
        }

        try {
            this.isPushing = true;

            // Send incremental update from last synced state
            const diff = this.lastSyncedStateVector
                ? Y.encodeStateAsUpdate(this.doc, this.lastSyncedStateVector)
                : Y.encodeStateAsUpdate(this.doc);

            if (diff.byteLength === 0) {
                console.info("[SyncEngine] No changes to push.");
                this.isDirty = false;
                this.setStatus('synced');
                return;
            }

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

            // Update our reference point
            this.lastSyncedStateVector = Y.encodeStateVector(this.doc);
            this.isDirty = false;
            this.setStatus('synced');

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
