import {
    INLINE_STATE_MAX_LENGTH,
    STATE_ENCODING_CHUNKED,
    STATE_ENCODING_INLINE,
    getStateChunkDocId,
    splitStateIntoChunks,
    uint8ArrayToBase64,
} from '../../../src/features/sync/syncStateCodec.js';

const FIREBASE_PROJECT_ID = 'flow-7ffad';

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(url, init = {}, options = {}) {
    const {
        retries = 2,
        baseDelayMs = 250,
    } = options;

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(url, init);
            if (response.status < 500 && response.status !== 429) {
                return response;
            }

            if (attempt >= retries) {
                return response;
            }
        } catch (error) {
            lastError = error;
            if (attempt >= retries) {
                throw error;
            }
        }

        await sleep(baseDelayMs * (2 ** attempt));
    }

    throw lastError || new Error('Request failed');
}

export function parseFirestoreField(fieldValue) {
    if (!fieldValue || typeof fieldValue !== 'object') return undefined;

    if (Object.prototype.hasOwnProperty.call(fieldValue, 'stringValue')) return fieldValue.stringValue;
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'integerValue')) return Number(fieldValue.integerValue);
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'doubleValue')) return Number(fieldValue.doubleValue);
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'booleanValue')) return Boolean(fieldValue.booleanValue);
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'timestampValue')) return fieldValue.timestampValue;

    return undefined;
}

export function getFirestoreDocUrl(userId, roomId) {
    const encodedUserId = encodeURIComponent(userId);
    const encodedRoomId = encodeURIComponent(roomId);
    return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${encodedUserId}/rooms/${encodedRoomId}`;
}

function getFirestoreDocumentPath(userId, roomId) {
    return `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/rooms/${roomId}`;
}

export async function fetchFirestoreDoc({ token, userId, roomId }) {
    const response = await fetchWithRetry(getFirestoreDocUrl(userId, roomId), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 404) return null;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload?.error?.message || `Firestore request failed (${response.status}).`);
        error.status = response.status;
        error.code = payload?.error?.status || '';
        throw error;
    }

    return payload;
}

export function getStateMeta(stateDoc) {
    const fields = stateDoc?.fields || {};
    const encoding = parseFirestoreField(fields.stateEncoding) === STATE_ENCODING_CHUNKED
        ? STATE_ENCODING_CHUNKED
        : STATE_ENCODING_INLINE;

    return {
        encoding,
        chunkCount: Number(parseFirestoreField(fields.stateChunkCount)) || 0,
        version: Number(parseFirestoreField(fields.version)) || 0,
        updateTime: stateDoc?.updateTime || '',
    };
}

export async function loadBase64State({ token, userId, roomId, stateDoc }) {
    const fields = stateDoc?.fields || {};
    const meta = getStateMeta(stateDoc);

    if (meta.encoding !== STATE_ENCODING_CHUNKED) {
        return parseFirestoreField(fields.state) || '';
    }

    if (meta.chunkCount <= 0) {
        return '';
    }

    const chunkDocs = await Promise.all(
        Array.from({ length: meta.chunkCount }, (_, index) => {
            const chunkDocId = getStateChunkDocId(roomId, index);
            return fetchFirestoreDoc({ token, userId, roomId: chunkDocId });
        })
    );

    return chunkDocs.map((chunkDoc, index) => {
        if (!chunkDoc?.fields) {
            throw new Error(`Missing sync state chunk: ${index + 1}/${meta.chunkCount}`);
        }

        const value = parseFirestoreField(chunkDoc.fields.value);
        if (typeof value !== 'string') {
            throw new Error(`Invalid sync state chunk: ${index + 1}/${meta.chunkCount}`);
        }

        return value;
    }).join('');
}

function isPreconditionFailure(payload, responseStatus) {
    const code = payload?.error?.status || '';
    const message = payload?.error?.message || '';
    return (
        responseStatus === 409 ||
        responseStatus === 412 ||
        code === 'ABORTED' ||
        code === 'FAILED_PRECONDITION' ||
        /precondition|conflict|concurrent/i.test(message)
    );
}

export async function commitEncodedState({
    token,
    userId,
    roomId,
    encodedState,
    previousMeta,
    sessionId = 'flow-ai-api',
}) {
    const base64State = uint8ArrayToBase64(encodedState);
    const chunks = splitStateIntoChunks(base64State);
    const useChunkedState = base64State.length > INLINE_STATE_MAX_LENGTH || chunks.length > 1;
    const nextVersion = (previousMeta?.version || 0) + 1;
    const chunkCount = useChunkedState ? chunks.length : 0;
    const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;
    const docPath = getFirestoreDocumentPath(userId, roomId);

    const mainFields = {
        stateEncoding: { stringValue: useChunkedState ? STATE_ENCODING_CHUNKED : STATE_ENCODING_INLINE },
        stateChunkCount: { integerValue: String(chunkCount) },
        version: { integerValue: String(nextVersion) },
        updatedAt: { timestampValue: new Date().toISOString() },
        userId: { stringValue: userId },
        sessionId: { stringValue: sessionId },
    };

    if (!useChunkedState) {
        mainFields.state = { stringValue: base64State };
    }

    const mainWrite = {
        update: {
            name: docPath,
            fields: mainFields,
        },
        updateMask: {
            fieldPaths: ['state', 'stateEncoding', 'stateChunkCount', 'version', 'updatedAt', 'userId', 'sessionId'],
        },
    };

    if (previousMeta?.updateTime) {
        mainWrite.currentDocument = { updateTime: previousMeta.updateTime };
    } else {
        mainWrite.currentDocument = { exists: false };
    }

    const writes = [mainWrite];

    if (useChunkedState) {
        chunks.forEach((chunk, index) => {
            const chunkDocId = getStateChunkDocId(roomId, index);
            writes.push({
                update: {
                    name: getFirestoreDocumentPath(userId, chunkDocId),
                    fields: {
                        value: { stringValue: chunk },
                        index: { integerValue: String(index) },
                        version: { integerValue: String(nextVersion) },
                        updatedAt: { timestampValue: new Date().toISOString() },
                    },
                },
            });
        });
    }

    const previousChunkCount = previousMeta?.encoding === STATE_ENCODING_CHUNKED
        ? previousMeta.chunkCount
        : 0;

    if (previousChunkCount > chunkCount) {
        for (let index = chunkCount; index < previousChunkCount; index += 1) {
            writes.push({
                delete: getFirestoreDocumentPath(userId, getStateChunkDocId(roomId, index)),
            });
        }
    }

    const response = await fetchWithRetry(commitUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writes }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload?.error?.message || `Commit failed with status ${response.status}.`);
        error.status = isPreconditionFailure(payload, response.status) ? 409 : response.status;
        error.code = payload?.error?.status || '';
        throw error;
    }

    return {
        payload,
        version: nextVersion,
        stateEncoding: useChunkedState ? STATE_ENCODING_CHUNKED : STATE_ENCODING_INLINE,
        stateChunkCount: chunkCount,
    };
}
