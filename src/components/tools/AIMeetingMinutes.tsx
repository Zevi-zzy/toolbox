"use client";

import { useState } from "react";
import { MessageSquare, Copy, Check, Loader2, ArrowLeft, ClipboardList, PenLine } from "lucide-react";
import Link from "next/link";

export default function AIMeetingMinutes() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/meeting-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "整理失败");

      setResult(data.minutes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
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
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <ClipboardList className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 会议纪要</h1>
          <p className="text-gray-500 text-sm">将零碎的谈话记录、语音稿或随手记下的笔记，整理成标准的商务会议纪要。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">原始笔记 / 录音稿</label>
            <span className="text-xs text-gray-400">支持长篇文字输入</span>
          </div>
          <textarea
            className="w-full h-[450px] p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
            placeholder="在这里粘贴会议过程中的笔记或语音转文字的草稿。
例如：
张三说要下周上线 A 项目
李四觉得服务器压力可能大，要测压
王五同意了，让赵六明天下午两点开个技术评审会..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenLine className="w-5 h-5" />}
            {loading ? "正在整理逻辑与待办..." : "一键生成标准纪要"}
          </button>
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">标准纪要方案</label>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "已复制" : "复制全部"}
              </button>
            )}
          </div>
          <div className="w-full h-[530px] p-5 border border-gray-200 rounded-3xl bg-gray-50 overflow-auto text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner prose prose-sm max-w-none">
            {result || (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                <ClipboardList className="w-10 h-10 mb-2" />
                <p className="text-sm">生成的标准纪要将在这里展示</p>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
