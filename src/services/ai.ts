export async function callMiniMaxStream(messages: any[], onChunk: (chunk: string) => void) {
  const apiKey = process.env.MINIMAX_API_KEY;
  const url = 'https://api.minimax.io/v1/text/chatcompletion_v2';

  const body = {
    model: 'MiniMax-M2.5',
    messages,
    temperature: 0.7,
    stream: true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.base_resp?.status_msg || 'MiniMax API Error');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported');

  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') break;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices[0]?.delta?.content || '';
            if (content) onChunk(content);
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    }
  }
}

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

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空，请重试');
  }

  return content;
}

export const toolPrompts = {
  'excel-helper': {
    system: `你是一个精通 Excel 和 Google Sheets 的高级数据分析专家。
    你的任务是根据用户的口语化描述，编写出准确的 Excel 公式或 VBA 宏。
    输出要求：
    1. 直接给出公式（用代码块包裹）。
    2. 简要说明公式的逻辑（小白也能听懂的话）。
    3. 如果有多种实现方式，提供最简单的一种。
    4. 语气要专业且亲切，适合办公小白。`,
    user: (prompt: string) => `我的需求是：\n\n${prompt}`
  },
  'optimize-prompt': {
    system: '你是一个专业的 Prompt 工程师。你的任务是将用户提供的简单描述优化成一个高质量、结构清晰、指令明确的 AI 提示词。',
    user: (prompt: string) => `请优化以下提示词：\n\n${prompt}`
  },
  'generate-card': {
    system: `你是一个专业的知识卡片设计师。你的任务是将用户提供的内容提炼成一张精美的知识卡片。
    请按以下 JSON 格式输出（不要包含任何 Markdown 标记）：
    {
      "title": "卡片标题",
      "category": "类别",
      "points": ["核心要点1", "核心要点2", "核心要点3", "核心要点4", "核心要点5"],
      "quote": "一句具有启发性的话",
      "color_theme": "blue | indigo | emerald | rose | amber"
    }`,
    user: (content: string) => `请为以下内容生成知识卡片：\n\n${content.slice(0, 10000)}`
  },
  'report-gen': {
    system: (type: string = 'weekly') => type === 'weekly' 
      ? '你是一个专业的职场导师。你的任务是根据用户提供的工作内容，整理成逻辑严密、表达清晰、富有专业感的周报。包含本周工作总结、遇到的问题、下周计划。'
      : '你是一个高效率的行政主管。你的任务是根据用户提供的工作内容，整理成精炼、准确的日报。包含今日工作、明日计划。',
    user: (content: string) => `工作内容：\n\n${content}`
  },
  'meeting-minutes': {
    system: `你是一个极其专业、细致的企业行政秘书。你的任务是将一段杂乱的会议记录整理成标准的、可执行的会议纪要（Markdown 格式）。
    包含以下部分：
    1. 会议主题
    2. 核心讨论要点
    3. 形成的决议
    4. 待办事项（Action Items）及责任人`,
    user: (content: string) => `原始会议记录：\n\n${content}`
  },
  'generate-mindmap': {
    system: `你是一个专业的思维导图专家。你的任务是根据用户提供的内容，提取核心逻辑和层级关系，并生成 Mermaid mindmap 语法的思维导图。
    注意：只输出 Mermaid 语法，不要包含任何解释。
    示例格式：
    mindmap
      root((主题))
        分支1
          子分支1
          子分支2
        分支2`,
    user: (content: string) => `内容：\n\n${content}`
  },
  'generate-resume': {
    system: `你是一个专业的 HR 专家和简历优化师。你的任务是将用户提供的杂乱简历内容提炼成结构化数据。
    请按以下 JSON 格式输出（不要包含任何 Markdown 标记）：
    {
      "name": "姓名",
      "title": "职业头衔",
      "summary": "专业总结",
      "experience": [
        { "company": "公司", "role": "职位", "period": "周期", "desc": "工作描述" }
      ],
      "education": [
        { "school": "学校", "degree": "学位", "period": "周期" }
      ],
      "skills": ["技能1", "技能2"],
      "color_theme": "blue | indigo | emerald | rose | amber"
    }`,
    user: (content: string) => `内容：\n\n${content}`
  },
  'article-summary': {
    system: '你是一个高效的文章阅读助手。你的任务是阅读用户提供的网页文本内容，提炼出核心摘要。要求：1. 提炼文章标题；2. 列出 3-5 个核心观点；3. 给出主要结论或建议。语气要客观中立，条理清晰。',
    user: (content: string) => `内容：\n\n${content}`
  },
};

