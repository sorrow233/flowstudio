import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    limit,
    where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../auth/AuthContext';

// Global Map to store Y.Docs to prevent re-initialization
const docMap = new Map();

export const useSyncStore = (docId, initialData = {}) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('disconnected'); // disconnected, syncing, synced, offline
    const [syncedDoc, setSyncedDoc] = useState(null);
    const [sharedType, setSharedType] = useState(null);

    // Initialize Y.Doc and Providers
    useEffect(() => {
        if (!docId || !user) return;

        let doc = docMap.get(docId);
        if (!doc) {
            doc = new Y.Doc();
            docMap.set(docId, doc);
        }

        // 1. Local Persistence (IndexedDB)
        const localProvider = new IndexeddbPersistence(docId, doc);

        localProvider.on('synced', () => {
            console.log(`[Sync] ${docId} loaded from local DB`);
            // If empty, initialize with default data
            if (doc.getMap('data').keys().next().done && Object.keys(initialData).length > 0) {
                doc.transact(() => {
                    const map = doc.getMap('data');
                    Object.entries(initialData).forEach(([k, v]) => {
                        map.set(k, v);
                    });
                });
            }
        });

        // 2. Cloud Persistence (Firestore Custom Adapter)
        let unsubscribeFirestore = () => { };

        if (user) {
            setStatus('syncing');
            const updatesColl = collection(db, `sync_rooms/${docId}/updates`);

            // Listen for remote updates
            const q = query(updatesColl, orderBy('createdAt', 'asc')); // Simplification: Load all updates. optimizing later.
            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                doc.transact(() => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            // Apply update if it's not from local (optimization: checking origin/clientID usually better but here simple broadcast)
                            // In this simple model, we just apply everything. Yjs handles deduplication efficiently.
                            if (data.update) {
                                const update = Uint8Array.from(atob(data.update), c => c.charCodeAt(0));
                                Y.applyUpdate(doc, update, 'remote');
                            }
                        }
                    });
                }, 'remote');
                setStatus('synced');
            }, (error) => {
                console.error("Firestore Sync Error:", error);
                setStatus('offline');
            });

            // Push local updates
            const handleUpdate = (update, origin) => {
                if (origin !== 'remote') {
                    // Convert Uint8Array to Base64 for Firestore storage
                    const updateStr = btoa(String.fromCharCode.apply(null, update));
                    addDoc(updatesColl, {
                        update: updateStr,
                        createdAt: serverTimestamp(),
                        userId: user.uid
                    }).catch(err => {
                        console.error("Failed to push update", err);
                        setStatus('offline');
                    });
                }
            };

            doc.on('update', handleUpdate);

            // Cleanup
            return () => {
                doc.off('update', handleUpdate);
                unsubscribeFirestore();
                localProvider.destroy();
            };
        } else {
            setStatus('offline');
        }

        setSyncedDoc(doc);
        setSharedType(doc.getMap('data'));

    }, [docId, user]);

    // Helper to update data
    const update = useCallback((field, value) => {
        if (!syncedDoc) return;
        syncedDoc.transact(() => {
            syncedDoc.getMap('data').set(field, value);
        });
    }, [syncedDoc]);

    // Helper to get observer
    // Note: useSyncStore consumers should usually use useObserver equivalent or just manual Yjs observation.
    // For React, we often make a simplified "useYMap" hook.

    return { doc: syncedDoc, status, update };
};

// Hook to subscribe to Y.Map changes in React
export const useYMap = (doc) => {
    const [data, setData] = useState({});

    useEffect(() => {
        if (!doc) return;

        const map = doc.getMap('data');

        const handleChange = () => {
            setData(map.toJSON());
        };

        // Initial set
        handleChange();

        map.observeDeep(handleChange);

        return () => {
            map.unobserveDeep(handleChange);
        };
    }, [doc]);

    return data;
};
