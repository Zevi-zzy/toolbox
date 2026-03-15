"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon, Loader2, ArrowLeft, Copy, Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AIArticleSummary() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/ai/article-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "总结失败");

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
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
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <FileText className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">AI 网页总结</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider">高级</span>
          </div>
          <p className="text-gray-500 text-sm">输入文章链接，AI 帮你快速提炼核心内容与结论。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="输入网页或公众号文章链接..."
              className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            onClick={handleSummarize}
            disabled={loading || !url.trim()}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "正在深度阅读中..." : "开始一键总结"}
          </button>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>

        {/* 输出区域 */}
        {summary && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">阅读笔记 (提炼完成)</label>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "已复制" : "复制全文"}
              </button>
            </div>
            <div className="w-full min-h-[300px] p-8 border border-gray-200 rounded-3xl bg-gray-50 text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner prose prose-purple max-w-none">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
