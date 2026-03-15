import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '请提供个人信息或工作经历' }, { status: 400 });
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
            content: `你是一个专业的 HR 和简历优化专家。你的任务是将用户提供的零散信息转化为一份专业的简历。
            请将输出格式严格限制为 JSON，包含以下字段：
            - name: 姓名
            - title: 期望职位/当前职位
            - summary: 个人总结（3-5句话，突出优势）
            - experience: 数组，包含公司名(company)、职位(role)、时间(period)、职责描述(desc，3条要点)
            - education: 数组，包含学校(school)、专业(major)、学历(degree)
            - skills: 数组，包含核心技能词
            - color_theme: 建议的主题色（slate, blue, emerald, violet 中的一个）`,
          },
          {
            role: 'user',
            content: `请为以下信息生成一份专业简历：\n\n${content}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务异常' }, { status: response.status });
    }

    let resumeData;
    try {
      resumeData = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      resumeData = {
        name: "解析失败",
        title: "请重试",
        summary: "无法从输入内容中解析出有效信息，请提供更详细的描述。",
        experience: [],
        education: [],
        skills: [],
        color_theme: "blue"
      };
    }

    // 成功后增加使用次数
    await incrementUsage(user.id);

    return NextResponse.json(resumeData);
  } catch (error: any) {
    console.error('Resume Gen API Error:', error);
    return NextResponse.json({ error: error.message || '系统内部错误' }, { status: 500 });
  }
}
