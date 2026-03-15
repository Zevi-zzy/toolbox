import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
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

    // 限制输入长度，防止 token 溢出或处理过慢
    const truncatedContent = content.slice(0, 10000);

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
            - color_theme: 建议的颜色主题（blue, indigo, emerald, rose, amber 中的一个）
            
            注意：如果是长文本，请提取最核心的内容，不要堆砌细节。`,
          },
          {
            role: 'user',
            content: `请为以下内容生成知识卡片：\n\n${truncatedContent}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MiniMax API Error:', data);
      return NextResponse.json({ error: 'API Error' }, { status: response.status });
    }

    let rawContent = data.choices[0].message.content;
    
    // 鲁棒的 JSON 解析
    let cardData;
    try {
      // 移除可能的 markdown 代码块标记
      const jsonStr = rawContent.replace(/```json\n?|```/g, '').trim();
      cardData = JSON.parse(jsonStr);
      
      // 校验字段，确保 points 是数组
      if (!Array.isArray(cardData.points)) {
        cardData.points = [String(cardData.points)];
      }
      // 确保 points 不超过 6 个（卡片容量有限）
      if (cardData.points.length > 6) {
        cardData.points = cardData.points.slice(0, 6);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', rawContent, e);
      // Fallback if not standard JSON
      cardData = {
        title: "知识卡片",
        category: "通用",
        points: ["内容提炼完成，但格式转换稍有偏差，请重试或精简输入。"],
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