export const toolServices = {
  'excel-helper': async (prompt: string) => {
    return await callMiniMax([
      { role: 'system', content: toolPrompts['excel-helper'].system },
      { role: 'user', content: toolPrompts['excel-helper'].user(prompt) },
    ]);
  },
  'optimize-prompt': async (prompt: string) => {
    return await callMiniMax([
      { role: 'system', content: toolPrompts['optimize-prompt'].system },
      { role: 'user', content: toolPrompts['optimize-prompt'].user(prompt) },
    ]);
  },
  'generate-card': async (content: string) => {
    try {
      const res = await callMiniMax([
        { role: 'system', content: toolPrompts['generate-card'].system },
        { role: 'user', content: toolPrompts['generate-card'].user(content) },
      ], { type: "json_object" });
      
      const jsonStr = res.replace(/```json\n?|```/g, '').trim();
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data.points)) data.points = [String(data.points)];
      return data;
    } catch (e) {
      console.error('Generate Card Error:', e);
      return {
        title: "知识卡片",
        category: "通用",
        points: ["内容提炼出错，请重试", "这可能是由于输入内容过短或格式特殊", "您可以尝试增加内容长度或更换内容"],
        quote: "保持好奇，持续学习",
        color_theme: "blue"
      };
    }
  },
  'report-gen': async (content: string, type: string = 'weekly') => {
    return await callMiniMax([
      { role: 'system', content: toolPrompts['report-gen'].system(type) },
      { role: 'user', content: toolPrompts['report-gen'].user(content) },
    ]);
  },
  'meeting-minutes': async (content: string) => {
    return await callMiniMax([
      { role: 'system', content: toolPrompts['meeting-minutes'].system },
      { role: 'user', content: toolPrompts['meeting-minutes'].user(content) },
    ]);
  },
  'generate-mindmap': async (content: string) => {
    try {
      const res = await callMiniMax([
        { role: 'system', content: toolPrompts['generate-mindmap'].system },
        { role: 'user', content: toolPrompts['generate-mindmap'].user(content) },
      ]);
      // 清理可能存在的 Markdown 代码块标记
      const cleaned = res.replace(/```mermaid\n?|```/g, '').trim();
      return cleaned.startsWith("mindmap") ? cleaned : `mindmap\n${cleaned}`;
    } catch (e) {
      console.error('Generate Mindmap Error:', e);
      return "mindmap\n  root((解析失败))\n    请重试\n    检查输入内容";
    }
  },
  'generate-resume': async (content: string) => {
    try {
      const res = await callMiniMax([
        { role: 'system', content: toolPrompts['generate-resume'].system },
        { role: 'user', content: toolPrompts['generate-resume'].user(content) },
      ], { type: "json_object" });
      const jsonStr = res.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Generate Resume Error:', e);
      return {
        name: "简历解析失败",
        title: "请重试",
        summary: "无法从输入内容中解析出有效信息，请提供更详细的个人经历描述。",
        experience: [],
        education: [],
        skills: ["请重新输入"],
        color_theme: "blue"
      };
    }
  },
  'article-summary': async (content: string) => {
    try {
      return await callMiniMax([
        { role: 'system', content: toolPrompts['article-summary'].system },
        { role: 'user', content: toolPrompts['article-summary'].user(content) },
      ]);
    } catch (e) {
      console.error('Article Summary Error:', e);
      throw e;
    }
  },
};

