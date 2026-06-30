import * as Y from 'yjs';
import { base64ToUint8Array } from '../../../src/features/sync/syncStateCodec.js';

export function readAllProjects(base64State) {
    if (!base64State || typeof base64State !== 'string') {
        return [];
    }

    const yDoc = new Y.Doc();
    const update = base64ToUint8Array(base64State);

    if (update.byteLength === 0) {
        return [];
    }

    Y.applyUpdate(yDoc, update, 'remote');
    return yDoc.getArray('all_projects').toJSON();
}

export function restoreYjsDoc(base64State) {
    const yDoc = new Y.Doc();
    if (base64State && typeof base64State === 'string') {
        const update = base64ToUint8Array(base64State);
        if (update.byteLength > 0) {
            Y.applyUpdate(yDoc, update, 'remote');
        }
    }
    return yDoc;
}

export function checkAndRegisterMutation(yDoc, mutationId) {
    if (!mutationId) return false;
    
    const processedMutations = yDoc.getMap('processed_mutations');
    if (processedMutations.has(mutationId)) {
        return true;
    }
    
    processedMutations.set(mutationId, Date.now());
    
    const entries = Array.from(processedMutations.entries());
    if (entries.length > 100) {
        entries.sort((a, b) => a[1] - b[1]);
        const toDelete = entries.slice(0, entries.length - 100);
        toDelete.forEach(([key]) => {
            processedMutations.delete(key);
        });
    }
    
    return false;
}

export function addTodoToDoc(yDoc, todoData) {
    const array = yDoc.getArray('all_projects');
    const yMap = new Y.Map();
    
    const projectData = {
        id: todoData.id || crypto.randomUUID(),
        content: todoData.content || '',
        createdAt: todoData.createdAt || Date.now(),
        timestamp: todoData.timestamp || Date.now(),
        stage: todoData.stage || 'inspiration',
        category: todoData.category || 'todo',
        subcategory: todoData.subcategory || null,
        note: todoData.note || '',
        colorIndex: typeof todoData.colorIndex === 'number' ? todoData.colorIndex : 0,
        completed: todoData.completed === true,
        aiAssistClass: todoData.aiAssistClass || 'unclassified'
    };
    
    Object.entries(projectData).forEach(([key, value]) => {
        yMap.set(key, value);
    });
    
    yDoc.transact(() => {
        array.push([yMap]);
    });
    
    return projectData;
}

export function modifyTodoInDoc(yDoc, id, updates) {
    const array = yDoc.getArray('all_projects');
    let foundMap = null;
    
    for (let i = 0; i < array.length; i++) {
        const item = array.get(i);
        if (item instanceof Y.Map && item.get('id') === id) {
            foundMap = item;
            break;
        }
    }
    
    if (!foundMap) {
        return null;
    }
    
    yDoc.transact(() => {
        Object.entries(updates).forEach(([key, value]) => {
            foundMap.set(key, value);
        });
    });
    
    return foundMap.toJSON();
}

export function removeTodoFromDoc(yDoc, id) {
    const array = yDoc.getArray('all_projects');
    let foundIndex = -1;
    
    for (let i = 0; i < array.length; i++) {
        const item = array.get(i);
        if (item instanceof Y.Map && item.get('id') === id) {
            foundIndex = i;
            break;
        }
    }
    
    if (foundIndex === -1) {
        return false;
    }
    
    yDoc.transact(() => {
        array.delete(foundIndex, 1);
    });
    
    return true;
}
