import { authenticate } from '../_flowData/auth.js';
import { fetchFirestoreDoc, loadBase64State } from '../_flowData/firestoreRest.js';
import { readAllProjects, addTodoToDoc } from '../_flowData/yjsDocument.js';
import { runServiceMutation } from '../_flowData/todoService.js';
import { normalizeIdeaTextForExport } from '../../../src/features/lifecycle/components/inspiration/categoryTransferUtils.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-Refresh-Token',
};

function buildJsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}

function parseInteger(rawValue, fallback, min, max) {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed)) return fallback;
    const clamped = Math.max(min, parsed);
    return Number.isFinite(max) ? Math.min(clamped, max) : clamped;
}

function isCompleted(project) {
    const value = project?.completed;
    return value === true || value === 1 || value === '1' || value === 'true';
}

function shouldIncludeByMode(project, mode) {
    if (mode === 'all') return true;
    const aiAssistClass = project?.aiAssistClass || 'unclassified';
    if (mode === 'unclassified') {
        return aiAssistClass === 'unclassified';
    }
    return aiAssistClass === mode;
}

function extractTodoIdeas(allProjects, mode) {
    return allProjects
        .filter((project) => (project?.stage || 'inspiration') === 'inspiration')
        .filter((project) => (project?.category || 'note') === 'todo')
        .filter((project) => !isCompleted(project))
        .filter((project) => shouldIncludeByMode(project, mode))
        .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
}

function formatTodoItem(project, index) {
    const normalizedContent = normalizeIdeaTextForExport(project?.content || '');
    return {
        index,
        id: project?.id || null,
        content: project?.content || '',
        normalizedContent,
        timestamp: Number.isFinite(Number(project?.timestamp)) ? Number(project.timestamp) : null,
        createdAt: Number.isFinite(Number(project?.createdAt)) ? Number(project.createdAt) : null,
        aiAssistClass: project?.aiAssistClass || 'unclassified',
        category: project?.category || 'note',
        stage: project?.stage || 'inspiration',
        completed: isCompleted(project),
        subcategory: project?.subcategory || null,
        note: project?.note || '',
        colorIndex: typeof project?.colorIndex === 'number' ? project.colorIndex : 0
    };
}

export async function onRequestGet({ request, env }) {
    try {
        const authResult = await authenticate(request, env);
        const { userId, docId, firestoreToken, authMode } = authResult;
        
        const url = new URL(request.url);
        const mode = (url.searchParams.get('mode') || 'unclassified').trim();
        const cursor = parseInteger(url.searchParams.get('cursor'), 0, 0, Number.POSITIVE_INFINITY);
        const limit = parseInteger(url.searchParams.get('limit'), 1, 1, 100);
        
        const TODO_MODES = new Set(['all', 'unclassified', 'ai_done', 'ai_high', 'ai_mid', 'self']);
        if (!TODO_MODES.has(mode)) {
            return buildJsonResponse({
                error: 'Invalid mode.',
                allowedModes: Array.from(TODO_MODES),
            }, 400);
        }
        
        const stateDoc = await fetchFirestoreDoc({ token: firestoreToken, userId, roomId: docId });
        if (!stateDoc) {
            return buildJsonResponse({
                success: true,
                userId,
                docId,
                mode,
                cursor,
                limit,
                total: 0,
                hasMore: false,
                nextCursor: null,
                items: [],
                item: null,
                numberedText: '',
            });
        }
        
        const base64State = await loadBase64State({ token: firestoreToken, userId, roomId: docId, stateDoc });
        const allProjects = readAllProjects(base64State);
        const todoIdeas = extractTodoIdeas(allProjects, mode);
        
        const pagedIdeas = todoIdeas.slice(cursor, cursor + limit);
        const items = pagedIdeas.map((project, index) => formatTodoItem(project, cursor + index));
        const numberedText = items
            .map((item, index) => `${cursor + index + 1}. ${item.normalizedContent || '（空）'}`)
            .join('\n');
            
        const nextCursor = cursor + items.length;
        const hasMore = nextCursor < todoIdeas.length;
        
        return buildJsonResponse({
            success: true,
            userId,
            authMode,
            docId,
            mode,
            cursor,
            limit,
            total: todoIdeas.length,
            hasMore,
            nextCursor: hasMore ? nextCursor : null,
            items,
            item: items[0] || null,
            numberedText,
        });
        
    } catch (error) {
        const status = Number.isInteger(error?.status) ? error.status : 500;
        const message = error?.message || 'Failed to fetch todo list.';
        return buildJsonResponse({ error: message }, status);
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json().catch(() => ({}));
        const { mutationId, content, category, subcategory, note, colorIndex, stage, aiAssistClass } = body;
        
        if (!content || typeof content !== 'string') {
            return buildJsonResponse({ error: 'Missing or invalid content' }, 400);
        }
        
        const mutateFn = (yDoc) => {
            const addedItem = addTodoToDoc(yDoc, {
                content,
                category: category || 'todo',
                subcategory: subcategory || null,
                note: note || '',
                colorIndex: typeof colorIndex === 'number' ? colorIndex : 0,
                stage: stage || 'inspiration',
                aiAssistClass: aiAssistClass || 'unclassified'
            });
            return addedItem;
        };
        
        const result = await runServiceMutation(request, env, mutationId, mutateFn);
        
        return buildJsonResponse({
            success: true,
            version: result.version,
            docId: result.docId,
            userId: result.userId,
            alreadyProcessed: result.alreadyProcessed,
            todo: result.result
        });
        
    } catch (error) {
        const status = Number.isInteger(error?.status) ? error.status : 500;
        const message = error?.message || 'Failed to create todo item.';
        return buildJsonResponse({ error: message }, status);
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}
