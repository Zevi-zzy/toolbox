import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
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
            content: `你是一个专业的思维导图构建专家。你的任务是将用户提供的文字转化为 Mermaid 语法的 mindmap 格式。
            
            输出要求：
            1. 仅输出 Mermaid 代码块内容，不要包含 markdown 的 \`\`\`mermaid 标记。
            2. 格式必须符合 Mermaid mindmap 语法。
            3. 结构要清晰，层级分明。
            4. 根节点应为核心主题。
            5. 每一行开头使用空格表示层级。
            
            示例输出格式：
            mindmap
              root((核心主题))
                子主题1
                  细节1.1
                  细节1.2
                子主题2
                  细节2.1`,
          },
          {
            role: 'user',
            content: `请将以下内容转化为思维导图 Mermaid 语法：\n\n${content}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务异常' }, { status: response.status });
    }

    const mindmapCode = data.choices[0].message.content.trim();

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json({ mindmapCode });
  } catch (error: any) {
    console.error('Mindmap API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
