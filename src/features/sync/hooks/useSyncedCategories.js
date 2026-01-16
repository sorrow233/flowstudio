import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { INSPIRATION_CATEGORIES } from '../../../utils/constants';

export const useSyncedCategories = (doc, arrayName = 'inspiration_categories') => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!doc) return;

        const yArray = doc.getArray(arrayName);

        const handleChange = () => {
            setCategories(yArray.toJSON());
        };

        // Initialize Defaults if Empty
        if (yArray.length === 0) {
            doc.transact(() => {
                if (yArray.length === 0) {
                    INSPIRATION_CATEGORIES.forEach(cat => {
                        const yMap = new Y.Map();
                        Object.entries(cat).forEach(([key, value]) => yMap.set(key, value));
                        yArray.push([yMap]);
                    });
                }
            });
        }

        handleChange();
        yArray.observeDeep(handleChange);

        return () => {
            yArray.unobserveDeep(handleChange);
        };
    }, [doc, arrayName]);

    const addCategory = useCallback((category) => {
        if (!doc) return;
        const yArray = doc.getArray(arrayName);

        // Validation: prevent duplicate IDs
        if (category.id) {
            const exists = yArray.toJSON().some(c => c.id === category.id);
            if (exists) return;
        }

        const yMap = new Y.Map();
        const newCat = {
            id: category.id || uuidv4(),
            label: category.label || 'New Category',
            color: category.color || 'bg-gray-400',
            dotColor: category.dotColor || 'bg-gray-400',
            textColor: category.textColor || 'text-gray-400',
            ...category
        };
        Object.entries(newCat).forEach(([k, v]) => yMap.set(k, v));
        yArray.push([yMap]);
    }, [doc, arrayName]);

    const updateCategory = useCallback((id, updates) => {
        if (!doc) return;
        doc.transact(() => {
            const yArray = doc.getArray(arrayName);
            const arr = yArray.toArray();
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                const itemId = item instanceof Y.Map ? item.get('id') : item.id;
                if (itemId === id) {
                    if (item instanceof Y.Map) {
                        Object.entries(updates).forEach(([k, v]) => item.set(k, v));
                    }
                    break;
                }
            }
        });
    }, [doc, arrayName]);

    const removeCategory = useCallback((id) => {
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

    return { categories, addCategory, updateCategory, removeCategory };
};
