import { jsonResponse, optionsResponse } from '../../_flowData/http.js';
import { getAllowedTodoModes } from '../../_flowData/todoDomain.js';

export async function onRequestGet() {
    return jsonResponse({
        success: true,
        name: 'Flow Data API v1',
        baseUrl: 'https://flowstudio.catzz.work/api/flow/v1',
        auth: {
            header: 'X-Flow-AI-Key',
            description: 'Use the Flow AI key copied from /__flowstudio/whoami.',
        },
        todos: {
            list: 'GET /todos?mode=pending&cursor=0&limit=50',
            create: 'POST /todos',
            update: 'PATCH /todos/:id',
            delete: 'DELETE /todos/:id',
            batch: 'POST /todos/batch',
            modes: getAllowedTodoModes(),
            writableFields: ['content', 'completed', 'aiAssistClass', 'subcategory', 'note', 'colorIndex'],
            aiAssistClass: ['unclassified', 'ai_done', 'ai_high', 'ai_mid', 'self'],
        },
    });
}

export async function onRequestOptions() {
    return optionsResponse();
}
