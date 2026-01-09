import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';

// --- CRDT Array Hook (for Projects) ---
export const useSyncedProjects = (doc, arrayName) => {
    const [projects, setProjects] = useState([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const undoManagerRef = useRef(null);

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        // Initialize UndoManager scoped to this specific array (and its children)
        const undoManager = new Y.UndoManager(yArray, {
            trackedOrigins: new Set([null, 'local']),
            ignoreRemoteOrigins: true
        });
        undoManagerRef.current = undoManager;

        const handleChange = () => {
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

    const addProject = useCallback((project) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);

        const yMap = new Y.Map();
        Object.entries(project).forEach(([key, value]) => {
            yMap.set(key, value);
        });

        yArray.insert(0, [yMap]);
    }, [doc, arrayName]);

    const removeProject = useCallback((id) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    yArray.delete(i, 1);
                    break;
                }
            }
        });
    }, [doc, arrayName]);

    const updateProject = useCallback((id, updates) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();

            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    if (item instanceof Y.Map) {
                        // Granular update on Y.Map
                        Object.entries(updates).forEach(([key, value]) => {
                            item.set(key, value);
                        });
                    } else {
                        // Fallback for non-Y.Map items
                        const updated = { ...item, ...updates };
                        yArray.delete(i, 1);
                        yArray.insert(i, [updated]);
                    }
                    break;
                }
            }
        });
    }, [doc, arrayName]);

    const undo = useCallback(() => {
        undoManagerRef.current?.undo();
    }, []);

    const redo = useCallback(() => {
        undoManagerRef.current?.redo();
    }, []);

    return { projects, addProject, removeProject, updateProject, undo, redo, canUndo, canRedo };
};
