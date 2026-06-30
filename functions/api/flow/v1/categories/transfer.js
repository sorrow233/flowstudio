import { handleApiError, jsonResponse, optionsResponse, readJsonBody } from '../../../_flowData/http.js';
import { runFlowMutation } from '../../../_flowData/todoService.js';
import { transferCategoryItems } from '../../../_flowData/categoryDomain.js';

export async function onRequestPost({ request, env }) {
    try {
        const body = await readJsonBody(request);
        const result = await runFlowMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => transferCategoryItems(yDoc, body),
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
        return handleApiError(error, 'Failed to transfer category items.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
