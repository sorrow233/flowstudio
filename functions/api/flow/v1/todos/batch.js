import { handleApiError, httpError, jsonResponse, optionsResponse, readJsonBody } from '../../../_flowData/http.js';
import { runTodoMutation } from '../../../_flowData/todoService.js';
import { addTodo, deleteTodo, updateTodo } from '../../../_flowData/todoDomain.js';

const MAX_BATCH_OPERATIONS = 100;

function applyOperation(yDoc, operation, index) {
    if (!operation || typeof operation !== 'object' || Array.isArray(operation)) {
        return {
            index,
            success: false,
            type: 'unknown',
            error: 'Operation must be an object.',
        };
    }

    const type = String(operation.type || '').trim();

    try {
        if (type === 'create') {
            const todo = addTodo(yDoc, operation);
            return { index, success: true, type, id: todo.id, todo };
        }

        if (type === 'update') {
            const updates = operation.updates && typeof operation.updates === 'object'
                ? operation.updates
                : operation;
            const todo = updateTodo(yDoc, operation.id, updates);
            return { index, success: true, type, id: todo.id, todo };
        }

        if (type === 'delete') {
            const deletedTodo = deleteTodo(yDoc, operation.id);
            return { index, success: true, type, id: deletedTodo.id, deletedTodo };
        }

        return {
            index,
            success: false,
            type: type || 'unknown',
            error: 'Unsupported operation type.',
        };
    } catch (error) {
        return {
            index,
            success: false,
            type: type || 'unknown',
            id: operation.id || null,
            error: error?.message || 'Operation failed.',
            code: error?.code || '',
            status: Number.isInteger(error?.status) ? error.status : 400,
        };
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await readJsonBody(request);
        const operations = body.operations;

        if (!body.mutationId) {
            throw httpError('mutationId is required for batch requests.', 400, 'missing_mutation_id');
        }

        if (!Array.isArray(operations)) {
            throw httpError('operations must be an array.', 400, 'invalid_operations');
        }

        if (operations.length > MAX_BATCH_OPERATIONS) {
            throw httpError(`A batch can contain at most ${MAX_BATCH_OPERATIONS} operations.`, 400, 'batch_too_large');
        }

        const result = await runTodoMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => {
                const results = operations.map((operation, index) => applyOperation(yDoc, operation, index));
                const created = results.filter((item) => item.success && item.type === 'create').length;
                const updated = results.filter((item) => item.success && item.type === 'update').length;
                const deleted = results.filter((item) => item.success && item.type === 'delete').length;
                const failed = results.filter((item) => !item.success).length;

                return {
                    total: results.length,
                    created,
                    updated,
                    deleted,
                    failed,
                    results,
                };
            },
        });

        return jsonResponse({
            success: true,
            authMode: result.authMode,
            userId: result.userId,
            docId: result.docId,
            version: result.version,
            alreadyProcessed: result.alreadyProcessed,
            ...result.result,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to process batch operations.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
