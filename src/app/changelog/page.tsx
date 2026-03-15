"use client";

import { ArrowLeft, Rocket, Zap, Box, ShieldCheck, Globe, Code } from "lucide-react";
import Link from "next/link";

const logs = [
  {
    version: "V0.1.1",
    date: "2026-03-15",
    title: "生态化升级：API & Skills 集成",
    description: "全面开放 Toolbox AI 能力，支持第三方集成与 AI Agent 扩展。",
    highlights: [
      {
        icon: Code,
        text: "开放 API V1：支持通过 API Key 直接调用所有 AI 工具能力。"
      },
      {
        icon: Box,
        text: "Skills 插件化：自动生成 OpenAPI Manifest，支持一键导入 GPTs / Claude。"
      },
      {
        icon: ShieldCheck,
        text: "开发者中心：上线 API 密钥管理系统，支持自主创建与停用。"
      },
      {
        icon: Zap,
        text: "用量看板：在导航栏实时显示免费额度消耗情况。"
      }
    ]
  },
  {
    version: "V0.1.0",
    date: "2026-03-14",
    title: "初始架构版本：7 大王牌工具上线",
    description: "Toolbox 正式发布，确立了专为办公小白设计的极简 AI 工具箱定位。",
    highlights: [
      {
        icon: Rocket,
        text: "全能矩阵：上线思维导图、极速简历、网页总结等 7 个核心办公工具。"
      },
      {
        icon: Globe,
        text: "跨端体验：基于 Next.js 14 构建，支持全设备响应式访问。"
      },
      {
        icon: ShieldCheck,
        text: "用户系统：集成 Supabase Auth，支持 GitHub 一键登录。"
      }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">更新日志</h1>
        <p className="text-gray-500 text-lg">见证 Toolbox 的每一次进化</p>
      </div>

      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {logs.map((log, index) => (
          <div key={log.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 top-0">
              <Rocket className="w-5 h-5" />
            </div>
            
            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded-full">
                    {log.version}
                  </span>
                  <time className="text-sm font-bold text-gray-400">{log.date}</time>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{log.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{log.description}</p>
              
              <ul className="space-y-4">
                {log.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-gray-50 rounded-lg">
                      <item.icon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-sm text-gray-400">
          更多精彩功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  );
}
