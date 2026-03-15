"use client";

import { useState } from "react";
import { Search, Mail, FileSpreadsheet, Wand2, FileText, Layout, MessageSquare, Sparkles, UserCircle, Network } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const tools = [
    {
      id: "ai-summary",
      name: "AI 网页总结",
      description: "输入网页或公众号链接，AI 帮你快速提炼核心内容与结论。",
      icon: FileText,
      category: "效率工具",
      level: "进阶",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/tools/ai-summary",
    },
    {
      id: "ai-video",
      name: "AI 视频分析",
      description: "深度理解视频内容，提取关键画面与摘要。高级功能，即将上线。",
      icon: Layout,
      category: "多媒体",
      level: "高级",
      color: "text-gray-400",
      bgColor: "bg-gray-50",
      href: "#",
      isComingSoon: true,
    },
    {
      id: "ai-mindmap",
      name: "AI 思维导图",
      description: "输入一段文字，AI 自动理清逻辑层级并生成精美脑图。",
      icon: Network,
      category: "效率工具",
      level: "进阶",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/tools/ai-mindmap",
    },
    {
      id: "ai-resume",
      name: "AI 极速简历",
      description: "输入个人信息碎弹，AI 自动优化逻辑并排版成精美简历图。",
      icon: UserCircle,
      category: "办公必备",
      level: "进阶",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/tools/ai-resume",
    },
    {
      id: "ai-card",
      name: "AI 知识卡片",
      description: "一键提取核心观点，生成可分享的精美知识卡片图。",
      icon: Sparkles,
      category: "常用推荐",
      level: "进阶",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      href: "/tools/ai-card",
    },
    {
      id: "ai-prompt",
      name: "AI 提问助手",
      description: "想不出怎么问 AI？输入你的想法，我帮你生成专业的指令。",
      icon: Wand2,
      category: "常用推荐",
      level: "轻量",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      href: "/tools/ai-prompt",
    },
    {
      id: "ai-report",
      name: "AI 汇报/周报生成器",
      description: "输入本周零散的工作点，一键生成逻辑严密、专业的周报或汇报大纲。",
      icon: MessageSquare,
      category: "办公必备",
      level: "轻量",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/tools/ai-report",
    },
    {
      id: "ai-excel",
      name: "AI Excel 助手",
      description: "描述你的需求，我帮你写出复杂的 Excel 公式或宏。",
      icon: FileSpreadsheet,
      category: "效率工具",
      level: "轻量",
      color: "text-green-500",
      bgColor: "bg-green-50",
      href: "/tools/ai-excel",
    },
    {
      id: "ai-ppt",
      name: "AI PPT 大纲",
      description: "输入一个主题，快速生成逻辑严密的 PPT 内容大纲。",
      icon: Layout,
      category: "效率工具",
      level: "轻量",
      color: "text-red-500",
      bgColor: "bg-red-50",
      href: "#",
    },
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === "全部" || tool.level === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          极简 AI <span className="text-blue-600">办公工具箱</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          专为办公小白设计的 AI 工具集。不谈技术，只解难题。
          toolbox.apexcosmos.com 助你效率飞跃。
        </p>
        
        <div className="relative max-w-xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索你想解决的问题，例如：写邮件, Excel 公式..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {["全部", "轻量", "进阶", "高级"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === category 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTools.map((tool) => {
          const CardContent = (
            <div className={`h-full group bg-white p-8 rounded-2xl border border-gray-100 transition-all ${tool.isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center ${!tool.isComingSoon && 'group-hover:scale-110'} transition-transform`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    tool.level === "高级"
                      ? "bg-purple-100 text-purple-700"
                      : tool.level === "进阶" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {tool.level}
                  </span>
                  {tool.isComingSoon && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">即将上线</span>
                  )}
                </div>
              </div>
              <h3 className={`text-xl font-bold text-gray-900 mb-3 ${!tool.isComingSoon && 'group-hover:text-blue-600'} transition-colors`}>
                {tool.name}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm mb-6">
                {tool.description}
              </p>
              {!tool.isComingSoon ? (
                <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  立即体验
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : (
                <div className="text-sm font-bold text-gray-400">敬请期待</div>
              )}
            </div>
          );

          return tool.isComingSoon ? (
            <div key={tool.id}>{CardContent}</div>
          ) : (
            <Link key={tool.id} href={tool.href}>
              {CardContent}
            </Link>
          );
        })}
      </div>
      
      {filteredTools.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">没有找到匹配的工具，换个词试试？</p>
        </div>
      )}
    </div>
  );
}
