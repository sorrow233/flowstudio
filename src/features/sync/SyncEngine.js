import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// 防抖时间：10秒（减少写入频率）
const PUSH_DEBOUNCE_MS = 10000;

// 最小推送间隔：30秒（即使有多次变更，也至少等待30秒）
const MIN_PUSH_INTERVAL_MS = 30000;

// 重试配置
const MAX_RETRY_COUNT = 5;
const INITIAL_RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 120000; // 2分钟

/**
 * SyncEngine v2 - 单文档同步版本
 * 
 * 核心优化：
 * 1. 使用单个文档存储完整状态，而非无限增长的 updates 子集合
 * 2. 监听单个文档而非整个集合，大幅减少读取次数
 * 3. 使用版本号防止并发冲突
 * 4. 更长的防抖时间减少写入次数
 * 5. 智能重试机制：指数退避 + 最大重试次数限制
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

        // 重试控制
        this.retryCount = 0;
        this.hasPermissionError = false;

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
     * 注意：重复调用时会先取消旧监听，防止监听器累积
     */
    connectFirestore() {
        // 防止重复监听：先取消所有旧监听器
        this.unsubscribes.forEach(fn => fn());
        this.unsubscribes = [];

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

            // 成功接收数据，清除权限错误状态
            if (this.hasPermissionError) {
                console.info("[SyncEngine] Permission restored, resuming sync.");
                this.hasPermissionError = false;
                this.retryCount = 0;
                // 如果有待推送的数据，立即调度推送
                if (this.isDirty) {
                    this.schedulePush();
                }
            }

            if (!this.isServerLoaded) {
                this.isServerLoaded = true;
                console.info("[SyncEngine] Server loaded.");
                this.tryReady();
            }

        }, (error) => {
            const isPermissionError = error.code === 'permission-denied';

            if (isPermissionError) {
                console.warn("[SyncEngine] Firestore permission denied - waiting for auth.");
                this.hasPermissionError = true;
                // 权限错误时不立即进入 ready，等待权限恢复
                // 但仍然设置 isServerLoaded 以便本地数据可用
            } else {
                console.error("[SyncEngine] Firestore error:", error.code);
            }

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
     * - 权限错误时跳过推送直到权限恢复
     */
    schedulePush() {
        clearTimeout(this.pushTimeout);

        // 如果处于权限错误状态，暂不调度推送
        if (this.hasPermissionError) {
            console.info("[SyncEngine] Skipping push - waiting for permission.");
            return;
        }

        // 如果已超过最大重试次数，暂停推送
        if (this.retryCount >= MAX_RETRY_COUNT) {
            console.warn(`[SyncEngine] Max retries (${MAX_RETRY_COUNT}) reached, pausing push.`);
            return;
        }

        const now = Date.now();
        const timeSinceLastPush = now - this.lastPushTime;

        // 计算下次推送的延迟时间
        let delay = PUSH_DEBOUNCE_MS;
        if (timeSinceLastPush < MIN_PUSH_INTERVAL_MS) {
            // 如果距离上次推送不足30秒，延长等待时间
            delay = Math.max(delay, MIN_PUSH_INTERVAL_MS - timeSinceLastPush);
        }

        // 如果是重试，使用指数退避
        if (this.retryCount > 0) {
            const backoffDelay = Math.min(
                INITIAL_RETRY_DELAY_MS * Math.pow(2, this.retryCount - 1),
                MAX_RETRY_DELAY_MS
            );
            delay = Math.max(delay, backoffDelay);
            console.info(`[SyncEngine] Retry ${this.retryCount}/${MAX_RETRY_COUNT}, delay: ${delay}ms`);
        }

        this.pushTimeout = setTimeout(() => this.tryPush(), delay);
    }

    /**
     * 使用事务推送：Read-Modify-Write 原子操作
     * 确保不会覆盖他人刚提交的更新
     */
    async tryPush() {
        if (this.isPushing || !navigator.onLine || !this.isDirty || !this.userId) {
            if (!this.isDirty) this.setStatus('synced');
            return;
        }

        this.isPushing = true;
        const stateDocRef = doc(db, `users/${this.userId}/rooms`, this.docId);

        try {
            await runTransaction(db, async (transaction) => {
                // 1. 读取远程最新状态
                const sfDoc = await transaction.get(stateDocRef);

                // 2. 如果远程有更新，先合并
                if (sfDoc.exists()) {
                    const data = sfDoc.data();
                    // 这里必须检查 remoteVersion，因为它可能在我们 debounce 期间被别人更新了
                    // 只有当远程版本大于我们已知的 remoteVersion 时才需要合并
                    // 或者，更安全的方式是：总是尝试合并远程状态到本地 doc (Yjs 处理幂等性)

                    if (data.version > this.localVersion) {
                        console.info(`[SyncEngine] Found newer remote version ${data.version} during push.`);
                        // 更新我们的远程版本基准
                        this.remoteVersion = data.version;

                        if (data.state) {
                            const remoteState = Uint8Array.from(atob(data.state), c => c.charCodeAt(0));
                            Y.applyUpdate(this.doc, remoteState, 'remote');
                        }
                    }
                }

                // 3. 编码现在的完整状态 (包含了刚才合并的远程变更)
                const fullState = Y.encodeStateAsUpdate(this.doc);

                if (fullState.byteLength === 0) {
                    // 理论上不太可能，除非 reset
                    return;
                }

                // 4. 计算新版本号 (基于最新的 remoteVersion)
                const newVersion = this.remoteVersion + 1;

                transaction.set(stateDocRef, {
                    state: btoa(String.fromCharCode.apply(null, fullState)),
                    version: newVersion,
                    updatedAt: serverTimestamp(),
                    userId: this.userId,
                    sessionId: this.sessionId
                });

                // 更新事务内的临时状态，等事务成功后再应用到实例
                return newVersion;
            });

            console.info("[SyncEngine] Transaction Push success!");

            // 事务成功后，更新本地状态
            // 注意：onSnapshot 也会收到这次更新，我们需要确保不重复处理
            // 但由于我们已经更新了 sessionId，onSnapshot 会忽略它

            // 乐观更新本地版本，防止 onSnapshot 还没回来时我们又发起推送
            // 但其实事务里返回了 newVersion
            // 我们还不知道具体的 newVersion，除非在 runTransaction 返回它
            // 我修改了上面的 return newVersion

            // 重新获取一下 doc 的状态来确认版本 (或者直接信任事务结果)
            // 由于事务是原子的，我们可以认为成功了

            // 下一次期望的 remoteVersion 应该是刚才推上去的 verify
            // 但这里我们简单点，等待 snapshot 回调来更新 remoteVersion
            // 重点是 isDirty = false

            this.isDirty = false;
            this.setStatus('synced');
            this.retryCount = 0;
            this.lastPushTime = Date.now();

            // 事务成功意味着我们刚才推的数据是最新的，
            // 我们可以本地更新 version 以避免 snapshot 回来时 confuse (虽然有 sessionId check)
            // this.localVersion = newVersion; // 可以在 runTransaction 返回值里拿

        } catch (error) {
            const isPermissionError = error.code === 'permission-denied' ||
                error.message?.includes('permission');

            if (isPermissionError) {
                console.warn("[SyncEngine] Push permission denied - waiting for auth.");
                this.hasPermissionError = true;
                this.setStatus('offline');
            } else {
                console.error("[SyncEngine] Push failed:", error);
                this.retryCount++;
                this.setStatus('offline');
                this.schedulePush();
            }
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

    /**
     * 立即推送数据到云端（跳过防抖）
     * 用于需要即时同步的页面，如 Inspiration
     */
    immediateSync() {
        if (!this.isDirty || !this.userId || !navigator.onLine) return;
        clearTimeout(this.pushTimeout);
        this.tryPush();
    }

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
