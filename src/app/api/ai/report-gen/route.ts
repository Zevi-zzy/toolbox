import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { content, type } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '请提供工作内容' }, { status: 400 });
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

    const systemPrompt = type === 'weekly' 
      ? '你是一个专业的职场导师。你的任务是将用户提供的零散工作内容整理成一份逻辑严密、重点突出、格式规范的【周报】。包含：本周完成情况（分类整理）、遇到的问题与解决方案、下周工作计划。语气要客观、专业、有结果导向。'
      : '你是一个高效率的行政主管。你的任务是将用户提供的工作内容整理成一份精炼的【每日汇报】。突出今日核心产出，简述明日计划。';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下是我的工作内容，请帮我整理成${type === 'weekly' ? '周报' : '日报'}：\n\n${content}` },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务异常' }, { status: response.status });
    }

    const report = data.choices[0].message.content;

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Report Gen API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
