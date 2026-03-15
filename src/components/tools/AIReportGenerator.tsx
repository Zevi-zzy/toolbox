"use client";

import { useState } from "react";
import { MessageSquare, Copy, Check, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIReportGenerator() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"daily" | "weekly">("weekly");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setReport("");

    try {
      const response = await fetch("/api/ai/report-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "生成失败");
      }

      // 触发用量更新事件
      window.dispatchEvent(new CustomEvent('usage-updated'));

      const reader = response.body?.getReader();
      if (!reader) throw new Error("浏览器不支持流式传输");

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedReport = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          accumulatedReport += chunk;
          setReport(accumulatedReport);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report);
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
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 汇报/周报生成器</h1>
          <p className="text-gray-500 text-sm">输入工作内容碎弹，我帮你生成逻辑严密、专业的正式汇报。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setType("weekly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                type === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              周报模式
            </button>
            <button
              onClick={() => setType("daily")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                type === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              日报模式
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">工作碎弹 (输入本周完成的内容点)</label>
            <textarea
              className="w-full h-80 p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
              placeholder="例如：
- 完成了 A 项目的方案设计
- 协调了 B 部门的开发接口
- 修改了 3 个已知的 Bug
- 下周准备进行压力测试"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "正在重组逻辑..." : "生成汇报内容"}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">汇报方案 (可直接复制)</label>
            {report && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "已复制" : "复制全部"}
              </button>
            )}
          </div>
          <div className="w-full h-[400px] p-5 border border-gray-200 rounded-3xl bg-gray-50 overflow-auto text-gray-700 leading-relaxed shadow-inner prose prose-sm max-w-none">
            {report ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                <MessageSquare className="w-10 h-10 mb-2" />
                <p className="text-sm">等待生成逻辑严密的汇报...</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-600 leading-relaxed">
              💡 **AI 建议**：
              汇报要体现【产出】而非【过程】。AI 会自动帮你把“做了 A 项目”优化为“主导 A 项目方案落地，达成 X 目标”。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
