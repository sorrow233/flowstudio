import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    limit,
    startAfter,
    where,
    updateDoc,
    increment,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'shared_commands';

/**
 * Share Service - 网络分享模块核心服务
 * 
 * 提供命令配置的发布、浏览、导入功能
 */
export const shareService = {
    /**
     * 发布命令到公共分享库
     * @param {Object} command - 要分享的命令对象
     * @param {Object} author - 作者信息 { uid, displayName, photoURL }
     * @param {string} description - 分享描述
     * @returns {Promise<string>} 分享 ID
     */
    async publish(command, author, description = '') {
        if (!author?.uid) {
            throw new Error('必须登录才能分享');
        }

        const shareId = uuidv4();
        const shareData = {
            id: shareId,
            command: {
                title: command.title,
                content: command.content || '',
                url: command.url || '',
                type: command.type || 'utility',
                category: command.category || 'general',
                tags: command.tags || [],
            },
            author: {
                uid: author.uid,
                displayName: author.displayName || 'Anonymous',
                photoURL: author.photoURL || null,
            },
            description: description.trim(),
            downloads: 0,
            createdAt: serverTimestamp(),
        };

        const docRef = doc(db, COLLECTION_NAME, shareId);
        await setDoc(docRef, shareData);

        return shareId;
    },

    /**
     * 获取公共分享列表（分页）
     * @param {Object} options - 分页选项
     * @param {number} options.pageSize - 每页数量（默认 20）
     * @param {DocumentSnapshot} options.lastDoc - 上一页最后文档（用于分页）
     * @param {string} options.category - 分类过滤（可选）
     * @returns {Promise<{ shares: Array, lastDoc: DocumentSnapshot, hasMore: boolean }>}
     */
    async getPublicShares(options = {}) {
        const { pageSize = 20, lastDoc = null, category = null } = options;

        let q = query(
            collection(db, COLLECTION_NAME),
            orderBy('createdAt', 'desc'),
            limit(pageSize + 1) // 多取一个判断是否有更多
        );

        if (category && category !== 'all') {
            q = query(
                collection(db, COLLECTION_NAME),
                where('command.category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(pageSize + 1)
            );
        }

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const shares = docs.slice(0, pageSize).map(doc => ({
            ...doc.data(),
            _docRef: doc, // 用于分页
        }));

        return {
            shares,
            lastDoc: shares.length > 0 ? docs[shares.length - 1] : null,
            hasMore,
        };
    },

    /**
     * 通过 ID 获取分享详情
     * @param {string} shareId - 分享 ID
     * @returns {Promise<Object|null>}
     */
    async getShareById(shareId) {
        const docRef = doc(db, COLLECTION_NAME, shareId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.data();
    },

    /**
     * 增加下载计数
     * @param {string} shareId - 分享 ID
     */
    async incrementDownloads(shareId) {
        const docRef = doc(db, COLLECTION_NAME, shareId);
        await updateDoc(docRef, {
            downloads: increment(1),
        });
    },

    /**
     * 删除自己的分享
     * @param {string} shareId - 分享 ID
     * @param {string} userId - 当前用户 ID
     */
    async unpublish(shareId, userId) {
        const share = await this.getShareById(shareId);

        if (!share) {
            throw new Error('分享不存在');
        }

        if (share.author.uid !== userId) {
            throw new Error('无权删除他人的分享');
        }

        const docRef = doc(db, COLLECTION_NAME, shareId);
        await deleteDoc(docRef);
    },

    /**
     * 获取用户自己发布的分享列表
     * @param {string} userId - 用户 ID
     * @returns {Promise<Array>}
     */
    async getMyShares(userId) {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('author.uid', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    },
};

export default shareService;
