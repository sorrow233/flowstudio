import { handleApiError, jsonResponse, optionsResponse, readJsonBody } from '../../../_flowData/http.js';
import { runTodoMutation } from '../../../_flowData/todoService.js';
import { deleteTodo, updateTodo } from '../../../_flowData/todoDomain.js';

export async function onRequestPatch({ request, env, params }) {
    try {
        const id = String(params?.id || '').trim();
        if (!id) {
            return jsonResponse({ success: false, error: 'Missing todo ID.' }, 400);
        }

        const body = await readJsonBody(request);
        const updates = body.updates && typeof body.updates === 'object' ? body.updates : body;
        const result = await runTodoMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => updateTodo(yDoc, id, updates),
        });

        return jsonResponse({
            success: true,
            authMode: result.authMode,
            userId: result.userId,
            docId: result.docId,
            version: result.version,
            alreadyProcessed: result.alreadyProcessed,
            todo: result.result,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to update todo item.');
    }
}

export async function onRequestDelete({ request, env, params }) {
    try {
        const id = String(params?.id || '').trim();
        if (!id) {
            return jsonResponse({ success: false, error: 'Missing todo ID.' }, 400);
        }

        const body = await readJsonBody(request);
        const result = await runTodoMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => deleteTodo(yDoc, id),
        });

        return jsonResponse({
            success: true,
            authMode: result.authMode,
            userId: result.userId,
            docId: result.docId,
            version: result.version,
            alreadyProcessed: result.alreadyProcessed,
            deletedTodo: result.result,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to delete todo item.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
