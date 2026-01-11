/**
 * 跨项目数据接收 API
 * 接收来自 NexMap 等外部项目的内容导入请求
 * 
 * POST /api/import
 * Body: { text: string, source?: string, timestamp?: number }
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestPost({ request }) {
    try {
        const data = await request.json();
        const { text, source, timestamp } = data;

        if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 记录接收到的数据
        console.log('Received import request:', {
            text: text.substring(0, 100), // 只记录前100字符
            source,
            timestamp,
            receivedAt: new Date().toISOString()
        });

        // 返回重定向 URL，前端可以使用此 URL 进行跳转
        const redirectUrl = `https://flowstudio.catzz.work/inspiration?import_text=${encodeURIComponent(text)}`;

        return new Response(JSON.stringify({
            success: true,
            message: 'Content received',
            redirectUrl
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
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
