"use client";

import { useState } from "react";
import { Wand2, Copy, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIPromptOptimizer() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;

    setLoading(true);
    setError("");
    setOptimizedPrompt("");

    try {
      const response = await fetch("/api/ai/optimize-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "优化失败，请稍后重试");
      }

      // 触发用量更新事件
      window.dispatchEvent(new CustomEvent('usage-updated'));

      const reader = response.body?.getReader();
      if (!reader) throw new Error("浏览器不支持流式传输");

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedPrompt = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          accumulatedPrompt += chunk;
          setOptimizedPrompt(accumulatedPrompt);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Wand2 className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 提示词优化器</h1>
          <p className="text-gray-500 text-sm">由 MiniMax M2.5 提供动力，将简单想法转为高质量 Prompt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">原始提示词</label>
          <textarea
            className="w-full h-64 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm"
            placeholder="例如：帮我写一个减肥计划"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
          />
          <button
            onClick={handleOptimize}
            disabled={loading || !inputPrompt.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? "优化中..." : "立即优化"}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">优化结果</label>
            {optimizedPrompt && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "已复制" : "复制全部"}
              </button>
            )}
          </div>
          <div className="w-full h-64 p-4 border border-gray-200 rounded-2xl bg-gray-50 overflow-auto text-gray-700 prose prose-sm max-w-none">
            {optimizedPrompt ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedPrompt}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Wand2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">等待优化...</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 mb-1">优化秘籍</h4>
            <p className="text-xs text-blue-600 leading-relaxed">
              优化后的 Prompt 会自动补充：
              <br />• 角色背景（让 AI 更有代入感）
              <br />• 具体约束（避免生成垃圾信息）
              <br />• 期望格式（直接拿来即用）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
