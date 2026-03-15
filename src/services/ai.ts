export async function callMiniMax(messages: any[], responseFormat?: any) {
  const apiKey = process.env.MINIMAX_API_KEY;
  const url = 'https://api.minimax.io/v1/text/chatcompletion_v2';

  const body: any = {
    model: 'MiniMax-M2.5',
    messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.base_resp?.status_msg || 'MiniMax API Error');
  }

  return data.choices[0].message.content;
}

export const toolServices = {
  'excel-helper': async (prompt: string) => {
    return await callMiniMax([
      {
        role: 'system',
        content: `你是一个精通 Excel 和 Google Sheets 的高级数据分析专家。你的任务是根据用户的口语化描述，编写出准确的 Excel 公式或 VBA 宏。输出要求：1. 直接给出公式（用代码块包裹）。2. 简要说明公式的逻辑。3. 提供最简单的实现方式。`,
      },
      { role: 'user', content: `我的需求是：\n\n${prompt}` },
    ]);
  },
  'optimize-prompt': async (prompt: string) => {
    return await callMiniMax([
      {
        role: 'system',
        content: '你是一个专业的 Prompt 工程师。你的任务是将用户提供的简单描述优化成一个高质量、结构清晰、指令明确的 AI 提示词。',
      },
      { role: 'user', content: `请优化以下提示词：\n\n${prompt}` },
    ]);
  },
  'generate-card': async (content: string) => {
    const res = await callMiniMax([
      {
        role: 'system',
        content: `你是一个专业的知识卡片设计师。提炼成 JSON：title, category, points(array), quote, color_theme(blue, indigo, emerald, rose, amber)。`,
      },
      { role: 'user', content: `请为以下内容生成知识卡片：\n\n${content}` },
    ], { type: "json_object" });
    return JSON.parse(res);
  },
  'report-gen': async (content: string, type: string = 'weekly') => {
    const systemPrompt = type === 'weekly' 
      ? '你是一个专业的职场导师。整理成逻辑严密的周报。'
      : '你是一个高效率的行政主管。整理成精炼的日报。';
    return await callMiniMax([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `内容：\n\n${content}` },
    ]);
  },
  'meeting-minutes': async (content: string) => {
    return await callMiniMax([
      {
        role: 'system',
        content: `你是一个极其专业、细致的企业行政秘书。整理成标准的会议纪要（Markdown）。包含：主题、要点、决议与待办。`,
      },
      { role: 'user', content: `内容：\n\n${content}` },
    ]);
  },
  'generate-mindmap': async (content: string) => {
    return await callMiniMax([
      {
        role: 'system',
        content: `你是一个专业的思维导图专家。仅输出 Mermaid mindmap 语法。`,
      },
      { role: 'user', content: `内容：\n\n${content}` },
    ]);
  },
  'generate-resume': async (content: string) => {
    const res = await callMiniMax([
      {
        role: 'system',
        content: `你是一个专业的 HR 专家。提炼成 JSON：name, title, summary, experience(array), education(array), skills(array), color_theme。`,
      },
      { role: 'user', content: `内容：\n\n${content}` },
    ], { type: "json_object" });
    return JSON.parse(res);
  },
  'article-summary': async (content: string) => {
    return await callMiniMax([
      {
        role: 'system',
        content: '你是一个高效的文章阅读助手。提炼文章标题、核心观点、主要结论。',
      },
      { role: 'user', content: `内容：\n\n${content}` },
    ]);
  },
};
