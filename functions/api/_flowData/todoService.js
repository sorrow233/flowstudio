import { authenticate } from './auth.js';
import { fetchFirestoreDoc, loadBase64State, commitStateChange } from './firestoreRest.js';
import { restoreYjsDoc, checkAndRegisterMutation } from './yjsDocument.js';
import { uint8ArrayToBase64, splitStateIntoChunks } from '../../../src/features/sync/syncStateCodec.js';
import * as Y from 'yjs';

export async function runServiceMutation(request, env, mutationId, mutateDocFn) {
    const authResult = await authenticate(request, env);
    const { userId, docId, firestoreToken } = authResult;
    
    const maxAttempts = 3;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        attempt++;
        try {
            const stateDoc = await fetchFirestoreDoc({ token: firestoreToken, userId, roomId: docId });
            
            if (!stateDoc) {
                const err = new Error(`Document ${docId} not found for user.`);
                err.status = 404;
                throw err;
            }
            
            const fields = stateDoc.fields || {};
            const previousVersion = Number(fields.version?.integerValue) || 0;
            const updateTime = stateDoc.updateTime;
            
            const previousMeta = {
                encoding: fields.stateEncoding?.stringValue || 'inline-base64',
                chunkCount: Number(fields.stateChunkCount?.integerValue) || 0
            };
            
            const base64State = await loadBase64State({
                token: firestoreToken,
                userId,
                roomId: docId,
                stateDoc
            });
            
            const yDoc = restoreYjsDoc(base64State);
            
            if (mutationId) {
                const alreadyProcessed = checkAndRegisterMutation(yDoc, mutationId);
                if (alreadyProcessed) {
                    return {
                        success: true,
                        version: previousVersion,
                        userId,
                        docId,
                        alreadyProcessed: true
                    };
                }
            }
            
            const mutationResult = await mutateDocFn(yDoc);
            
            const fullStateUpdate = Y.encodeStateAsUpdate(yDoc);
            const newBase64State = uint8ArrayToBase64(fullStateUpdate);
            const chunks = splitStateIntoChunks(newBase64State);
            const useChunkedState = newBase64State.length > 700000 || chunks.length > 1;
            
            const newVersion = previousVersion + 1;
            
            await commitStateChange({
                token: firestoreToken,
                userId,
                roomId: docId,
                newVersion,
                base64State: newBase64State,
                previousMeta,
                updateTime,
                chunks,
                useChunkedState,
                sessionId: 'api-mutation'
            });
            
            return {
                success: true,
                version: newVersion,
                userId,
                docId,
                alreadyProcessed: false,
                result: mutationResult
            };
            
        } catch (error) {
            const isConflict = error.status === 412 || error.status === 409 || 
                               error.message?.includes('precondition') || 
                               error.message?.includes('conflict');
            
            if (isConflict && attempt < maxAttempts) {
                console.warn(`[TodoService] Precondition conflict on attempt ${attempt}. Retrying in ${100 * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                continue;
            }
            
            throw error;
        }
    }
    
    const conflictErr = new Error('Failed to update due to concurrent modifications after retries.');
    conflictErr.status = 409;
    throw conflictErr;
}

export function validateTodoFields(fields) {
    const allowedFields = new Set([
        'content',
        'completed',
        'aiAssistClass',
        'category',
        'subcategory',
        'note',
        'colorIndex',
        'stage'
    ]);
    
    const validated = {};
    Object.entries(fields).forEach(([key, value]) => {
        if (allowedFields.has(key)) {
            validated[key] = value;
        }
    });
    
    if (validated.aiAssistClass !== undefined) {
        const allowedClasses = new Set(['unclassified', 'ai_done', 'ai_high', 'ai_mid', 'self']);
        if (!allowedClasses.has(validated.aiAssistClass)) {
            throw new Error(`Invalid aiAssistClass: ${validated.aiAssistClass}`);
        }
    }
    
    if (validated.colorIndex !== undefined) {
        const parsedColor = Number(validated.colorIndex);
        validated.colorIndex = Number.isInteger(parsedColor) ? Math.max(0, parsedColor) : 0;
    }
    
    if (validated.completed !== undefined) {
        validated.completed = validated.completed === true || validated.completed === 1 || validated.completed === 'true';
    }
    
    return validated;
}
