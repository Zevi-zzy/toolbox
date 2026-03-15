import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';
import { toolPrompts, callMiniMaxStream } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL 不能为空' }), { status: 400 });
    }

    // 1. 鉴权与次数限制检查
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: '请先登录后使用' }), { status: 401 });
    }

    const { allowed } = await checkUsage(user.id);
    if (!allowed) {
      return new Response(JSON.stringify({ error: '免费额度已用完，请升级 Pro 或联系商务合作' }), { status: 403 });
    }

    // 2. 获取网页内容
    let html = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        throw new Error(`无法获取网页内容 (错误码: ${res.status})`);
      }
      html = await res.text();
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || '获取网页内容失败，请检查链接是否正确或手动粘贴内容。' }), { status: 400 });
    }

    if (!html) {
      return new Response(JSON.stringify({ error: '获取到的网页内容为空' }), { status: 400 });
    }

    const $ = cheerio.load(html);

    // 3. 提取正文内容
    // 针对 Mintlify 等文档系统，尝试先移除侧边栏、导航等
    $('#sidebar, #navigation-items, #table-of-contents, nav, footer, header, aside, .sidebar, .nav, .footer, .header').remove();
    $('script, style, noscript, iframe, .ads, .comments, .qr_code_pc_outer').remove();
    
    let bodyText = '';
    const selectors = [
      '.rich_media_content', // 微信公众号
      '#js_content',         // 微信公众号
      '#content-container',  // Mintlify / Modern Docs
      'article', 
      'main', 
      '.prose',              // Tailwind Prose
      '.content', 
      '.post-content', 
      '.article-content',
      '#content',
      '.entry-content',
      '#main-content',
      '.markdown-body',      // GitHub/Docs
      '.vp-doc',             // VitePress
      '.nextra-content'      // Nextra
    ];
    
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > 200) {
        bodyText = text;
        break;
      }
    }

    if (!bodyText || bodyText.length < 200) {
      // 如果没找到明确的正文区域，或者太短，尝试更激进的提取
      // 提取所有段落和标题
      const parts: string[] = [];
      $('h1, h2, h3, p, li').each((_, el) => {
        const t = $(el).text().trim();
        if (t.length > 10) parts.push(t);
      });
      if (parts.length > 0) {
        bodyText = parts.join('\n');
      }
    }

    if (!bodyText) {
      bodyText = $('body').text().trim();
    }

    // 限制长度并清理多余空白
    bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 12000);

    console.log(`Extracted content length for ${url}: ${bodyText.length}`);

    if (bodyText.length < 50) {
      return new Response(JSON.stringify({ error: '网页正文内容过短或无法自动提取（该网页可能主要由 JavaScript 渲染）。请尝试手动粘贴内容进行总结。' }), { status: 400 });
    }

    // 4. 增加使用次数
    await incrementUsage(user.id);

    // 5. 流式返回 AI 总结
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await callMiniMaxStream(
            [
              { role: 'system', content: toolPrompts['article-summary'].system },
              { role: 'user', content: toolPrompts['article-summary'].user(bodyText) },
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
    console.error('Article Summary API Error:', error);
    return new Response(JSON.stringify({ error: error.message || '系统内部错误' }), { status: 500 });
  }
}
