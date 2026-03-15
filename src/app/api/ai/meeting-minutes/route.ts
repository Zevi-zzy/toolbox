import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '会议内容不能为空' }, { status: 400 });
    }

    // 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const { allowed } = await checkUsage(user.id);
    if (!allowed) {
      return NextResponse.json({ error: '免费额度已用完，请升级 Pro 或联系商务合作' }, { status: 403 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    const url = 'https://api.minimax.io/v1/text/chatcompletion_v2';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          {
            role: 'system',
            content: `你是一个极其专业、细致的企业行政秘书。你的任务是将用户提供的零碎会议笔记、谈话记录或语音转文字稿整理成一份标准的、商务化的【会议纪要】。
            输出要求：
            1. 自动总结会议主题、时间和地点（如果内容中有提到）。
            2. 梳理会议核心要点（分点叙述）。
            3. 明确列出会议决议与待办事项（Action Items），并标注责任人（如果有提到）。
            4. 语气要客观、简练、严谨。
            5. 使用清晰的 Markdown 格式输出。`,
          },
          {
            role: 'user',
            content: `以下是原始会议记录，请帮我整理成专业的会议纪要：\n\n${content}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API Error:', response.status, errorText);
      return NextResponse.json({ error: `AI 服务异常 (${response.status})` }, { status: response.status });
    }

    const data = await response.json();
    const minutes = data.choices?.[0]?.message?.content;

    if (!minutes) {
      console.error('MiniMax Unexpected Response:', data);
      throw new Error('AI 未能生成有效的会议纪要，请稍后重试');
    }

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ minutes });
  } catch (error: any) {
    console.error('Meeting Minutes API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
