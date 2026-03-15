"use client";

import { Search, MessageCircle, BookOpen, Zap, Shield, Mail, FileText, Layout, FileSpreadsheet, Wand2 } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      question: "Toolbox 是什么？",
      answer: "Toolbox 是一个专为办公小白设计的极简 AI 工具箱。它集成了网页总结、思维导图、流程图绘制、简历优化、Excel 助手等 9 大核心工具，旨在通过“一键式”体验解决最琐碎的办公痛点。"
    },
    {
      question: "AI 网页总结支持哪些平台？",
      answer: "我们的网页总结工具针对微信公众号文章、Mintlify/VitePress 等主流技术文档、以及各类新闻门户进行了深度优化。只需输入 URL，AI 即可精准抓取正文并提炼 3-5 个核心观点。"
    },
    {
      question: "生成的思维导图和流程图可以下载吗？",
      answer: "可以。Toolbox 使用标准的 Mermaid 和 Markmap 技术渲染图形，您可以实时预览生成效果，并一键导出为高清 PNG 图片，方便插入 PPT 或分享到社交媒体。"
    },
    {
      question: "工具输出的格式是怎样的？",
      answer: "所有工具均支持标准的 Markdown 渲染。Excel 助手会以代码块形式给出公式，会议纪要和工作汇报会进行精美的排版（加粗、列表、标题等），确保结果“拿来即用”。"
    },
    {
      question: "免费版额度用完了怎么办？",
      answer: "免费用户享有 10 次初始额度。您可以随时通过“价格”页面升级为 Pro 会员，解锁 1000 次/月的超高限额、开发者 API 调用权限以及更多高级功能。您的用量在每次使用后都会在导航栏实时更新。"
    },
    {
      question: "什么是 API & Skills 集成？",
      answer: "通过开发者中心（Dashboard），Pro 用户可以生成 API 密钥，将 Toolbox 的 AI 能力集成到自己的 Agent 或 GPTs 中。我们还提供了符合 OpenAPI 规范的 Manifest 链接，支持一键安装技能。"
    }
  ];

  const categories = [
    { icon: BookOpen, title: "入门指南", desc: "快速了解如何开始使用 Toolbox" },
    { icon: Zap, title: "Pro 权益", desc: "了解订阅方案与会员专属功能" },
    { icon: Shield, title: "账号安全", desc: "管理您的账户与隐私设置" },
    { icon: Mail, title: "联系我们", desc: "寻求人工支持或商务合作咨询" }
  ];

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
            帮助中心
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto opacity-90">
            遇到问题了？别担心，我们在这里为您提供全方位的支持。
          </p>
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-blue-300" />
            </div>
            <input
              type="text"
              placeholder="搜索关于 Pro 权益、API 密钥、支付等任何疑问..."
              className="block w-full pl-14 pr-6 py-5 border-none rounded-[2rem] bg-white/10 backdrop-blur-md text-white placeholder:text-blue-200 focus:ring-4 focus:ring-white/20 transition-all outline-none text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              常见问题 (FAQ)
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{faq.question}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                需要更多帮助？
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                如果您在 FAQ 中没有找到答案，或者有任何功能建议，请随时通过以下方式联系我们。
              </p>
              <a 
                href="mailto:zevizhang@gmail.com"
                className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                发送邮件反馈
              </a>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">快捷链接</h3>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="/pricing" className="hover:text-blue-600 flex items-center gap-2">价格与订阅方案</Link></li>
                <li><Link href="/dashboard/developer" className="hover:text-blue-600 flex items-center gap-2">开发者 API 管理</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 flex items-center gap-2">用户服务协议</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 flex items-center gap-2">隐私保护政策</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
