export async function callMiniMaxStream(messages: any[], onChunk: (chunk: string) => void) {
  const apiKey = process.env.MINIMAX_API_KEY;
  const url = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

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
    cache: 'no-store',
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
  const url = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

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
    cache: 'no-store',
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
    输出要求：
    1. 标题 (title)：必须根据正文自动提炼一个富有吸引力、社交感的短标题。严禁使用“卡片标题”、“知识卡片”、“未命名”等占位符。
    2. 分类 (category)：提炼一个准确的领域标签（如：职场成长、思维模型、效率工具等）。
    3. 核心要点 (points)：提炼 3-5 个对用户最有启发性的核心观点，每个要点应简短有力，具有行动导向。
    4. 金句 (quote)：提炼或总结一句具有共鸣感、启发性的金句。
    5. 颜色主题 (color_theme)：根据内容情感选择 (blue, indigo, emerald, rose, amber)。
    
    请按以下 JSON 格式输出（不要包含任何 Markdown 标记）：
    {
      "title": "提炼的标题",
      "category": "领域标签",
      "points": ["要点1", "要点2", "要点3"],
      "quote": "金句内容",
      "color_theme": "blue"
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
    system: `你是一个顶尖的 HR 专家和简历优化师。你的任务是将用户提供的杂乱、口语化的个人经历内容提炼并转化为专业、结果导向的结构化简历数据。
    优化要求：
    1. 术语专业化：将“写代码”优化为“主导核心架构开发”、“参与性能调优”；将“卖东西”优化为“负责渠道拓展与销售转化”。
    2. 结果导向：尽可能在描述中体现数据或成果（如：提升了 20% 效率、节省了 10% 成本）。
    3. 个人总结：写一段富有竞争力的专业总结，突出用户的核心竞争力。
    
    请按以下 JSON 格式输出（不要包含任何 Markdown 标记）：
    {
      "name": "姓名",
      "title": "专业职业头衔",
      "summary": "专业总结（3-5句话）",
      "experience": [
        { "company": "公司名", "role": "专业职位", "period": "时间周期", "desc": ["专业化描述1", "专业化描述2"] }
      ],
      "education": [
        { "school": "学校名称", "degree": "学位", "period": "时间周期" }
      ],
      "skills": ["专业技能1", "专业技能2"],
      "color_theme": "blue | slate | emerald | violet"
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
        title: "内容提炼提示",
        category: "系统提示",
        points: ["输入内容可能过短或格式过于特殊", "AI 暂时无法从当前文本中提取结构化要点", "建议尝试增加内容长度或更换一段更完整的文字", "确保输入内容不包含过多的乱码或干扰信息"],
        quote: "换个姿势，再试一次",
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

