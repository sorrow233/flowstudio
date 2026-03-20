import { useEffect, useRef } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * 处理待导入队列的 hook
 * 从 Firebase pending_imports 集合中读取待导入内容，创建 Inspiration 后删除
 * 
 * @param {string} userId - 当前登录用户 ID
 * @param {Function} addIdeasBatch - 批量添加 Inspiration 的函数
 * @param {Array} ideas - 当前 ideas 列表（用于计算颜色和去重）
 * @param {Function} getNextColorIndex - 获取下一个颜色索引的函数
 * @param {boolean} isReady - 同步引擎是否就绪
 */
const normalizeImportTimestamp = (createdAt) => {
    const numeric = Number(createdAt);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : Date.now();
};

const buildImportedIdea = (docId, data, colorIndex) => ({
    id: uuidv4(),
    content: data.text,
    timestamp: normalizeImportTimestamp(data.createdAt),
    colorIndex,
    stage: 'inspiration',
    source: data.source || 'external',
    importQueueId: docId,
    tags: data.source === 'nexmap' ? ['NexMap'] : ['API'],
});

export const useImportQueue = (userId, addIdeasBatch, ideas, getNextColorIndex, isReady) => {
    const ideasRef = useRef(ideas);
    const addIdeasBatchRef = useRef(addIdeasBatch);
    const latestSnapshotRef = useRef(null);
    const listenerEpochRef = useRef(0);
    const processingIdsRef = useRef(new Set());
    const isProcessingRef = useRef(false);
    const pendingReplayRef = useRef(false);
    const estimatedIdeasCountRef = useRef(Array.isArray(ideas) ? ideas.length : 0);

    useEffect(() => {
        ideasRef.current = ideas;
        const actualCount = Array.isArray(ideas) ? ideas.length : 0;
        estimatedIdeasCountRef.current = Math.max(estimatedIdeasCountRef.current, actualCount);
    }, [ideas]);

    useEffect(() => {
        addIdeasBatchRef.current = addIdeasBatch;
    }, [addIdeasBatch]);

    useEffect(() => {
        if (!userId || !addIdeasBatch || !isReady) {
            listenerEpochRef.current += 1;
            latestSnapshotRef.current = null;
            processingIdsRef.current.clear();
            isProcessingRef.current = false;
            pendingReplayRef.current = false;
            estimatedIdeasCountRef.current = Array.isArray(ideasRef.current) ? ideasRef.current.length : 0;
            return undefined;
        }

        listenerEpochRef.current += 1;
        const currentEpoch = listenerEpochRef.current;
        let disposed = false;
        const isStale = () => disposed || listenerEpochRef.current !== currentEpoch;

        const processSnapshot = async (snapshot) => {
            if (isStale()) {
                return;
            }

            latestSnapshotRef.current = snapshot;

            if (isProcessingRef.current) {
                pendingReplayRef.current = true;
                return;
            }

            const existingImportIds = new Set(
                (ideasRef.current || [])
                    .map((idea) => idea?.importQueueId)
                    .filter(Boolean)
            );

            const pendingDocs = snapshot.docs.filter((docSnap) => {
                if (!docSnap.exists()) return false;
                if (processingIdsRef.current.has(docSnap.id)) return false;
                if (existingImportIds.has(docSnap.id)) return false;
                return Boolean(docSnap.data()?.text);
            });

            if (pendingDocs.length === 0) {
                return;
            }

            isProcessingRef.current = true;
            pendingReplayRef.current = false;

            const processingIds = pendingDocs.map((docSnap) => docSnap.id);
            processingIds.forEach((id) => processingIdsRef.current.add(id));

            try {
                const baseCount = estimatedIdeasCountRef.current;
                const newIdeas = pendingDocs.map((docSnap, index) => (
                    buildImportedIdea(docSnap.id, docSnap.data(), getNextColorIndex(baseCount + index))
                ));

                if (!isStale() && newIdeas.length > 0) {
                    addIdeasBatchRef.current?.(newIdeas);
                    ideasRef.current = [...newIdeas, ...(ideasRef.current || [])];
                    estimatedIdeasCountRef.current = baseCount + newIdeas.length;
                    console.info(`[ImportQueue] Imported ${newIdeas.length} pending item(s).`);
                }

                if (!isStale()) {
                    await Promise.all(
                        processingIds.map((id) => deleteDoc(doc(db, `users/${userId}/pending_imports`, id)))
                    );
                }

                console.info(`[ImportQueue] Cleaned ${processingIds.length} processed import(s).`);
            } catch (error) {
                if (error.code === 'permission-denied') {
                    console.debug('[ImportQueue] No pending imports or permission denied');
                } else {
                    console.error('[ImportQueue] Error processing queue:', error);
                }
            } finally {
                processingIds.forEach((id) => processingIdsRef.current.delete(id));
                isProcessingRef.current = false;

                if (!isStale() && pendingReplayRef.current && latestSnapshotRef.current) {
                    pendingReplayRef.current = false;
                    void processSnapshot(latestSnapshotRef.current);
                }
            }
        };

        const pendingRef = collection(db, `users/${userId}/pending_imports`);
        const q = query(pendingRef);
        console.info(`[ImportQueue] Listening for pending imports for user ${userId}`);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            void processSnapshot(snapshot);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.debug('[ImportQueue] No pending imports or permission denied');
                return;
            }

            console.error('[ImportQueue] Failed to subscribe to import queue:', error);
        });

        return () => {
            disposed = true;
            listenerEpochRef.current += 1;
            unsubscribe();
            latestSnapshotRef.current = null;
            processingIdsRef.current.clear();
            isProcessingRef.current = false;
            pendingReplayRef.current = false;
        };
    }, [userId, addIdeasBatch, getNextColorIndex, isReady]);
};
