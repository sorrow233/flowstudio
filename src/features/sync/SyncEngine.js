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

// Unique session ID for this browser tab
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * SyncEngine - Final Fixed Version
 * 
 * Key insight: Shadow Doc must be initialized from Main Doc's FULL state,
 * not from incremental server updates. This ensures their internal state
 * (including Yjs clientIDs and clocks) are identical.
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

        // Flags
        this.isPushing = false;
        this.isServerLoaded = false;
        this.isIndexedDBLoaded = false;
        this.unsubscribes = [];
        this.pushTimeout = null;

        // Deduplication
        this.processedUpdateIds = new Set();

        this.init();
    }

    init() {
        console.info(`[SyncEngine] Init: ${this.docId}`);

        // 1. IndexedDB (Local First)
        this.localProvider = new IndexeddbPersistence(this.docId, this.doc);
        this.localProvider.on('synced', () => {
            console.info(`[SyncEngine] IndexedDB synced.`);
            this.isIndexedDBLoaded = true;
            this.seedData();
            this.tryInitializeShadow();
        });

        // 2. Network
        window.addEventListener('online', () => this.onNetworkChange());
        this.unsubscribes.push(() => window.removeEventListener('online', () => this.onNetworkChange()));

        // 3. Firestore
        if (this.userId) {
            this.connectFirestore();
        } else {
            this.setStatus('offline');
            this.isServerLoaded = true;
            this.tryInitializeShadow();
        }

        // 4. Local changes
        this.doc.on('update', (update, origin) => {
            if (origin !== 'remote' && this.isServerLoaded && this.isIndexedDBLoaded) {
                this.setStatus('syncing');
                this.schedulePush();
            }
        });
    }

    onNetworkChange() {
        if (navigator.onLine && this.hasPendingChanges()) {
            this.schedulePush();
        }
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

                    // Skip our own updates
                    if (this.processedUpdateIds.has(docId) || data.sessionId === this.sessionId) {
                        this.processedUpdateIds.add(docId);
                        return;
                    }

                    if (data.update) {
                        try {
                            const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                            // Apply to BOTH Main and Shadow
                            Y.applyUpdate(this.doc, update, 'remote');
                            Y.applyUpdate(this.shadowDoc, update);
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
                this.tryInitializeShadow();
            }

        }, (error) => {
            console.error("[SyncEngine] Firestore error:", error.code);
            this.isServerLoaded = true;
            this.setStatus('offline');
            this.tryInitializeShadow();
        });

        this.unsubscribes.push(unsub);
    }

    /**
     * KEY FIX: Initialize Shadow Doc from Main Doc's FULL state.
     * This ensures they have identical internal clocks/clientIDs.
     */
    tryInitializeShadow() {
        if (!this.isServerLoaded || !this.isIndexedDBLoaded) return;

        // Copy Main's full state to Shadow
        const fullState = Y.encodeStateAsUpdate(this.doc);
        Y.applyUpdate(this.shadowDoc, fullState);
        console.info("[SyncEngine] Shadow initialized from Main. Checking for pending...");

        this.checkAndSync();
    }

    hasPendingChanges() {
        const sv = Y.encodeStateVector(this.shadowDoc);
        const diff = Y.encodeStateAsUpdate(this.doc, sv);
        return diff.byteLength > 0;
    }

    checkAndSync() {
        if (this.hasPendingChanges()) {
            this.setStatus('syncing');
            this.schedulePush();
        } else {
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

            // Pre-generate ID
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

            // Update Shadow
            Y.applyUpdate(this.shadowDoc, diff);

            // Check again
            this.checkAndSync();

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
        this.localProvider.destroy();
        clearTimeout(this.pushTimeout);
        this.listeners.clear();
    }
}
