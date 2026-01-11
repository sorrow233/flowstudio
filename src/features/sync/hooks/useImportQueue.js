import { useEffect, useRef } from 'react';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * 处理待导入队列的 hook
 * 从 Firebase pending_imports 集合中读取待导入内容，创建 Inspiration 后删除
 * 
 * @param {string} userId - 当前登录用户 ID
 * @param {Function} addIdea - 添加 Inspiration 的函数
 * @param {number} ideasCount - 当前 ideas 数量（用于计算颜色）
 * @param {Function} getNextColorIndex - 获取下一个颜色索引的函数
 */
export const useImportQueue = (userId, addIdea, ideasCount, getNextColorIndex) => {
    const processedRef = useRef(false);

    useEffect(() => {
        console.debug('[ImportQueue] Checking queue for user:', userId);

        // 只处理一次，避免重复导入
        if (!userId || !addIdea || processedRef.current) {
            if (!userId) console.debug('[ImportQueue] Skipping: No userId provided');
            return;
        }

        const processQueue = async () => {
            try {
                const pendingRef = collection(db, `users/${userId}/pending_imports`);
                const q = query(pendingRef);
                const snapshot = await getDocs(q);

                if (snapshot.empty) return;

                console.log(`[ImportQueue] Found ${snapshot.size} pending imports`);

                let colorOffset = 0;
                const deletePromises = [];

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();

                    if (data.text) {
                        const newIdea = {
                            id: uuidv4(),
                            content: data.text,
                            timestamp: data.createdAt || Date.now(),
                            colorIndex: getNextColorIndex(ideasCount + colorOffset),
                            stage: 'inspiration',
                            source: data.source || 'external'
                        };

                        addIdea(newIdea);
                        colorOffset++;

                        console.log(`[ImportQueue] Created inspiration from ${data.source || 'external'}`);
                    }

                    // 标记为已处理，删除文档
                    deletePromises.push(
                        deleteDoc(doc(db, `users/${userId}/pending_imports`, docSnap.id))
                    );
                });

                // 等待所有删除完成
                await Promise.all(deletePromises);
                console.log(`[ImportQueue] Processed and cleaned ${snapshot.size} imports`);

            } catch (error) {
                // 权限错误时静默处理（用户可能未登录或安全规则未配置）
                if (error.code === 'permission-denied') {
                    console.debug('[ImportQueue] No pending imports or permission denied');
                } else {
                    console.error('[ImportQueue] Error processing queue:', error);
                }
            }
        };

        processedRef.current = true;
        processQueue();

    }, [userId, addIdea, ideasCount, getNextColorIndex]);
};
