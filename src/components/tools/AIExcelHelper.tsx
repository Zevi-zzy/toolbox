"use client";

import { useState } from "react";

import { FileSpreadsheet, Copy, Check, Loader2, ArrowLeft, Lightbulb, Code, Box, Key } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIExcelHelper() {
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "生成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("浏览器不支持流式传输");

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResult = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          accumulatedResult += chunk;
          setResult(accumulatedResult);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Excel 助手</h1>
            <p className="text-gray-500 text-sm">描述你的需求，我帮你写出专业的 Excel 公式</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("ui")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "ui" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Box className="w-4 h-4" />
            网页界面
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "api" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Code className="w-4 h-4" />
            API & Skills
          </button>
        </div>
      </div>

      {activeTab === "ui" ? (
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
                  onClick={() => copyToClipboard(result)}
                  className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "已复制" : "复制全部"}
                </button>
              )}
            </div>
            <div className="w-full h-[400px] p-4 border border-gray-200 rounded-2xl bg-gray-50 overflow-auto text-gray-700 prose prose-sm max-w-none">
              {result ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 opacity-20" />
                  <p className="text-sm">在这里展示 AI 生成的公式和说明</p>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              API 调用 (V1)
            </h3>
            <p className="text-sm text-slate-400 mb-6">您可以在您的应用中直接通过 API 调用此工具。</p>
            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-2xl text-xs font-mono text-blue-300 overflow-x-auto relative group">
                <button 
                  onClick={() => copyToClipboard(`curl -X POST https://toolbox.apexcosmos.com/api/v1/tools/excel-helper \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{ "prompt": "计算A1和B1的和" }'`)}
                  className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="w-3 h-3 text-white" />
                </button>
{`curl -X POST https://toolbox.apexcosmos.com/api/v1/tools/excel-helper \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{ "prompt": "计算A1和B1的和" }'`}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-orange-500" />
              Skills 安装 (GPTs / Claude)
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              将此工具作为“技能”安装到 OpenAI GPTs 或 Claude Projects 中。
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/api/v1/tools/excel-helper/manifest" 
                target="_blank"
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                <Code className="w-4 h-4" />
                查看 OpenAPI JSON
              </a>
              <Link 
                href="/dashboard/developer"
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                <Key className="w-4 h-4" />
                获取 API Key
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
