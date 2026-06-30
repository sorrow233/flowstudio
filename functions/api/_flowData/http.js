export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-Refresh-Token, X-Flow-AI-Key',
};

export function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}

export function optionsResponse() {
    return new Response(null, { headers: corsHeaders });
}

export function httpError(message, status = 500, code = '') {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

export async function readJsonBody(request) {
    const text = await request.text();
    if (!text.trim()) return {};

    try {
        return JSON.parse(text);
    } catch {
        throw httpError('Invalid JSON request body.', 400, 'invalid_json');
    }
}

export function parseInteger(rawValue, fallback, min, max) {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed)) return fallback;

    const lowerBounded = Math.max(min, parsed);
    return Number.isFinite(max) ? Math.min(lowerBounded, max) : lowerBounded;
}

export function normalizeDocId(rawValue, fallback = 'flowstudio_v1') {
    const docId = String(rawValue || fallback).trim();
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(docId)) {
        throw httpError('Invalid docId.', 400, 'invalid_doc_id');
    }
    return docId;
}

export function handleApiError(error, fallbackMessage) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const body = {
        success: false,
        error: error?.message || fallbackMessage,
    };

    if (error?.code) {
        body.code = error.code;
    }

    return jsonResponse(body, status);
}
