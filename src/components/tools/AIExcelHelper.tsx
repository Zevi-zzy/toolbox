"use client";

import { useState } from "react";
import { FileSpreadsheet, Copy, Check, Loader2, ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function AIExcelHelper() {
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
      const response = await fetch("/api/ai/excel-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      setResult(data.result);
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
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Excel 助手</h1>
          <p className="text-gray-500 text-sm">描述你的需求，我帮你写出专业的 Excel 公式</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">需求描述</label>
            <span className="text-xs text-gray-400">请尽量描述清楚对应的列或单元格</span>
          </div>
          <textarea
            className="w-full h-64 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none bg-white shadow-sm"
            placeholder="例如：帮我写个公式，如果 A1 单元格里的日期大于今天，就显示‘未到期’，否则显示‘已到期’。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            {loading ? "正在生成..." : "生成公式"}
          </button>
          
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-1">提问建议</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                描述越具体越准确。例如：“把 A 列和 B 列相加”、“查找 B2 对应的数据表 D:E 的值”等。
              </p>
            </div>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">解答方案</label>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "已复制" : "复制全部"}
              </button>
            )}
          </div>
          <div className="w-full h-[400px] p-4 border border-gray-200 rounded-2xl bg-gray-50 overflow-auto text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
            {result || (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <FileSpreadsheet className="w-8 h-8 opacity-20" />
                <p className="text-sm">在这里展示 AI 生成的公式和说明</p>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
