const fs = require('fs');
const path = require('path');

// Load API KEY from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/MINIMAX_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error('Error: MINIMAX_API_KEY not found in .env.local');
  process.exit(1);
}

// Actual prompts from ai.ts
const toolPrompts = {
  'excel-helper': {
    system: `你是一个精通 Excel 和 Google Sheets 的高级数据分析专家。
    你的任务是根据用户的口语化描述，编写出准确特 Excel 公式或 VBA 宏。
    输出要求：
    1. 直接给出公式（用代码块包裹）。
    2. 简要说明公式的逻辑（小白也能听懂的话）。
    3. 如果有多种实现方式，提供最简单的一种。
    4. 语气要专业且亲切，适合办公小白。`,
    user: (prompt) => `我的需求是：\n\n${prompt}`,
    test_input: '计算 A1 到 A10 的平均值',
    validate: (res) => res.includes('AVERAGE') || res.includes('=')
  },
  'optimize-prompt': {
    system: '你是一个专业的 Prompt 工程师。你的任务是将用户提供的简单描述优化成一个高质量、结构清晰、指令明确的 AI 提示词。',
    user: (prompt) => `请优化以下提示词：\n\n${prompt}`,
    test_input: '帮我写一个关于秋天的故事',
    validate: (res) => res.length > 50
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
    user: (content) => `请为以下内容生成知识卡片：\n\n${content}`,
    test_input: '量子纠缠是指两个或多个粒子以一种方式相互连接，无论它们相隔多远，一个粒子的状态都会立即影响另一个粒子的状态。',
    is_json: true,
    validate: (data) => data.title && data.points && Array.isArray(data.points)
  },
  'report-gen': {
    system: (type = 'weekly') => type === 'weekly' 
      ? '你是一个专业的职场导师。你的任务是根据用户提供的工作内容，整理成逻辑严密、表达清晰、富有专业感的周报。包含本周工作总结、遇到的问题、下周计划。'
      : '你是一个高效率的行政主管。你的任务是根据用户提供的工作内容，整理成精炼、准确的日报。包含今日工作、明日计划。',
    user: (content) => `工作内容：\n\n${content}`,
    test_input: '1. 完成了登录页面开发；2. 修复了3个BUG；3. 下周准备对接支付接口。',
    validate: (res) => res.includes('总结') || res.includes('计划')
  },
  'meeting-minutes': {
    system: `你是一个极其专业、细致的企业行政秘书。你的任务是将一段杂乱的会议记录整理成标准的、可执行的会议纪要（Markdown 格式）。
    包含以下部分：
    1. 会议主题
    2. 核心讨论要点
    3. 形成的决议
    4. 待办事项（Action Items）及责任人`,
    user: (content) => `原始会议记录：\n\n${content}`,
    test_input: '张三说我们要提高效率，李四建议用飞书。王五同意了，并说明天就开始试用。',
    validate: (res) => res.includes('会议主题') || res.includes('核心讨论要点')
  },
  'generate-mindmap': {
    system: `你是一个专业的思维导图专家。你的任务是根据用户提供的内容，提取核心逻辑和层级关系，并生成 Markdown 格式的列表。
    
    输出要求：
    1. 使用 Markdown 的多级列表（- 或 *）来表示层级。
    2. 第一行必须是主题，使用 # 标题格式。
    3. 后续层级使用列表缩进。
    4. 仅输出 Markdown 内容，不要包含任何解释文字或 Markdown 代码块标记。
    
    示例格式：
    # 核心主题
    - 分支1
      - 子分支1.1
      - 子分支1.2
    - 分支2
      - 子分支2.1`,
    user: (content) => `内容：\n\n${content}`,
    test_input: 'AI的发展历程：从图灵测试到深度学习，再到大语言模型，AI正在改变世界。',
    validate: (res) => res.includes('#') && res.includes('- ')
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
    user: (content) => `内容：\n\n${content}`,
    test_input: '我叫张三，在阿里巴巴做了3年开发，熟悉Java。毕业于清华大学。',
    is_json: true,
    validate: (data) => data.name && data.experience && Array.isArray(data.experience)
  },
  'article-summary': {
    system: '你是一个高效的文章阅读助手。你的任务是阅读用户提供的网页文本内容，提炼出核心摘要。要求：1. 提炼文章标题；2. 列出 3-5 个核心观点；3. 给出主要结论或建议。语气要客观中立，条理清晰。',
    user: (content) => `内容：\n\n${content}`,
    test_input: 'OpenAI 发布的 Sora 模型引起了全球关注。它能够根据文字描述生成长达一分钟的视频，画质逼真且遵循物理规律。这标志着视频生成领域的一个巨大飞跃。',
    validate: (res) => res.length > 20
  },
  'generate-flowchart': {
    system: `你是一个专业的流程图架构师。你的任务是将用户提供的逻辑描述、业务流程或步骤说明转化为 Mermaid 语法的 flowchart。
    
    输出要求：
    1. 仅输出 Mermaid 语法，不要包含任何解释文字或 Markdown 代码块标记。
    2. 使用 graph TD (从上到下) 或 graph LR (从左到右) 布局。
    3. 节点描述要简练，使用矩形 [ ]、圆角矩形 ( ) 或菱形 { } 来表示不同类型的节点。
    4. 确保逻辑连线准确。
    
    示例格式：
    graph TD
      A[开始] --> B{是否通过?}
      B -- 是 --> C[执行操作]
      B -- 否 --> D[结束]
      C --> D`,
    user: (content) => `内容：\n\n${content}`,
    test_input: '用户登录流程：输入账号密码 -> 验证码校验 -> 登录成功或失败',
    validate: (res) => res.includes('graph') || res.includes('flowchart')
  }
};

async function callMiniMax(messages, responseFormat = null) {
  const url = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
  const body = {
    model: 'MiniMax-M2.5',
    messages,
    temperature: 0.7,
  };
  if (responseFormat) body.response_format = responseFormat;

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

function extractJson(text) {
  // Try to find JSON block
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1];
  }
  // Try to find first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text;
}

async function runTests() {
  console.log('--- 整体测试开始 (使用真实 Prompt) ---');
  const results = [];

  for (const [toolId, config] of Object.entries(toolPrompts)) {
    console.log(`Testing ${toolId}...`);
    try {
      const responseFormat = config.is_json ? { type: "json_object" } : null;
      const systemContent = typeof config.system === 'function' ? config.system() : config.system;
      const content = await callMiniMax([
        { role: 'system', content: systemContent },
        { role: 'user', content: config.user(config.test_input) },
      ], responseFormat);

      let parsedData = content;
      if (config.is_json) {
        const jsonStr = extractJson(content);
        try {
          parsedData = JSON.parse(jsonStr);
        } catch (e) {
          results.push({ toolId, status: 'FAIL', error: 'JSON Parse Error: ' + e.message, raw: content });
          continue;
        }
      }

      const isValid = config.validate(parsedData);
      results.push({ toolId, status: isValid ? 'PASS' : 'FAIL', output: content.substring(0, 100) + '...' });
    } catch (e) {
      results.push({ toolId, status: 'ERROR', error: e.message });
    }
  }

  console.log('\n--- 测试结果汇总 ---');
  console.table(results);
}

runTests();
