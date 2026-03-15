import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';
import { toolPrompts, callMiniMaxStream } from '@/services/ai';

export const dynamic = 'force-dynamic';

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
    // 针对 Mintlify, VitePress, Docusaurus 等文档系统，尝试先移除侧边栏、导航等
    $('#sidebar, #navigation-items, #table-of-contents, nav, footer, header, aside, .sidebar, .nav, .footer, .header, .table-of-contents').remove();
    $('script, style, noscript, iframe, .ads, .comments, .qr_code_pc_outer, .hidden').remove();
    
    let bodyText = '';
    const selectors = [
      '.rich_media_content', // 微信公众号
      '#js_content',         // 微信公众号
      '#content-container',  // Mintlify / Modern Docs
      'article', 
      'main', 
      '.prose',              // Tailwind Prose
      '.markdown-body',      // GitHub/Docs
      '.vp-doc',             // VitePress
      '.nextra-content',     // Nextra
      '.content', 
      '.post-content', 
      '.article-content',
      '#content',
      '.entry-content',
      '#main-content'
    ];
    
    for (const selector of selectors) {
      const $el = $(selector);
      if ($el.length > 0) {
        // 进一步清洗容器内的干扰
        $el.find('nav, footer, .sidebar, .ad-unit').remove();
        const text = $el.text().trim();
        if (text.length > 200) {
          bodyText = text;
          break;
        }
      }
    }

    // 如果常规提取失败，采用基于“文本密度”的智能提取逻辑
    if (!bodyText || bodyText.length < 300) {
      const segments: string[] = [];
      
      // 提取所有有意义的标题和段落
      $('h1, h2, h3, p, li').each((_, el) => {
        const $el = $(el);
        // 排除掉嵌套在 nav/footer 等区域内的元素
        if ($el.closest('nav, footer, header, aside, .sidebar').length > 0) return;
        
        const t = $el.text().trim();
        // 只有长度超过 15 的片段才认为是有意义的内容
        if (t.length > 15) {
          segments.push(t);
        }
      });

      if (segments.length > 0) {
        bodyText = segments.join('\n\n');
      }
    }

    if (!bodyText) {
      bodyText = $('body').text().trim();
    }

    // 极致清洗：去除多余空白，限制长度
    bodyText = bodyText
      .replace(/\n\s*\n/g, '\n\n') // 压缩多余换行
      .replace(/\s+/g, ' ')        // 压缩多余空格
      .trim()
      .substring(0, 15000); // 增加上限到 15000 字符

    console.log(`Smart Extraction for ${url} completed. Length: ${bodyText.length}`);

    if (bodyText.length < 50) {
      return new Response(JSON.stringify({ error: '无法提取网页正文。该页面可能由 JavaScript 高度渲染或受反爬限制。请手动粘贴内容总结。' }), { status: 400 });
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
