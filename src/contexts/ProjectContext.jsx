import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext();

export const STAGES = {
    INSPIRATION: 'inspiration', // Sensitive Words / Ideas
    PENDING: 'pending',         // Waiting for Development
    EARLY: 'early',             // In Progress - Early Stage
    GROWTH: 'growth',           // In Progress - Growth Stage
    ADVANCED: 'advanced',       // Next Level
    COMMERCIAL: 'commercial'    // Completed / Commercial
};

export const ProjectProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('flow_items');
        return saved ? JSON.parse(saved) : [
            // Initial Demo Data
            { id: 1, name: 'AI Storyteller', color: '#ffd1dc', stage: STAGES.INSPIRATION },
            { id: 2, name: 'Crypto Tracker', color: '#c1e1c1', stage: STAGES.INSPIRATION },
            { id: 3, name: 'Flow Studio Mobile', color: '#ffaaa5', stage: STAGES.PENDING },
            { id: 4, name: 'Database Optimization', color: '#a8e6cf', stage: STAGES.PENDING },
        ];
    });

    useEffect(() => {
        localStorage.setItem('flow_items', JSON.stringify(items));
    }, [items]);

    const addItem = (stage = STAGES.INSPIRATION) => {
        const newItem = {
            id: uuidv4(),
            name: '',
            link: '',
            goal: '',
            color: generatePastelColor(),
            stage: stage,
            createdAt: new Date().toISOString()
        };
        setItems(prev => [...prev, newItem]);
        return newItem.id;
    };

    const updateItem = (id, updates) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const deleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const validateForNextStage = (item, nextStage) => {
        // Validation Rule: Moving to Advanced or Commercial requires Name and Link
        if (nextStage === STAGES.ADVANCED || nextStage === STAGES.COMMERCIAL) {
            if (!item.name || !item.name.trim()) return { valid: false, message: 'Name is required to proceed.' };
            if (!item.link || !item.link.trim()) return { valid: false, message: 'Connection (Link) is required to proceed.' };
        }
        return { valid: true };
    };

    const moveItemNext = (id) => {
        setItems(prev => {
            return prev.map(item => {
                if (item.id !== id) return item;

                let nextStage = item.stage;
                switch (item.stage) {
                    case STAGES.INSPIRATION: nextStage = STAGES.PENDING; break;
                    case STAGES.PENDING: nextStage = STAGES.EARLY; break;
                    case STAGES.EARLY: nextStage = STAGES.GROWTH; break;
                    case STAGES.GROWTH: nextStage = STAGES.ADVANCED; break;
                    case STAGES.ADVANCED: nextStage = STAGES.COMMERCIAL; break;
                    default: return item;
                }

                const validation = validateForNextStage(item, nextStage);
                if (!validation.valid) {
                    // Logic to handle validation error handled by UI consumer usually, 
                    // but here we just return strict constraint.
                    // For now, we will throw or return early if called blindly.
                    // Ideally, UI checks this before calling, or we return status.
                    // Let's assume the UI handles the pre-check or we don't update if invalid.
                    console.warn(validation.message);
                    return item;
                }

                return { ...item, stage: nextStage };
            });
        });
    };

    // Explicit move for UI flexibility if needed, but strict flow prefers moveItemNext
    const moveItemToStage = (id, stage) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, stage: stage } : item
        ));
    };

    const generatePastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 85%)`;
    };

    return (
        <ProjectContext.Provider value={{ items, addItem, updateItem, deleteItem, moveItemNext, validateForNextStage, moveItemToStage }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
