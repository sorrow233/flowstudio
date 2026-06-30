import { runServiceMutation, validateTodoFields } from '../_flowData/todoService.js';
import { modifyTodoInDoc, removeTodoFromDoc } from '../_flowData/yjsDocument.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-Refresh-Token',
};

function buildJsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}

export async function onRequestPatch(context) {
    const { request, env, params } = context;
    const id = params.id;
    
    if (!id) {
        return buildJsonResponse({ error: 'Missing todo ID in path.' }, 400);
    }
    
    try {
        const body = await request.json().catch(() => ({}));
        const { mutationId, updates } = body;
        
        if (!updates || typeof updates !== 'object') {
            return buildJsonResponse({ error: 'Missing or invalid updates object.' }, 400);
        }
        
        const validatedUpdates = validateTodoFields(updates);
        
        const mutateFn = (yDoc) => {
            const updatedTodo = modifyTodoInDoc(yDoc, id, validatedUpdates);
            if (!updatedTodo) {
                const err = new Error(`Todo with ID ${id} not found.`);
                err.status = 404;
                throw err;
            }
            return updatedTodo;
        };
        
        const result = await runServiceMutation(request, env, mutationId, mutateFn);
        
        return buildJsonResponse({
            success: true,
            version: result.version,
            docId: result.docId,
            userId: result.userId,
            alreadyProcessed: result.alreadyProcessed,
            todo: result.result
        });
        
    } catch (error) {
        const status = Number.isInteger(error?.status) ? error.status : 500;
        const message = error?.message || 'Failed to update todo item.';
        return buildJsonResponse({ error: message }, status);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;
    
    if (!id) {
        return buildJsonResponse({ error: 'Missing todo ID in path.' }, 400);
    }
    
    try {
        const body = await request.json().catch(() => ({}));
        const { mutationId } = body;
        
        const mutateFn = (yDoc) => {
            const deleted = removeTodoFromDoc(yDoc, id);
            if (!deleted) {
                const err = new Error(`Todo with ID ${id} not found.`);
                err.status = 404;
                throw err;
            }
            return deleted;
        };
        
        const result = await runServiceMutation(request, env, mutationId, mutateFn);
        
        return buildJsonResponse({
            success: true,
            version: result.version,
            docId: result.docId,
            userId: result.userId,
            alreadyProcessed: result.alreadyProcessed
        });
        
    } catch (error) {
        const status = Number.isInteger(error?.status) ? error.status : 500;
        const message = error?.message || 'Failed to delete todo item.';
        return buildJsonResponse({ error: message }, status);
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}
