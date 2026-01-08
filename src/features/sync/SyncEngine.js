import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// 防抖时间：10秒（减少写入频率）
const PUSH_DEBOUNCE_MS = 10000;

// 最小推送间隔：30秒（即使有多次变更，也至少等待30秒）
const MIN_PUSH_INTERVAL_MS = 30000;

/**
 * SyncEngine v2 - 单文档同步版本
 * 
 * 核心优化：
 * 1. 使用单个文档存储完整状态，而非无限增长的 updates 子集合
 * 2. 监听单个文档而非整个集合，大幅减少读取次数
 * 3. 使用版本号防止并发冲突
 * 4. 更长的防抖时间减少写入次数
 * 
 * 数据结构：
 * users/{userId}/rooms/{docId} -> { state: base64, version: number, updatedAt: timestamp, sessionId: string }
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
        this.isDirty = false;
        this.isReady = false;
        this.isIndexedDBLoaded = false;
        this.isServerLoaded = false;
        this.unsubscribes = [];
        this.pushTimeout = null;

        // 版本控制
        this.localVersion = 0;
        this.remoteVersion = 0;

        // 推送节流
        this.lastPushTime = 0;

        // 防止处理自己的更新
        this.lastPushedSessionId = null;

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

    /**
     * 连接 Firestore - 监听单个文档而非集合
     */
    connectFirestore() {
        this.setStatus('syncing');

        // 单个文档路径，不再使用 updates 子集合
        const stateDocRef = doc(db, `users/${this.userId}/rooms`, this.docId);

        const unsub = onSnapshot(stateDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                // 文档不存在，首次同步
                console.info("[SyncEngine] No remote state, starting fresh.");
                if (!this.isServerLoaded) {
                    this.isServerLoaded = true;
                    this.tryReady();
                }
                return;
            }

            const data = snapshot.data();

            // 跳过自己刚刚推送的更新
            if (data.sessionId === this.sessionId && data.version === this.localVersion) {
                console.info("[SyncEngine] Skipping own update.");
                if (!this.isServerLoaded) {
                    this.isServerLoaded = true;
                    this.tryReady();
                }
                return;
            }

            // 更新远程版本号
            this.remoteVersion = data.version || 0;

            // 应用远程状态
            if (data.state) {
                try {
                    const remoteState = Uint8Array.from(atob(data.state), c => c.charCodeAt(0));
                    Y.applyUpdate(this.doc, remoteState, 'remote');
                    console.info(`[SyncEngine] Applied remote state, version: ${this.remoteVersion}`);
                } catch (e) {
                    console.error("[SyncEngine] Failed to apply remote state:", e);
                }
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
        this.localVersion = this.remoteVersion;

        console.info("[SyncEngine] Ready!");
        this.setStatus('synced');
    }

    /**
     * 智能防抖推送
     * - 基础防抖：10秒
     * - 最小间隔：30秒（防止频繁推送）
     */
    schedulePush() {
        clearTimeout(this.pushTimeout);

        const now = Date.now();
        const timeSinceLastPush = now - this.lastPushTime;

        // 计算下次推送的延迟时间
        let delay = PUSH_DEBOUNCE_MS;
        if (timeSinceLastPush < MIN_PUSH_INTERVAL_MS) {
            // 如果距离上次推送不足30秒，延长等待时间
            delay = Math.max(delay, MIN_PUSH_INTERVAL_MS - timeSinceLastPush);
        }

        this.pushTimeout = setTimeout(() => this.tryPush(), delay);
    }

    async tryPush() {
        if (this.isPushing || !navigator.onLine || !this.isDirty || !this.userId) {
            if (!this.isDirty) this.setStatus('synced');
            return;
        }

        try {
            this.isPushing = true;

            // 编码完整状态（而非增量）
            const fullState = Y.encodeStateAsUpdate(this.doc);

            if (fullState.byteLength === 0) {
                console.info("[SyncEngine] No state to push.");
                this.isDirty = false;
                this.setStatus('synced');
                return;
            }

            // 增加本地版本号
            const newVersion = Math.max(this.localVersion, this.remoteVersion) + 1;

            console.info(`[SyncEngine] Pushing ${fullState.byteLength} bytes, version: ${newVersion}...`);

            const stateDocRef = doc(db, `users/${this.userId}/rooms`, this.docId);

            await setDoc(stateDocRef, {
                state: btoa(String.fromCharCode.apply(null, fullState)),
                version: newVersion,
                updatedAt: serverTimestamp(),
                userId: this.userId,
                sessionId: this.sessionId
            });

            console.info("[SyncEngine] Push success!");

            this.localVersion = newVersion;
            this.lastPushTime = Date.now();
            this.isDirty = false;
            this.setStatus('synced');

        } catch (error) {
            console.error("[SyncEngine] Push failed:", error);
            this.setStatus('offline');
            // 失败后重试
            this.schedulePush();
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
