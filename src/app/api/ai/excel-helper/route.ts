import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: '需求描述不能为空' }, { status: 400 });
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
            content: `你是一个精通 Excel 和 Google Sheets 的高级数据分析专家。
            你的任务是根据用户的口语化描述，编写出准确的 Excel 公式或 VBA 宏。
            输出要求：
            1. 直接给出公式（用代码块包裹）。
            2. 简要说明公式的逻辑（小白也能听懂的话）。
            3. 如果有多种实现方式，提供最简单的一种。
            4. 语气要专业且亲切，适合办公小白。`,
          },
          {
            role: 'user',
            content: `我的需求是：\n\n${prompt}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务响应异常' }, { status: response.status });
    }

    const result = data.choices[0].message.content;

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Excel Helper API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
