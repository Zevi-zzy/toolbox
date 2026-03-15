const fs = require('fs');
const path = require('path');

// 从 .env.local 加载 API KEY
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/MINIMAX_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error('Error: MINIMAX_API_KEY not found in .env.local');
  process.exit(1);
}

const toolPrompts = {
  'excel-helper': {
    system: `你是一个精通 Excel 和 Google Sheets 的高级数据分析专家。你的任务是根据用户的口语化描述，编写出准确的 Excel 公式或 VBA 宏。`,
    user: (prompt) => `我的需求是：\n\n${prompt}`,
    test_input: '计算 A1 到 A10 的平均值'
  },
  'generate-card': {
    system: `你是一个专业的知识卡片设计师。请按以下 JSON 格式输出：{"title": "卡片标题", "category": "类别", "points": ["核心要点1"], "quote": "名言", "color_theme": "blue"}`,
    user: (content) => `请为以下内容生成知识卡片：\n\n${content}`,
    test_input: '量子纠缠的概念。'
  },
  'generate-mindmap': {
    system: `你是一个专业的思维导图专家。生成 Mermaid mindmap 语法。`,
    user: (content) => `内容：\n\n${content}`,
    test_input: 'AI的发展历程：从图灵测试到深度学习。'
  },
};

async function callMiniMax(messages, responseFormat = null) {
  const url = 'https://api.minimax.io/v1/text/chatcompletion_v2';
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
    console.error('API Error details:', JSON.stringify(data, null, 2));
    throw new Error(data.base_resp?.status_msg || 'MiniMax API Error');
  }
  return data.choices[0].message.content;
}

async function runTests() {
  console.log('--- 自动化测试执行 (Toolbox API Tests) ---');
  for (const [toolName, tool] of Object.entries(toolPrompts)) {
    console.log(`\n[Test Case] Tool: ${toolName}`);
    try {
      const responseFormat = toolName === 'generate-card' ? { type: "json_object" } : null;
      const result = await callMiniMax([
        { role: 'system', content: tool.system },
        { role: 'user', content: tool.user(tool.test_input) },
      ], responseFormat);

      console.log('  -> Result Preview:', result.substring(0, 100).replace(/\n/g, ' '));
      
      if (toolName === 'generate-card') {
        JSON.parse(result.replace(/```json\n?|```/g, '').trim());
        console.log('  ✅ JSON 校验通过');
      } else if (toolName === 'generate-mindmap') {
        if (result.includes('mindmap')) console.log('  ✅ Mermaid 语法校验通过');
      } else {
        console.log('  ✅ 响应正常');
      }
    } catch (error) {
      console.error(`  ❌ 测试失败: ${error.message}`);
    }
  }
}

runTests();
