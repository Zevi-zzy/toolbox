import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL 不能为空' }, { status: 400 });
    }

    // 1. 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const { allowed } = await checkUsage(user.id);
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
      console.error('Fetch URL Error:', res.status, res.statusText);
      return NextResponse.json({ error: `无法获取网页内容 (错误码: ${res.status})，请检查链接是否有效` }, { status: res.status });
    }

    const html = await res.text();
    if (!html) {
      return NextResponse.json({ error: '获取到的网页内容为空' }, { status: 400 });
    }

    const $ = cheerio.load(html);

    // 3. 提取正文内容
    // 针对微信公众号等平台的优化
    const title = $('h1, h2, #activity-name').first().text().trim();
    
    // 移除干扰元素
    $('script, style, nav, footer, header, noscript, .qr_code_pc_outer, .rich_media_area_extra').remove();
    
    // 优先尝试获取主要的富文本区域
    let bodyText = $('.rich_media_content, #js_content, article, main').text() || $('body').text();
    bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 6000);

    if (bodyText.length < 50) {
      return NextResponse.json({ error: '网页正文内容过短或无法提取，请尝试手动粘贴内容' }, { status: 400 });
    }

    // 4. 调用 AI 总结
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      throw new Error('MINIMAX_API_KEY 未配置');
    }
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
            content: '你是一个高效的文章阅读助手。你的任务是阅读用户提供的网页文本内容，提炼出核心摘要。包含：文章标题（如果有）、核心观点、主要结论。要求语气客观中立，条理清晰。',
          },
          {
            role: 'user',
            content: `标题：${title}\n正文内容：\n\n${bodyText}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('MiniMax API Error:', aiResponse.status, errorText);
      return NextResponse.json({ error: `AI 服务异常 (${aiResponse.status})` }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content;

    if (!summary) {
      console.error('MiniMax Unexpected Response:', aiData);
      throw new Error('AI 未能生成有效的总结，请稍后重试');
    }

    // 5. 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Article Summary API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
