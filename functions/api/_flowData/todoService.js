import * as Y from 'yjs';
import { authenticateFlowDataRequest } from './auth.js';
import { commitEncodedState, fetchFirestoreDoc, getStateMeta, loadBase64State, sleep } from './firestoreRest.js';
import { httpError } from './http.js';
import {
    checkProcessedMutation,
    recordProcessedMutation,
    restoreYDoc,
} from './todoDomain.js';

function isConflictError(error) {
    return (
        error?.status === 409 ||
        error?.status === 412 ||
        error?.code === 'ABORTED' ||
        error?.code === 'FAILED_PRECONDITION' ||
        /precondition|conflict|concurrent/i.test(error?.message || '')
    );
}

export async function loadFlowDocument(request, env) {
    const auth = await authenticateFlowDataRequest(request, env);
    const stateDoc = await fetchFirestoreDoc({
        token: auth.firestoreToken,
        userId: auth.userId,
        roomId: auth.docId,
    });

    const base64State = stateDoc
        ? await loadBase64State({
            token: auth.firestoreToken,
            userId: auth.userId,
            roomId: auth.docId,
            stateDoc,
        })
        : '';

    return {
        ...auth,
        stateDoc,
        yDoc: restoreYDoc(base64State),
        meta: stateDoc ? getStateMeta(stateDoc) : {
            encoding: 'inline-base64',
            chunkCount: 0,
            version: 0,
            updateTime: '',
        },
    };
}

export async function runFlowMutation(request, env, options = {}) {
    const {
        mutationId = '',
        mutate,
        maxAttempts = 3,
    } = options;

    if (typeof mutate !== 'function') {
        throw httpError('Missing mutation handler.', 500, 'missing_mutation_handler');
    }

    let lastConflict = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const context = await loadFlowDocument(request, env);
            const processed = checkProcessedMutation(context.yDoc, mutationId);
            if (processed) {
                return {
                    success: true,
                    alreadyProcessed: true,
                    authMode: context.authMode,
                    userId: context.userId,
                    docId: context.docId,
                    version: context.meta.version,
                    result: processed.result || null,
                };
            }

            const mutationResult = await mutate(context.yDoc);
            recordProcessedMutation(context.yDoc, mutationId, mutationResult);

            const encodedState = Y.encodeStateAsUpdate(context.yDoc);
            const commitResult = await commitEncodedState({
                token: context.firestoreToken,
                userId: context.userId,
                roomId: context.docId,
                encodedState,
                previousMeta: context.meta,
            });

            return {
                success: true,
                alreadyProcessed: false,
                authMode: context.authMode,
                userId: context.userId,
                docId: context.docId,
                version: commitResult.version,
                result: mutationResult,
            };
        } catch (error) {
            if (isConflictError(error) && attempt < maxAttempts) {
                lastConflict = error;
                await sleep(120 * attempt);
                continue;
            }

            throw error;
        }
    }

    throw httpError(
        lastConflict?.message || 'Concurrent update conflict. Please retry.',
        409,
        'concurrent_update_conflict'
    );
}

export const loadTodoDocument = loadFlowDocument;
export const runTodoMutation = runFlowMutation;
