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
    const title = $('h1, h2, #activity-name').first().text().trim() || $('title').text().trim();
    
    // 移除干扰元素（但保留 main 和 article 中的内容，即使它们包含一些结构标签）
    $('script, style, noscript, iframe, .qr_code_pc_outer, .rich_media_area_extra').remove();
    
    // 优先尝试获取主要的富文本区域
    let bodyText = '';
    const selectors = ['.rich_media_content', '#js_content', 'article', 'main', '.content', '.post-content'];
    
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > 100) {
        bodyText = text;
        break;
      }
    }

    // 如果没找到特定区域，则回退到 body，但排除掉 nav/footer/header
    if (!bodyText) {
      const $body = $('body').clone();
      $body.find('nav, footer, header, .nav, .footer, .header').remove();
      bodyText = $body.text().trim();
    }

    bodyText = bodyText.replace(/\s+/g, ' ').substring(0, 8000);

    if (bodyText.length < 30) {
      console.error('Content too short:', bodyText);
      return NextResponse.json({ error: '网页正文内容过短或无法自动提取，这可能是由于该网页是纯客户端渲染的。请尝试手动粘贴内容进行总结。' }, { status: 400 });
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
            content: '你是一个高效的文章阅读助手。你的任务是阅读用户提供的网页文本内容，提炼出核心摘要。要求：1. 提炼文章标题（如果能识别）；2. 列出 3-5 个核心观点；3. 给出主要结论或建议。语气要客观中立，条理清晰。如果内容看起来不像一篇文章，请尽可能总结其主要功能或意图。',
          },
          {
            role: 'user',
            content: `标题：${title}\n网页文本内容：\n\n${bodyText}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('MiniMax API Error:', aiResponse.status, errorText);
      return NextResponse.json({ error: `AI 服务响应异常 (${aiResponse.status})，请稍后重试` }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content;

    if (!summary) {
      console.error('MiniMax Unexpected Response (No Content):', JSON.stringify(aiData));
      return NextResponse.json({ error: 'AI 未能生成有效的总结内容，可能是由于网页内容过于零散。请尝试手动粘贴核心文字。' }, { status: 500 });
    }

    // 5. 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Article Summary API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
