import { fetchWithRetry } from './firestoreRest.js';
import { httpError, normalizeDocId } from './http.js';

const FIREBASE_WEB_API_KEY = 'AIzaSyA20FrNmdIPE2Sb9r97s7cj2w6MLYgcB_M';
const DEFAULT_DOC_ID = 'flowstudio_v1';

function decodeBase64Url(value = '') {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(normalized + padding);
}

function getBearerToken(request) {
    const authHeader = request.headers.get('Authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : '';
}

function getFirebaseRefreshToken(request) {
    return (request.headers.get('X-Firebase-Refresh-Token') || '').trim();
}

function getFlowAiKey(request) {
    return (request.headers.get('X-Flow-AI-Key') || '').trim();
}

function getUidFromFirebaseIdToken(idToken) {
    if (!idToken) return null;

    const parts = idToken.split('.');
    if (parts.length < 2) return null;

    try {
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        return payload.user_id || payload.sub || null;
    } catch {
        return null;
    }
}

async function exchangeRefreshTokenForIdToken(refreshToken, apiKey) {
    const tokenApiUrl = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`;
    const response = await fetchWithRetry(tokenApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }).toString(),
    }, {
        retries: 3,
        baseDelayMs: 350,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.id_token) {
        const reason = payload?.error?.message || payload?.error?.errors?.[0]?.message || 'Refresh token exchange failed.';
        throw httpError(reason, response.status === 400 ? 401 : response.status, 'refresh_token_exchange_failed');
    }

    return {
        idToken: payload.id_token,
        userId: payload.user_id || getUidFromFirebaseIdToken(payload.id_token),
        expiresIn: Number(payload.expires_in) || null,
    };
}

export async function authenticateFlowDataRequest(request, env) {
    const url = new URL(request.url);
    const docId = normalizeDocId(
        request.headers.get('X-Flow-Doc-Id') || url.searchParams.get('docId'),
        env?.FLOW_AI_DOC_ID || DEFAULT_DOC_ID
    );

    const apiKey = (env?.FIREBASE_WEB_API_KEY || FIREBASE_WEB_API_KEY || '').trim();
    if (!apiKey) {
        throw httpError('Missing Firebase Web API key.', 500, 'missing_firebase_api_key');
    }

    const flowAiKey = getFlowAiKey(request);
    if (flowAiKey) {
        const exchanged = await exchangeRefreshTokenForIdToken(flowAiKey, apiKey);
        if (!exchanged.userId) {
            throw httpError('Invalid Flow AI key.', 401, 'invalid_flow_ai_key');
        }

        return {
            authMode: 'flow_ai_key',
            userId: exchanged.userId,
            docId,
            firestoreToken: exchanged.idToken,
        };
    }

    const refreshToken = getFirebaseRefreshToken(request);
    if (refreshToken) {
        const exchanged = await exchangeRefreshTokenForIdToken(refreshToken, apiKey);
        if (!exchanged.userId) {
            throw httpError('Invalid Firebase refresh token.', 401, 'invalid_refresh_token');
        }

        return {
            authMode: 'refresh_token',
            userId: exchanged.userId,
            docId,
            firestoreToken: exchanged.idToken,
        };
    }

    const bearerToken = getBearerToken(request);
    if (bearerToken) {
        const userId = getUidFromFirebaseIdToken(bearerToken);
        if (!userId) {
            throw httpError('Invalid Firebase ID token.', 401, 'invalid_id_token');
        }

        return {
            authMode: 'id_token',
            userId,
            docId,
            firestoreToken: bearerToken,
        };
    }

    throw httpError('Missing auth credential. Provide X-Flow-AI-Key, X-Firebase-Refresh-Token, or Authorization: Bearer <Firebase ID Token>.', 401, 'missing_auth');
}
