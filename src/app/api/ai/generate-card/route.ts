import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const { allowed } = await checkUsage(session.user.id);
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
            content: `你是一个专业的知识卡片设计师。你的任务是将用户提供的文字提炼成一张精美的知识卡片内容。
            请将输出格式严格限制为 JSON，包含以下字段：
            - title: 一个吸引人的标题
            - category: 知识分类（如：效率、思维、职场、生活）
            - points: 3-5 个核心要点，每个要点简短有力
            - quote: 一句总结性的金句或感悟
            - color_theme: 建议的颜色主题（blue, indigo, emerald, rose, amber 中的一个）`,
          },
          {
            role: 'user',
            content: `请为以下内容生成知识卡片：\n\n${content}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'API Error' }, { status: response.status });
    }

    // Minimax sometimes returns JSON inside content string
    let cardData;
    try {
      cardData = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback if not standard JSON
      cardData = {
        title: "知识卡片",
        category: "通用",
        points: ["内容处理出错，请重试"],
        quote: "保持好奇，持续学习",
        color_theme: "blue"
      };
    }

    // 成功后增加使用次数
    await incrementUsage(session.user.id);

    return NextResponse.json(cardData);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
