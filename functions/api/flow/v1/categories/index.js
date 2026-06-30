import { handleApiError, jsonResponse, optionsResponse, readJsonBody } from '../../../_flowData/http.js';
import { loadFlowDocument, runFlowMutation } from '../../../_flowData/todoService.js';
import {
    addCategory,
    getAllowedCategoryColorPresets,
    listCategories,
} from '../../../_flowData/categoryDomain.js';

export async function onRequestGet({ request, env }) {
    try {
        const context = await loadFlowDocument(request, env);
        const categories = listCategories(context.yDoc);

        return jsonResponse({
            success: true,
            authMode: context.authMode,
            userId: context.userId,
            docId: context.docId,
            version: context.meta.version,
            colorPresets: getAllowedCategoryColorPresets(),
            categories,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to fetch categories.');
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await readJsonBody(request);
        const result = await runFlowMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => addCategory(yDoc, body),
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
        return handleApiError(error, 'Failed to create category.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
