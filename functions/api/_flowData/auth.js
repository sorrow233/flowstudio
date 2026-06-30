import { fetchWithRetry } from './firestoreRest.js';

const FIREBASE_WEB_API_KEY = 'AIzaSyA20FrNmdIPE2Sb9r97s7cj2w6MLYgcB_M';

function decodeBase64Url(value = '') {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(normalized + padding);
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
        const reason = payload?.error?.message || 'Refresh token exchange failed';
        const error = new Error(reason);
        error.status = response.status === 400 ? 401 : response.status;
        throw error;
    }

    return {
        idToken: payload.id_token,
        userId: payload.user_id || null,
    };
}

let cachedGoogleToken = {
    accessToken: '',
    expiresAt: 0,
    cacheKey: '',
};

let cachedPrivateKey = {
    cacheKey: '',
    cryptoKey: null,
};

function encodeBase64UrlString(input) {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem) {
    const normalizedPem = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');
    const binary = atob(normalizedPem);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
}

async function importPrivateKey(privateKey, cacheKey) {
    if (cachedPrivateKey.cacheKey === cacheKey && cachedPrivateKey.cryptoKey) {
        return cachedPrivateKey.cryptoKey;
    }
    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(privateKey),
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['sign']
    );
    cachedPrivateKey = { cacheKey, cryptoKey };
    return cryptoKey;
}

async function createGoogleAccessToken(serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const cacheKey = `${serviceAccount.client_email}:${serviceAccount.private_key_id}`;
    const now = Math.floor(Date.now() / 1000);

    if (
        cachedGoogleToken.cacheKey === cacheKey &&
        cachedGoogleToken.accessToken &&
        cachedGoogleToken.expiresAt - 60 > now
    ) {
        return cachedGoogleToken.accessToken;
    }

    const header = encodeBase64UrlString(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = encodeBase64UrlString(JSON.stringify({
        iss: serviceAccount.client_email,
        sub: serviceAccount.client_email,
        aud: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        iat: now,
        exp: now + 3600,
    }));
    const signingInput = `${header}.${payload}`;
    const privateKey = await importPrivateKey(serviceAccount.private_key, cacheKey);
    const signatureBuffer = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        privateKey,
        new TextEncoder().encode(signingInput)
    );
    
    let signatureBinary = '';
    new Uint8Array(signatureBuffer).forEach(b => { signatureBinary += String.fromCharCode(b); });
    const signature = btoa(signatureBinary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    
    const assertion = `${signingInput}.${signature}`;

    const response = await fetchWithRetry('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }).toString(),
    }, {
        retries: 2,
        baseDelayMs: 350,
    });

    const payloadJson = await response.json().catch(() => ({}));
    if (!response.ok || !payloadJson.access_token) {
        throw new Error(payloadJson.error_description || payloadJson.error || '获取 Google 访问令牌失败。');
    }

    cachedGoogleToken = {
        accessToken: payloadJson.access_token,
        expiresAt: now + Number(payloadJson.expires_in || 3600),
        cacheKey,
    };

    return payloadJson.access_token;
}

export function getBearerToken(request) {
    const authHeader = request.headers.get('Authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : '';
}

export function getRefreshTokenFromHeader(request) {
    return (request.headers.get('X-Firebase-Refresh-Token') || '').trim();
}

export async function authenticate(request, env) {
    const bearerToken = getBearerToken(request);
    
    const configuredApiToken = (env?.API_TOKEN || '').trim();
    if (bearerToken && configuredApiToken && bearerToken === configuredApiToken) {
        const serviceAccountJson = env?.FIREBASE_SERVICE_ACCOUNT_JSON;
        const apiUserId = env?.API_USER_ID;
        const apiDocId = env?.API_DOC_ID || 'flowstudio_v1';
        
        if (!serviceAccountJson || !apiUserId) {
            throw new Error('Personal API Token authenticated but FIREBASE_SERVICE_ACCOUNT_JSON or API_USER_ID is not configured.');
        }
        
        const gcpAccessToken = await createGoogleAccessToken(serviceAccountJson);
        return {
            userId: apiUserId,
            docId: apiDocId,
            firestoreToken: gcpAccessToken,
            authMode: 'api_token'
        };
    }
    
    if (bearerToken && bearerToken.startsWith('fs_live_')) {
        const err = new Error('Invalid personal API token.');
        err.status = 401;
        throw err;
    }
    
    if (bearerToken) {
        const userId = getUidFromFirebaseIdToken(bearerToken);
        if (!userId) {
            const err = new Error('Invalid Firebase auth ID token.');
            err.status = 401;
            throw err;
        }
        
        const url = new URL(request.url);
        const docId = (url.searchParams.get('docId') || 'flowstudio_v1').trim();
        
        return {
            userId,
            docId,
            firestoreToken: bearerToken,
            authMode: 'id_token'
        };
    }
    
    const refreshToken = getRefreshTokenFromHeader(request);
    if (refreshToken) {
        const apiKey = (env?.FIREBASE_WEB_API_KEY || FIREBASE_WEB_API_KEY || '').trim();
        const exchanged = await exchangeRefreshTokenForIdToken(refreshToken, apiKey);
        
        const url = new URL(request.url);
        const docId = (url.searchParams.get('docId') || 'flowstudio_v1').trim();
        
        return {
            userId: exchanged.userId,
            docId,
            firestoreToken: exchanged.idToken,
            authMode: 'refresh_token'
        };
    }
    
    const err = new Error('Missing authentication credentials.');
    err.status = 401;
    throw err;
}
