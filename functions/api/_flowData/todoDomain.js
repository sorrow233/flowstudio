import * as Y from 'yjs';
import { base64ToUint8Array } from '../../../src/features/sync/syncStateCodec.js';
import { normalizeIdeaTextForExport } from '../../../src/features/lifecycle/components/inspiration/categoryTransferUtils.js';
import { httpError } from './http.js';

const TODO_AI_CLASSES = new Set(['unclassified', 'ai_done', 'ai_high', 'ai_mid', 'self']);
const TODO_MODES = new Set(['all', 'pending', 'unclassified', 'ai_done', 'ai_high', 'ai_mid', 'self']);
const MUTATION_LOG_MAP = 'flow_ai_processed_mutations';
const MAX_MUTATION_LOG_SIZE = 250;

export function getAllowedTodoModes() {
    return Array.from(TODO_MODES);
}

export function restoreYDoc(base64State) {
    const yDoc = new Y.Doc();

    if (!base64State || typeof base64State !== 'string') {
        return yDoc;
    }

    const update = base64ToUint8Array(base64State);
    if (update.byteLength > 0) {
        Y.applyUpdate(yDoc, update, 'remote');
    }

    return yDoc;
}

export function isCompleted(project = {}) {
    const value = project?.completed;
    return value === true || value === 1 || value === '1' || value === 'true';
}

function getYMapJson(value) {
    if (value instanceof Y.Map) return value.toJSON();
    if (value && typeof value === 'object') return value;
    return {};
}

export function isTodoProject(project = {}) {
    return (
        (project?.stage || 'inspiration') === 'inspiration' &&
        (project?.category || 'note') === 'todo'
    );
}

function getTodoArray(yDoc) {
    return yDoc.getArray('all_projects');
}

function findTodoMapById(yDoc, id) {
    const todoId = String(id || '').trim();
    if (!todoId) return null;

    const array = getTodoArray(yDoc);
    for (let index = 0; index < array.length; index += 1) {
        const item = array.get(index);
        const json = getYMapJson(item);
        if (json.id === todoId && isTodoProject(json) && item instanceof Y.Map) {
            return { item, index };
        }
    }

    return null;
}

export function listTodosFromDoc(yDoc, mode = 'pending') {
    if (!TODO_MODES.has(mode)) {
        throw httpError('Invalid mode.', 400, 'invalid_mode');
    }

    const projects = getTodoArray(yDoc).toArray().map(getYMapJson);
    return projects
        .filter(isTodoProject)
        .filter((project) => {
            if (mode === 'all') return true;
            if (mode === 'pending') return !isCompleted(project);
            return !isCompleted(project) && (project.aiAssistClass || 'unclassified') === mode;
        })
        .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
}

export function formatTodoItem(project, index) {
    const normalizedContent = normalizeIdeaTextForExport(project?.content || '');

    return {
        index,
        id: project?.id || null,
        content: project?.content || '',
        normalizedContent,
        timestamp: Number.isFinite(Number(project?.timestamp)) ? Number(project.timestamp) : null,
        createdAt: Number.isFinite(Number(project?.createdAt)) ? Number(project.createdAt) : null,
        aiAssistClass: project?.aiAssistClass || 'unclassified',
        category: 'todo',
        stage: 'inspiration',
        completed: isCompleted(project),
        subcategory: project?.subcategory || null,
        note: project?.note || '',
        colorIndex: typeof project?.colorIndex === 'number' ? project.colorIndex : 0,
    };
}

export function validateTodoCreateInput(input = {}) {
    const content = String(input.content || '').trim();
    if (!content) {
        throw httpError('Todo content is required.', 400, 'missing_content');
    }

    const aiAssistClass = input.aiAssistClass === undefined ? 'unclassified' : String(input.aiAssistClass);
    if (!TODO_AI_CLASSES.has(aiAssistClass)) {
        throw httpError(`Invalid aiAssistClass: ${aiAssistClass}.`, 400, 'invalid_ai_assist_class');
    }

    const colorIndex = input.colorIndex === undefined
        ? 0
        : Number(input.colorIndex);

    return {
        id: input.id ? String(input.id).trim() : crypto.randomUUID(),
        content,
        createdAt: Number.isFinite(Number(input.createdAt)) ? Number(input.createdAt) : Date.now(),
        timestamp: Number.isFinite(Number(input.timestamp)) ? Number(input.timestamp) : Date.now(),
        stage: 'inspiration',
        category: 'todo',
        subcategory: input.subcategory ? String(input.subcategory).trim() : null,
        note: input.note ? String(input.note) : '',
        colorIndex: Number.isInteger(colorIndex) ? Math.max(0, colorIndex) : 0,
        completed: input.completed === true || input.completed === 1 || input.completed === 'true',
        aiAssistClass,
    };
}

