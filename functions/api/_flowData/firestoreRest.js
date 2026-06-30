import { getStateChunkDocId } from '../../../src/features/sync/syncStateCodec.js';

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

        const waitMs = baseDelayMs * (2 ** attempt);
        await sleep(waitMs);
    }

    throw lastError || new Error('Request failed');
}

export function parseFirestoreField(fieldValue) {
    if (!fieldValue || typeof fieldValue !== 'object') return undefined;

    if (Object.prototype.hasOwnProperty.call(fieldValue, 'stringValue')) return fieldValue.stringValue;
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'integerValue')) return Number(fieldValue.integerValue);
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'doubleValue')) return Number(fieldValue.doubleValue);
    if (Object.prototype.hasOwnProperty.call(fieldValue, 'booleanValue')) return Boolean(fieldValue.booleanValue);

    return undefined;
}

export function getFirestoreDocUrl(userId, roomId) {
    const encodedUserId = encodeURIComponent(userId);
    const encodedRoomId = encodeURIComponent(roomId);
    return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${encodedUserId}/rooms/${encodedRoomId}`;
}

export async function fetchFirestoreDoc({ token, userId, roomId }) {
    const url = getFirestoreDocUrl(userId, roomId);
    const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 404) {
        return null;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage = payload?.error?.message || `Firestore request failed (${response.status})`;
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    return payload;
}

export async function loadBase64State({ token, userId, roomId, stateDoc }) {
    const fields = stateDoc?.fields || {};
    const stateEncoding = parseFirestoreField(fields.stateEncoding) || 'inline-base64';
    const stateChunkCount = Number(parseFirestoreField(fields.stateChunkCount)) || 0;

    if (stateEncoding !== 'chunked-base64') {
        return parseFirestoreField(fields.state) || '';
    }

    if (stateChunkCount <= 0) {
        return '';
    }

    const chunkDocs = await Promise.all(
        Array.from({ length: stateChunkCount }, (_, index) => {
            const chunkDocId = getStateChunkDocId(roomId, index);
            return fetchFirestoreDoc({ token, userId, roomId: chunkDocId });
        })
    );

    const chunks = chunkDocs.map((chunkDoc, index) => {
        if (!chunkDoc?.fields) {
            throw new Error(`Missing sync state chunk: ${index + 1}/${stateChunkCount}`);
        }

        const value = parseFirestoreField(chunkDoc.fields.value);
        if (typeof value !== 'string') {
            throw new Error(`Invalid sync state chunk: ${index + 1}/${stateChunkCount}`);
        }

        return value;
    });

    return chunks.join('');
}

/**
 * Commits a batch write to Firestore (Optimistic Concurrency Control)
 */
export async function commitStateChange({
    token,
    userId,
    roomId,
    newVersion,
    base64State,
    previousMeta,
    updateTime,
    chunks,
    useChunkedState,
    sessionId = 'api-session'
}) {
    const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;
    const docPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/rooms/${roomId}`;
    
    const writes = [];
    
    // 1. Prepare main document fields
    const mainFields = {
        stateEncoding: { stringValue: useChunkedState ? 'chunked-base64' : 'inline-base64' },
        stateChunkCount: { integerValue: (useChunkedState ? chunks.length : 0).toString() },
        version: { integerValue: newVersion.toString() },
        updatedAt: { stringValue: new Date().toISOString() },
        userId: { stringValue: userId },
        sessionId: { stringValue: sessionId }
    };
    
    if (!useChunkedState) {
        mainFields.state = { stringValue: base64State };
    }
    
    const fieldPaths = ['stateEncoding', 'stateChunkCount', 'version', 'updatedAt', 'userId', 'sessionId', 'state'];
    
    const mainWrite = {
        update: {
            name: docPath,
            fields: mainFields
        },
        updateMask: {
            fieldPaths
        }
    };
    
    if (updateTime) {
        mainWrite.currentDocument = {
            updateTime: updateTime
        };
    } else {
        mainWrite.currentDocument = {
            exists: true
        };
    }
    
    writes.push(mainWrite);
    
    // 2. Prepare chunk writes
    if (useChunkedState) {
        chunks.forEach((chunk, index) => {
            const chunkDocId = getStateChunkDocId(roomId, index);
            const chunkDocPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/rooms/${chunkDocId}`;
            writes.push({
                update: {
                    name: chunkDocPath,
                    fields: {
                        value: { stringValue: chunk },
                        index: { integerValue: index.toString() },
                        version: { integerValue: newVersion.toString() },
                        updatedAt: { stringValue: new Date().toISOString() }
                    }
                }
            });
        });
    }
    
    // 3. Prepare chunk deletes (for obsolete chunks)
    const previousChunkCount = previousMeta?.chunkCount || 0;
    const currentChunkCount = useChunkedState ? chunks.length : 0;
    
    if (previousChunkCount > currentChunkCount) {
        for (let index = currentChunkCount; index < previousChunkCount; index++) {
            const chunkDocId = getStateChunkDocId(roomId, index);
            const chunkDocPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/rooms/${chunkDocId}`;
            writes.push({
                delete: chunkDocPath
            });
        }
    }
    
    // 4. Fire commit request
    const response = await fetchWithRetry(commitUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ writes })
    });
    
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorMsg = payload?.error?.message || `Commit failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        throw error;
    }
    
    return payload;
}
