# Toolbox - 极简 AI 办公工具箱 🚀

> **专为办公小白设计的极简 AI 工具集。不谈技术，只解难题。**

Toolbox 是一个集成多种 AI 能力的实用工具平台，旨在通过“针对单个场景”的极简设计，解决办公领域中最常见、最琐碎的痛点。

🔗 **访问地址**: [toolbox.apexcosmos.com](https://toolbox.apexcosmos.com)

---

## ✨ 核心工具矩阵

平台目前已上线 7 大王牌工具，涵盖办公、学习、创作全场景：

### 🛠️ 进阶生产力 (Intermediate)
*   **AI 思维导图**：输入一段文字，AI 自动理清逻辑层级并生成精美脑图，支持一键导出图片。
*   **AI 极速简历**：输入零散的个人经历，AI 自动提炼优化并生成商务风格的简历图。
*   **AI 知识卡片**：将长文章或心得感悟提炼为精美的、可分享的社交媒体知识卡片。

### ⚡ 轻量高效率 (Lightweight)
*   **AI 网页总结 (Advanced)**：输入任意网页或公众号链接，AI 帮你快速提炼核心内容与结论。
*   **AI 汇报/周报生成器**：输入零散的工作点，自动重组为逻辑严密、专业正式的日报/周报。
*   **AI Excel 助手**：用口语描述需求，直接获取准确的 Excel 公式及逻辑说明。
*   **AI 提问助手**：将简单想法转化为高质量、结构化的 AI 提示词（Prompt）。

---

## 🛠️ 技术架构

Toolbox 采用现代全栈技术栈构建，确保极致的响应速度与稳定性：

*   **前端框架**: [Next.js 14](https://nextjs.org/) (App Router)
*   **样式/UI**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **后端/鉴权**: [Supabase](https://supabase.com/) (Auth + PostgreSQL)
*   **AI 模型**: [MiniMax M2.5](https://platform.minimax.io/) (高性能国产大模型)
*   **渲染技术**: [Mermaid.js](https://mermaid.js.org/) (脑图) + [html-to-image](https://github.com/bubkoo/html-to-image) (图片导出)

---

## 📈 商业化设计

*   **极速部署**: 适配 Vercel 自动化部署。
*   **额度管理**: 集成 Supabase 实时统计用户使用次数，支持免费额度限制。
*   **变现准备**: 预留 Lemon Squeezy 支付接口，支持未来订阅制升级。

---

## 🤝 商务合作与联系

如果您有任何合作意向、定制化需求或功能建议，欢迎随时联系：

📧 **Email**: [zevizhang@gmail.com](mailto:zevizhang@gmail.com)

---

## 🚀 极速启动 (本地开发)

```bash
# 安装依赖
npm install

# 配置环境变量 (.env.local)
# MINIMAX_API_KEY=xxx
# NEXT_PUBLIC_SUPABASE_URL=xxx
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 启动项目
npm run dev
```

---

© 2026 Toolbox - [toolbox.apexcosmos.com](https://toolbox.apexcosmos.com)
