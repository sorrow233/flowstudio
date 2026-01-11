/**
 * 跨项目数据接收 API
 * 接收来自 NexMap 等外部项目的内容导入请求
 * 
 * POST /api/import
 * Body: { text: string, userId: string, source?: string }
 * 
 * 工作流程：
 * 1. 接收导入请求
 * 2. 写入 Firebase pending_imports 队列
 * 3. 前端应用启动时自动处理队列
 */

const FIREBASE_PROJECT_ID = 'flow-7ffad';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestPost({ request }) {
    try {
        const data = await request.json();
        const { text, userId, source } = data;

        if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!userId) {
            // 如果没有 userId，返回重定向 URL 作为备选方案
            const redirectUrl = `https://flowstudio.catzz.work/inspiration?import_text=${encodeURIComponent(text)}`;
            return new Response(JSON.stringify({
                success: true,
                method: 'redirect',
                message: 'No userId provided, use redirectUrl instead',
                redirectUrl
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 生成唯一 ID
        const importId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        // 使用 Firebase REST API 写入待导入队列
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/pending_imports/${importId}`;

        const firestoreDoc = {
            fields: {
                text: { stringValue: text },
                source: { stringValue: source || 'external' },
                createdAt: { integerValue: Date.now().toString() },
                processed: { booleanValue: false }
            }
        };

        const firestoreResponse = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(firestoreDoc)
        });

        if (!firestoreResponse.ok) {
            const errorText = await firestoreResponse.text();
            console.error('Firestore write failed:', errorText);

            // 如果写入失败，返回重定向 URL 作为备选
            const redirectUrl = `https://flowstudio.catzz.work/inspiration?import_text=${encodeURIComponent(text)}`;
            return new Response(JSON.stringify({
                success: true,
                method: 'redirect',
                message: 'Queue write failed, use redirectUrl instead',
                redirectUrl
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('Import queued successfully:', { importId, userId, textLength: text.length });

        return new Response(JSON.stringify({
            success: true,
            method: 'queue',
            message: 'Content queued for import',
            importId
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Import API error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
    return new Response(null, {
        headers: corsHeaders
    });
}
