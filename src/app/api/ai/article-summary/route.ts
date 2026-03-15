import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createRouteClient } from '@/lib/supabase';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL 不能为空' }, { status: 400 });
    }

    // 1. 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const { allowed, count } = await checkUsage(session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: '免费额度已用完，请升级 Pro 或联系商务合作' }, { status: 403 });
    }

    // 2. 获取网页内容
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: '无法获取网页内容，请检查链接是否有效' }, { status: res.status });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 3. 简单提取正文内容
    $('script, style, nav, footer, header, noscript').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 4000);

    // 4. 调用 AI 总结
    const apiKey = process.env.MINIMAX_API_KEY;
    const aiUrl = 'https://api.minimax.io/v1/text/chatcompletion_v2';

    const aiResponse = await fetch(aiUrl, {
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
            content: '你是一个高效的文章阅读助手。你的任务是阅读用户提供的网页文本内容，提炼出核心摘要。包含：文章标题、核心观点、主要结论。语气要客观中立。',
          },
          {
            role: 'user',
            content: `请总结以下网页内容：\n\n${bodyText}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      return NextResponse.json({ error: 'AI 总结失败' }, { status: aiResponse.status });
    }

    const summary = aiData.choices[0].message.content;

    // 5. 成功后增加使用次数
    await incrementUsage(session.user.id);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Article Summary API Error:', error);
    return NextResponse.json({ error: '系统内部错误' }, { status: 500 });
  }
}
