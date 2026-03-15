# Toolbox API 测试方案 (API Testing Plan)

本项目致力于通过 MiniMax M2.5 模型为办公小白提供极简的 AI 工具。本测试方案旨在验证各 AI 工具接口的功能性、鲁棒性、合约合规性及响应性能。

---

## 1. 测试范围 (Test Scope)

测试覆盖以下 8 个核心 AI 工具接口：

1.  **AI Excel 助手** (`/api/ai/excel-helper`): 验证公式生成及逻辑解释。
2.  **AI 提示词优化** (`/api/ai/optimize-prompt`): 验证提示词结构化质量。
3.  **AI 知识卡片** (`/api/ai/generate-card`): 验证 JSON 结构化输出及颜色主题选择。
4.  **AI 汇报生成器** (`/api/ai/report-gen`): 验证日报/周报模式切换及逻辑重组。
5.  **AI 会议纪要** (`/api/ai/meeting-minutes`): 验证长文本提炼及待办事项提取。
6.  **AI 思维导图** (`/api/ai/generate-mindmap`): 验证 Mermaid 语法合规性。
7.  **AI 极速简历** (`/api/ai/generate-resume`): 验证复杂简历信息的 JSON 解析及格式。
8.  **AI 网页总结** (`/api/ai/article-summary`): 验证网页正文抓取及内容压缩质量。

---

## 2. 测试策略 (Testing Strategy)

### 2.1 功能性测试 (Functional Testing)
- **Positive Testing**: 使用标准输入，验证 AI 输出是否符合预期（如 Excel 公式正确、JSON 结构完整）。
- **Negative Testing**: 输入空值、过长文本或非法字符，验证 API 错误处理（400/500 状态码）。
- **Contract Testing**: 针对 `generate-card` 和 `generate-resume` 等返回 JSON 的接口，验证其是否符合前端定义的 TypeScript Interface。

### 2.2 鲁棒性测试 (Robustness Testing)
- **Code Block Cleaning**: 验证后端是否能自动剔除 AI 返回的多余 Markdown 标记（如 ` ```mermaid `）。
- **Markdown Rendering**: 验证前端是否能正确渲染流式返回的 Markdown 内容。

### 2.3 性能与限流测试 (Performance & Rate Limiting)
- **Latency**: 监控 MiniMax 模型的平均响应时长。
- **Usage Limit**: 验证 Supabase 鉴权下的免费额度（Usage Count）限制逻辑。

---

## 3. 测试工具与环境 (Tools & Environment)

- **测试脚本**: `scripts/test-tools.js` (Node.js 环境下运行，直接调用 MiniMax API)。
- **环境配置**: 需在 `.env.local` 中配置 `MINIMAX_API_KEY`。
- **运行方式**: `node scripts/test-tools.js`

---

## 4. 自动化测试脚本逻辑 (Automation Logic)

测试脚本通过以下步骤验证工具：
1.  **初始化**: 从 `.env.local` 加载 API 密钥。
2.  **构造 Payload**: 根据工具类型（Streaming 或 JSON Object）构造请求。
3.  **调用 API**: 模拟前端请求逻辑调用 MiniMax V2 接口。
4.  **验证**:
    - 针对 **文本/流式工具**: 检查是否有有效文本返回。
    - 针对 **Mermaid 工具**: 验证是否包含 `mindmap` 关键字。
    - 针对 **JSON 工具**: 使用 `JSON.parse` 验证格式，并检查核心字段。

---

## 5. 预期结果与通过标准 (Success Criteria)

| 工具名称 | 关键通过指标 |
| :--- | :--- |
| Excel Helper | 必须包含代码块包裹的公式。 |
| Mindmap | 必须输出合法的 Mermaid mindmap 语法。 |
| Card / Resume | 必须返回可解析的 JSON，且包含预定义的字段。 |
| Streaming Tools | 前端必须正确渲染 Markdown 样式（不再显示原始符号）。 |

---

## 6. 风险评估 (Risk Assessment)

- **API Key 无效**: 脚本会自动检测并报错。
- **AI 幻觉**: 针对不规范输出，后端已增加 `replace(/```|```mermaid/g, '')` 等正则清洗。
- **网页抓取失效**: `article-summary` 可能因网页反爬虫或 JS 渲染导致正文抓取失败，已增加降级提醒。