export function validateTodoUpdates(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw httpError('updates must be an object.', 400, 'invalid_updates');
    }

    const allowedFields = new Set([
        'content',
        'completed',
        'aiAssistClass',
        'subcategory',
        'note',
        'colorIndex',
    ]);

    const updates = {};
    Object.entries(input).forEach(([key, value]) => {
        if (!allowedFields.has(key)) return;

        if (key === 'content') {
            const content = String(value || '').trim();
            if (!content) {
                throw httpError('content cannot be empty.', 400, 'empty_content');
            }
            updates.content = content;
            return;
        }

        if (key === 'completed') {
            updates.completed = value === true || value === 1 || value === 'true';
            return;
        }

        if (key === 'aiAssistClass') {
            const aiAssistClass = String(value || 'unclassified');
            if (!TODO_AI_CLASSES.has(aiAssistClass)) {
                throw httpError(`Invalid aiAssistClass: ${aiAssistClass}.`, 400, 'invalid_ai_assist_class');
            }
            updates.aiAssistClass = aiAssistClass;
            return;
        }

        if (key === 'subcategory') {
            updates.subcategory = value ? String(value).trim() : null;
            return;
        }

        if (key === 'note') {
            updates.note = value ? String(value) : '';
            return;
        }

        if (key === 'colorIndex') {
            const colorIndex = Number(value);
            updates.colorIndex = Number.isInteger(colorIndex) ? Math.max(0, colorIndex) : 0;
        }
    });

    if (Object.keys(updates).length === 0) {
        throw httpError('No supported todo fields to update.', 400, 'empty_updates');
    }

    return updates;
}

export function addTodo(yDoc, input) {
    const todo = validateTodoCreateInput(input);
    const yMap = new Y.Map();

    Object.entries(todo).forEach(([key, value]) => {
        yMap.set(key, value);
    });

    yDoc.transact(() => {
        getTodoArray(yDoc).push([yMap]);
    }, 'flow-ai-api');

    return todo;
}

export function updateTodo(yDoc, id, updatesInput) {
    const match = findTodoMapById(yDoc, id);
    if (!match) {
        throw httpError(`Todo with ID ${id} was not found.`, 404, 'todo_not_found');
    }

    const updates = validateTodoUpdates(updatesInput);
    yDoc.transact(() => {
        Object.entries(updates).forEach(([key, value]) => {
            match.item.set(key, value);
        });
    }, 'flow-ai-api');

    return match.item.toJSON();
}

export function deleteTodo(yDoc, id) {
    const match = findTodoMapById(yDoc, id);
    if (!match) {
        throw httpError(`Todo with ID ${id} was not found.`, 404, 'todo_not_found');
    }

    const deleted = match.item.toJSON();
    yDoc.transact(() => {
        getTodoArray(yDoc).delete(match.index, 1);
    }, 'flow-ai-api');

    return deleted;
}

export function checkProcessedMutation(yDoc, mutationId) {
    const id = String(mutationId || '').trim();
    if (!id) return null;

    const mutationLog = yDoc.getMap(MUTATION_LOG_MAP);
    return mutationLog.get(id) || null;
}

export function recordProcessedMutation(yDoc, mutationId, result) {
    const id = String(mutationId || '').trim();
    if (!id) return;

    const mutationLog = yDoc.getMap(MUTATION_LOG_MAP);
    mutationLog.set(id, {
        at: Date.now(),
        result,
    });

    const entries = Array.from(mutationLog.entries());
    if (entries.length <= MAX_MUTATION_LOG_SIZE) return;

    entries
        .sort((a, b) => (Number(a[1]?.at) || 0) - (Number(b[1]?.at) || 0))
        .slice(0, entries.length - MAX_MUTATION_LOG_SIZE)
        .forEach(([key]) => mutationLog.delete(key));
}

export function buildNumberedText(items, cursor = 0) {
    return items
        .map((item, index) => `${cursor + index + 1}. ${item.normalizedContent || '（空）'}`)
        .join('\n');
}
