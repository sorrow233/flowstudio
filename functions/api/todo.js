import { onRequestGet as handleGet, onRequestOptions as handleOptions } from './todos/index.js';

export async function onRequestGet(context) {
    return handleGet(context);
}

export async function onRequestOptions(context) {
    return handleOptions(context);
}
