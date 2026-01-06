import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const STAGES = {
    INSPIRATION: 'inspiration',
    PENDING: 'pending',
    EARLY: 'early',
    GROWTH: 'growth',
    ADVANCED: 'advanced',
    COMMERCIAL: 'commercial'
};

const SYNC_KEY = 'flow_items_v2'; // Bumped version for new schema
const LEGACY_SYNC_KEY = 'flow_items';

export const ProjectProvider = ({ children }) => {
    const { currentUser, isGuest } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Initial Load from LocalStorage for immediate UI
    useEffect(() => {
        const saved = localStorage.getItem(SYNC_KEY);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse local items", e);
            }
        } else {
            // Check legacy or provide demo data
            const legacy = localStorage.getItem(LEGACY_SYNC_KEY);
            if (legacy) {
                try {
                    const legacyData = JSON.parse(legacy).map(item => ({
                        ...item,
                        updatedAt: item.updatedAt || new Date().toISOString()
                    }));
                    setItems(legacyData);
                    localStorage.setItem(SYNC_KEY, JSON.stringify(legacyData));
                } catch (e) { console.error(e); }
            }
        }
        setLoading(false);
    }, []);

    // 2. Firestore Sync & Migration Logic
    useEffect(() => {
        if (!currentUser || isGuest) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const projectsColRef = collection(db, 'users', currentUser.uid, 'projects');

        let isSubscribed = true;

        const performSync = async () => {
            try {
                // A. Check for legacy array data in user doc
                const legacySnap = await getDoc(userDocRef);
                if (legacySnap.exists() && legacySnap.data().items) {
                    console.log("Migrating legacy array data to sub-collection...");
                    const legacyItems = legacySnap.data().items;
                    const batch = writeBatch(db);
                    legacyItems.forEach(item => {
                        const itmRef = doc(projectsColRef, item.id.toString());
                        batch.set(itmRef, {
                            ...item,
                            updatedAt: item.updatedAt || new Date().toISOString()
                        }, { merge: true });
                    });
                    batch.update(userDocRef, { items: null });
                    await batch.commit();
                }

                // B. Real-time Subscription to Projects Collection
                const unsubscribe = onSnapshot(projectsColRef, (snapshot) => {
                    if (!isSubscribed) return;

                    const cloudItems = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    }));

                    // C. Smart Merge with Local State (Newer version wins)
                    setItems(prev => {
                        const localMap = new Map(prev.map(i => [i.id.toString(), i]));
                        const cloudMap = new Map(cloudItems.map(i => [i.id.toString(), i]));

                        const mergedIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
                        const finalItems = Array.from(mergedIds).map(id => {
                            const local = localMap.get(id);
                            const cloud = cloudMap.get(id);

                            if (!local) return cloud;
                            if (!cloud) return local;

                            const localTime = new Date(local.updatedAt || 0).getTime();
                            const cloudTime = cloud.updatedAt instanceof Timestamp
                                ? cloud.updatedAt.toMillis()
                                : new Date(cloud.updatedAt || 0).getTime();

                            return localTime > cloudTime ? local : cloud;
                        });

                        const result = finalItems.sort((a, b) =>
                            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                        );

                        localStorage.setItem(SYNC_KEY, JSON.stringify(result));
                        return result;
                    });
                });

                return unsubscribe;
            } catch (err) {
                console.error("Critical Sync Error:", err);
            }
        };

        const unsubPromise = performSync();
        return () => {
            isSubscribed = false;
            unsubPromise.then(unsub => unsub && unsub());
        };
    }, [currentUser, isGuest]);

    // 3. Persistence Helper (Item-level)
    const persistItem = useCallback(async (item, isDeletion = false) => {
        const timestamp = new Date().toISOString();
        const updatedItem = { ...item, updatedAt: timestamp };

        setItems(prev => {
            let next;
            if (isDeletion) {
                next = prev.filter(i => i.id !== item.id);
            } else {
                const exists = prev.find(i => i.id === item.id);
                next = exists
                    ? prev.map(i => i.id === item.id ? updatedItem : i)
                    : [...prev, updatedItem];
            }
            localStorage.setItem(SYNC_KEY, JSON.stringify(next));
            return next;
        });

        if (currentUser && !isGuest) {
            try {
                const itemRef = doc(db, 'users', currentUser.uid, 'projects', item.id.toString());
                if (isDeletion) {
                    await deleteDoc(itemRef);
                } else {
                    await setDoc(itemRef, {
                        ...updatedItem,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Cloud Sync Failed", error);
            }
        }
    }, [currentUser, isGuest]);

    const addItem = async (stage = STAGES.INSPIRATION, formData = {}) => {
        const newItem = {
            id: uuidv4(),
            name: formData.name || '',
            link: formData.link || '',
            goal: formData.goal || '',
            priority: formData.priority || 'medium', // low, medium, high
            deadline: formData.deadline || null,
            color: generatePastelColor(),
            stage: stage,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await persistItem(newItem);
        return newItem.id;
    };

    const updateItem = async (id, updates) => {
        const item = items.find(i => i.id === id);
        if (item) await persistItem({ ...item, ...updates });
    };

    const deleteItem = async (id) => {
        const item = items.find(i => i.id === id);
        if (item) await persistItem(item, true);
    };

    const toggleArchive = async (id) => {
        const item = items.find(i => i.id === id);
        if (item) await persistItem({ ...item, archived: !item.archived });
    };

    const validateForNextStage = (item, nextStage) => {
        if (nextStage === STAGES.ADVANCED || nextStage === STAGES.COMMERCIAL) {
            if (!item.name || !item.name.trim()) return { valid: false, message: 'Name is required to proceed.' };
            if (!item.link || !item.link.trim()) return { valid: false, message: 'Connection (Link) is required to proceed.' };
        }
        return { valid: true };
    };

    const moveItemNext = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        let nextStage = item.stage;
        switch (item.stage) {
            case STAGES.INSPIRATION: nextStage = STAGES.PENDING; break;
            case STAGES.PENDING: nextStage = STAGES.EARLY; break;
            case STAGES.EARLY: nextStage = STAGES.GROWTH; break;
            case STAGES.GROWTH: nextStage = STAGES.ADVANCED; break;
            case STAGES.ADVANCED: nextStage = STAGES.COMMERCIAL; break;
            default: return;
        }

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) return;

        await persistItem({ ...item, stage: nextStage });
    };

    const moveItemToStage = async (id, newStage) => {
        const itemToMove = items.find(i => i.id === id);
        if (!itemToMove) return { success: false, message: 'Item not found' };

        const validation = validateForNextStage(itemToMove, newStage);
        if (!validation.valid) return { success: false, message: validation.message };

        await persistItem({ ...itemToMove, stage: newStage });
        return { success: true };
    };

    const generatePastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 85%)`;
    };

    return (
        <ProjectContext.Provider value={{
            items,
            loading,
            addItem,
            updateItem,
            deleteItem,
            moveItemNext,
            validateForNextStage,
            moveItemToStage,
            toggleArchive
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
