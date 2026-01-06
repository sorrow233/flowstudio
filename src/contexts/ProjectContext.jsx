import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const STAGES = {
    INSPIRATION: 'inspiration', // Sensitive Words / Ideas
    PENDING: 'pending',         // Waiting for Development
    EARLY: 'early',             // In Progress - Early Stage
    GROWTH: 'growth',           // In Progress - Growth Stage
    ADVANCED: 'advanced',       // Next Level
    COMMERCIAL: 'commercial'    // Completed / Commercial
};

const SYNC_KEY = 'flow_items';

export const ProjectProvider = ({ children }) => {
    const { currentUser, isGuest } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load from LocalStorage for immediate UI
    useEffect(() => {
        const saved = localStorage.getItem(SYNC_KEY);
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    // Firestore Sync Logic
    useEffect(() => {
        if (!currentUser || isGuest) {
            // In guest mode, we just use local storage (already handled by state updates below)
            return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);

        // Real-time listener for user data
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const cloudData = docSnap.data().items || [];
                setItems(cloudData);
                // Also update local storage for offline fallback
                localStorage.setItem(SYNC_KEY, JSON.stringify(cloudData));
            } else {
                // If it's a new user, migrate guest data if it exists
                const saved = localStorage.getItem(SYNC_KEY);
                const guestData = saved ? JSON.parse(saved) : [];
                if (guestData.length > 0) {
                    setDoc(userDocRef, { items: guestData }, { merge: true });
                }
            }
        }, (error) => {
            console.error("Firestore Sync Error:", error);
        });

        return () => unsubscribe();
    }, [currentUser, isGuest]);

    // Persistence Helper
    const persistItems = useCallback(async (newItems) => {
        setItems(newItems);
        localStorage.setItem(SYNC_KEY, JSON.stringify(newItems));

        if (currentUser && !isGuest) {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, { items: newItems }, { merge: true });
            } catch (error) {
                console.error("Failed to sync to Firestore:", error);
            }
        }
    }, [currentUser, isGuest]);

    const addItem = async (stage = STAGES.INSPIRATION, formData = {}) => {
        const newItem = {
            id: uuidv4(),
            name: formData.name || '',
            link: formData.link || '',
            goal: formData.goal || '',
            color: generatePastelColor(),
            stage: stage,
            archived: false,
            createdAt: new Date().toISOString()
        };
        const newItems = [...items, newItem];
        await persistItems(newItems);
        return newItem.id;
    };

    const updateItem = async (id, updates) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        await persistItems(newItems);
    };

    const deleteItem = async (id) => {
        const newItems = items.filter(item => item.id !== id);
        await persistItems(newItems);
    };

    const toggleArchive = async (id) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, archived: !item.archived } : item
        );
        await persistItems(newItems);
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
        if (!validation.valid) {
            console.warn(validation.message);
            return;
        }

        const newItems = items.map(i => i.id === id ? { ...i, stage: nextStage } : i);
        await persistItems(newItems);
    };

    const moveItemToStage = async (id, newStage) => {
        const itemToMove = items.find(i => i.id === id);
        if (!itemToMove) return { success: false, message: 'Item not found' };

        const validation = validateForNextStage(itemToMove, newStage);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const newItems = items.map(item =>
            item.id === id ? { ...item, stage: newStage } : item
        );
        await persistItems(newItems);

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
