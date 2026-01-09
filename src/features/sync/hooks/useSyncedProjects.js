import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';

// --- CRDT Array Hook (for Projects) ---
export const useSyncedProjects = (doc, arrayName) => {
    const [projects, setProjects] = useState([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const undoManagerDisplayRef = useRef(null); // Keep a ref to the UndoManager

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        // Initialize UndoManager scoped to this specific array (and its children)
        const undoManager = new Y.UndoManager(yArray, {
            trackedOrigins: new Set([null, 'local']), // Track local changes (null origin or explicit 'local')
            ignoreRemoteOrigins: true // Don't undo other people's changes by default (optional, but usually good for UX)
        });
        undoManagerDisplayRef.current = undoManager;

        const handleChange = () => {
            // Use toJSON() to ensure we get POJOs (Plain Old JavaScript Objects)
            setProjects(yArray.toJSON());
        };

        const handleStackChange = () => {
            setCanUndo(undoManager.undoStack.length > 0);
            setCanRedo(undoManager.redoStack.length > 0);
        };

        handleChange();
        yArray.observeDeep(handleChange);
        undoManager.on('stack-item-added', handleStackChange);
        undoManager.on('stack-item-popped', handleStackChange);

        return () => {
            yArray.unobserveDeep(handleChange);
            undoManager.off('stack-item-added', handleStackChange);
            undoManager.off('stack-item-popped', handleStackChange);
            undoManager.destroy();
        };
    }, [doc, arrayName]);

    const addProject = (project) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);

        // Convert plain object to Y.Map for granular tracking
        const yMap = new Y.Map();
        Object.entries(project).forEach(([key, value]) => {
            yMap.set(key, value);
        });

        yArray.insert(0, [yMap]);
    };

    const removeProject = (id) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            let index = -1;
            const arr = yArray.toArray();
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                yArray.delete(index, 1);
            }
        });
    };

    const updateProject = (id, updates) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();
            let targetMap = null;

            // Find the Y.Map
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    targetMap = item;
                    break;
                }
            }

            if (targetMap && targetMap instanceof Y.Map) {
                // Granular update on the Y.Map
                Object.entries(updates).forEach(([key, value]) => {
                    targetMap.set(key, value);
                });
            } else if (targetMap) {
                // Fallback for non-Y.Map items
                const index = arr.indexOf(targetMap);
                const updated = { ...targetMap, ...updates };
                yArray.delete(index, 1);
                yArray.insert(index, [updated]);
            }
        });
    };

    const undo = useCallback(() => {
        undoManagerDisplayRef.current?.undo();
    }, []);

    const redo = useCallback(() => {
        undoManagerDisplayRef.current?.redo();
    }, []);

    return { projects, addProject, removeProject, updateProject, undo, redo, canUndo, canRedo };
};
