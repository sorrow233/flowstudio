/**
 * KeyManager - 密钥管理服务
 * 
 * 负责：
 * 1. 登录时派生用户的 KEK（Key Encryption Key）
 * 2. 为每个 Room 获取或创建 DEK（Data Encryption Key）
 * 3. DEK 的包装存储和解包获取
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
    deriveKekFromUserId,
    generateDek,
    wrapKey,
    unwrapKey
} from './crypto';

class KeyManager {
    constructor() {
        // 用户的 KEK（内存缓存，不持久化）
        this.kek = null;
        this.userId = null;

        // DEK 缓存（roomId -> CryptoKey）
        this.dekCache = new Map();
    }

    /**
     * 初始化密钥管理器
     * 在用户登录后调用
     * 
     * @param {string} userId - Firebase 用户 UID
     */
    async initialize(userId) {
        if (!userId) {
            this.clear();
            return;
        }

        // 如果已经初始化过同一用户，跳过
        if (this.userId === userId && this.kek) {
            return;
        }

        console.info('[KeyManager] Initializing for user:', userId);
        this.userId = userId;
        this.dekCache.clear();

        // 派生 KEK
        this.kek = await deriveKekFromUserId(userId);
        console.info('[KeyManager] KEK derived successfully');
    }

    /**
     * 清除所有密钥（用户登出时调用）
     */
    clear() {
        console.info('[KeyManager] Clearing keys');
        this.kek = null;
        this.userId = null;
        this.dekCache.clear();
    }

    /**
     * 获取指定 Room 的 DEK
     * 如果不存在，则创建新的 DEK 并存储
     * 
     * @param {string} roomId - Room ID
     * @returns {Promise<CryptoKey>} - 数据加密密钥
     */
    async getKeyForRoom(roomId) {
        if (!this.kek || !this.userId) {
            throw new Error('[KeyManager] Not initialized. Call initialize() first.');
        }

        // 检查缓存
        if (this.dekCache.has(roomId)) {
            return this.dekCache.get(roomId);
        }

        // 尝试从 Firestore 获取
        const keyDocRef = doc(db, `users/${this.userId}/keys`, roomId);
        const keyDoc = await getDoc(keyDocRef);

        let dek;

        if (keyDoc.exists()) {
            // 解包已存在的 DEK
            const data = keyDoc.data();
            console.info(`[KeyManager] Unwrapping existing DEK for room: ${roomId}`);
            dek = await unwrapKey(data.wrappedKey, this.kek);
        } else {
            // 生成新的 DEK
            console.info(`[KeyManager] Generating new DEK for room: ${roomId}`);
            dek = await generateDek();

            // 包装并存储
            const wrappedKey = await wrapKey(dek, this.kek);
            await setDoc(keyDocRef, {
                wrappedKey,
                algorithm: 'AES-GCM',
                createdAt: serverTimestamp()
            });
            console.info(`[KeyManager] DEK stored for room: ${roomId}`);
        }

        // 缓存
        this.dekCache.set(roomId, dek);
        return dek;
    }

    /**
     * 检查是否已初始化
     */
    isInitialized() {
        return this.kek !== null && this.userId !== null;
    }
}

// 单例模式
export const keyManager = new KeyManager();
