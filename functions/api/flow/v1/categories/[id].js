import { handleApiError, jsonResponse, optionsResponse, readJsonBody } from '../../../_flowData/http.js';
import { runFlowMutation } from '../../../_flowData/todoService.js';
import { deleteCategory, updateCategory } from '../../../_flowData/categoryDomain.js';

function decodeRouteId(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return '';

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export async function onRequestPatch({ request, env, params }) {
    try {
        const id = decodeRouteId(params?.id);
        if (!id) {
            return jsonResponse({ success: false, error: 'Missing category ID.' }, 400);
        }

        const body = await readJsonBody(request);
        const updates = body.updates && typeof body.updates === 'object' ? body.updates : body;
        const result = await runFlowMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => updateCategory(yDoc, id, updates),
        });

        return jsonResponse({
            success: true,
            authMode: result.authMode,
            userId: result.userId,
            docId: result.docId,
            version: result.version,
            alreadyProcessed: result.alreadyProcessed,
            category: result.result,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to update category.');
    }
}

export async function onRequestDelete({ request, env, params }) {
    try {
        const id = decodeRouteId(params?.id);
        if (!id) {
            return jsonResponse({ success: false, error: 'Missing category ID.' }, 400);
        }

        const body = await readJsonBody(request);
        const result = await runFlowMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => deleteCategory(yDoc, id, {
                moveItemsTo: body.moveItemsTo,
            }),
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
        return handleApiError(error, 'Failed to delete category.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
