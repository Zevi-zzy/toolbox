import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';
import { toolPrompts, callMiniMaxStream } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: '需求描述不能为空' }), { status: 400 });
    }

    // 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: '请先登录后使用' }), { status: 401 });
    }

    const { allowed } = await checkUsage(user.id);
    if (!allowed) {
      return new Response(JSON.stringify({ error: '免费额度已用完，请升级 Pro 或联系商务合作' }), { status: 403 });
    }

    // 增加使用次数
    await incrementUsage(user.id);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await callMiniMaxStream(
            [
              { role: 'system', content: toolPrompts['optimize-prompt'].system },
              { role: 'user', content: toolPrompts['optimize-prompt'].user(prompt) },
            ],
            (chunk) => {
              controller.enqueue(encoder.encode(chunk));
            }
          );
          controller.close();
        } catch (error: any) {
          console.error('Stream Error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Prompt Optimizer API Error:', error);
    return new Response(JSON.stringify({ error: error.message || '系统内部错误' }), { status: 500 });
  }
}
