import { runServiceMutation, validateTodoFields } from '../_flowData/todoService.js';
import { addTodoToDoc, modifyTodoInDoc, removeTodoFromDoc } from '../_flowData/yjsDocument.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json().catch(() => ({}));
        const { mutationId, operations } = body;
        
        if (!Array.isArray(operations)) {
            return buildJsonResponse({ error: 'Missing or invalid operations array.' }, 400);
        }
        
        const mutateFn = (yDoc) => {
            let createdCount = 0;
            let updatedCount = 0;
            let deletedCount = 0;
            let skippedCount = 0;
            
            operations.forEach((op, opIndex) => {
                try {
                    if (!op || typeof op !== 'object') {
                        skippedCount++;
                        return;
                    }
                    
                    const type = op.type;
                    
                    if (type === 'create') {
                        const content = op.content;
                        if (!content || typeof content !== 'string') {
                            skippedCount++;
                            return;
                        }
                        
                        addTodoToDoc(yDoc, {
                            id: op.id,
                            content: content,
                            category: op.category || 'todo',
                            subcategory: op.subcategory || null,
                            note: op.note || '',
                            colorIndex: typeof op.colorIndex === 'number' ? op.colorIndex : 0,
                            stage: op.stage || 'inspiration',
                            aiAssistClass: op.aiAssistClass || 'unclassified'
                        });
                        createdCount++;
                    } 
                    else if (type === 'update') {
                        const id = op.id;
                        const updates = op.updates;
                        if (!id || !updates || typeof updates !== 'object') {
                            skippedCount++;
                            return;
                        }
                        
                        const validatedUpdates = validateTodoFields(updates);
                        const updated = modifyTodoInDoc(yDoc, id, validatedUpdates);
                        if (updated) {
                            updatedCount++;
                        } else {
                            skippedCount++;
                        }
                    } 
                    else if (type === 'delete') {
                        const id = op.id;
                        if (!id) {
                            skippedCount++;
                            return;
                        }
                        
                        const deleted = removeTodoFromDoc(yDoc, id);
                        if (deleted) {
                            deletedCount++;
                        } else {
                            skippedCount++;
                        }
                    } 
                    else {
                        skippedCount++;
                    }
                } catch (err) {
                    console.error(`[Todos Batch] Error at operations index ${opIndex}:`, err);
                    skippedCount++;
                }
            });
            
            return {
                created: createdCount,
                updated: updatedCount,
                deleted: deletedCount,
                skipped: skippedCount
            };
        };
        
        const result = await runServiceMutation(request, env, mutationId, mutateFn);
        
        return buildJsonResponse({
            success: true,
            created: result.result?.created ?? 0,
            updated: result.result?.updated ?? 0,
            deleted: result.result?.deleted ?? 0,
            skipped: result.result?.skipped ?? 0,
            version: result.version,
            docId: result.docId,
            userId: result.userId,
            alreadyProcessed: result.alreadyProcessed
        });
        
    } catch (error) {
        const status = Number.isInteger(error?.status) ? error.status : 500;
        const message = error?.message || 'Failed to process batch operations.';
        return buildJsonResponse({ error: message }, status);
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}
