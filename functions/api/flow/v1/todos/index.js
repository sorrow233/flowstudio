import { handleApiError, jsonResponse, optionsResponse, parseInteger, readJsonBody } from '../../../_flowData/http.js';
import { loadTodoDocument, runTodoMutation } from '../../../_flowData/todoService.js';
import {
    addTodo,
    buildNumberedText,
    formatTodoItem,
    getAllowedTodoModes,
    listTodosFromDoc,
} from '../../../_flowData/todoDomain.js';

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const mode = (url.searchParams.get('mode') || 'pending').trim();
        const cursor = parseInteger(url.searchParams.get('cursor'), 0, 0, Number.POSITIVE_INFINITY);
        const limit = parseInteger(url.searchParams.get('limit'), 50, 1, 200);

        const context = await loadTodoDocument(request, env);
        const todos = listTodosFromDoc(context.yDoc, mode);
        const pagedTodos = todos.slice(cursor, cursor + limit);
        const items = pagedTodos.map((todo, index) => formatTodoItem(todo, cursor + index));
        const nextCursor = cursor + items.length;

        return jsonResponse({
            success: true,
            authMode: context.authMode,
            userId: context.userId,
            docId: context.docId,
            version: context.meta.version,
            mode,
            allowedModes: getAllowedTodoModes(),
            cursor,
            limit,
            total: todos.length,
            hasMore: nextCursor < todos.length,
            nextCursor: nextCursor < todos.length ? nextCursor : null,
            items,
            item: items[0] || null,
            numberedText: buildNumberedText(items, cursor),
        });
    } catch (error) {
        return handleApiError(error, 'Failed to fetch todo list.');
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await readJsonBody(request);
        const result = await runTodoMutation(request, env, {
            mutationId: body.mutationId,
            mutate: (yDoc) => addTodo(yDoc, body),
        });

        return jsonResponse({
            success: true,
            authMode: result.authMode,
            userId: result.userId,
            docId: result.docId,
            version: result.version,
            alreadyProcessed: result.alreadyProcessed,
            todo: result.result,
        });
    } catch (error) {
        return handleApiError(error, 'Failed to create todo item.');
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
