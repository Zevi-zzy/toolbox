"use client";

import { X, Copy, Check, Terminal, ShieldAlert } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: string;
    name: string;
    description: string;
  } | null;
  isPro: boolean;
}

export default function SkillsModal({ isOpen, onClose, tool, isPro }: SkillsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tool) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://toolbox.apexcosmos.com';
  
  const installationPrompt = `你现在拥有一个新的技能：${tool.name}。
功能描述：${tool.description}
调用接口：${origin}/api/v1/tools/${tool.id}
配置说明：请使用 OpenAPI 规范进行配置。Manifest 地址为 ${origin}/api/v1/tools/${tool.id}/manifest。
认证方式：请求头需包含 x-api-key，密钥请在 Toolbox 开发者中心获取。
请严格按照 Manifest 定义的参数进行调用。`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installationPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isPro ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">需要 Pro 会员权限</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Skills 插件化集成属于高级生产力功能，仅限 Pro 会员使用。升级后即可一键获取所有工具的 Agent 安装指令。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pricing" 
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                立即升级 Pro
              </Link>
              <button 
                onClick={onClose}
                className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                稍后再说
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">获取 Skills 安装指令</h2>
                <p className="text-sm text-gray-500">{tool.name}</p>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6">
              <p className="text-xs text-blue-700 leading-relaxed">
                💡 <strong>使用说明</strong>：请复制下方的安装提示词，直接发送给您的 AI Agent（如自定义 GPTs、Claude Project 或其他智能体），它将引导 Agent 完成技能安装与配置。
              </p>
            </div>

            <div className="relative group">
              <pre className="w-full h-64 p-6 bg-gray-900 text-blue-100 rounded-3xl text-sm font-mono whitespace-pre-wrap overflow-auto border border-gray-800 leading-relaxed">
                {installationPrompt}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all backdrop-blur-md"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制指令"}
              </button>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <Link 
                href="/dashboard/developer" 
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                去开发者中心管理 API Key →
              </Link>
              <button 
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-gray-600 text-sm font-bold transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
