import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth Error:', authError);
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
            content: '你是一个专业的 Prompt 工程师。你的任务是将用户提供的简单描述优化成一个高质量、结构清晰、指令明确的 AI 提示词。请确保优化后的提示词包含：角色设定、具体任务、限制条件、输出格式。',
          },
          {
            role: 'user',
            content: `请优化以下提示词：\n\n${prompt}`,
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
    const optimizedPrompt = data.choices?.[0]?.message?.content;

    if (!optimizedPrompt) {
      console.error('MiniMax Unexpected Response:', data);
      throw new Error('AI 未能生成有效的提示词，请稍后重试');
    }

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ optimizedPrompt });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
