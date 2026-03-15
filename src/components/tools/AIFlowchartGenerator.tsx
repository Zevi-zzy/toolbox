"use client";

import { useState, useEffect, useRef } from "react";
import { GitBranch, Download, Loader2, ArrowLeft, RefreshCcw, Layout } from "lucide-react";
import Link from "next/link";
import mermaid from "mermaid";
import { toPng } from "html-to-image";

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#fff',
    primaryBorderColor: '#2563eb',
    lineColor: '#94a3b8',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#fff',
  },
  securityLevel: 'loose',
  fontFamily: 'PingFang SC',
});

export default function AIFlowchartGenerator() {
  const [content, setContent] = useState("");
  const [flowchartCode, setFlowchartCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setFlowchartCode("");
    setIsRendered(false);

    try {
      const response = await fetch("/api/ai/generate-flowchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      setFlowchartCode(data.flowchartCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const renderMermaid = async () => {
      if (flowchartCode && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          const { svg } = await mermaid.render('flowchart-svg-' + Date.now(), flowchartCode);
          containerRef.current.innerHTML = svg;
          setIsRendered(true);
          setError("");
        } catch (err) {
          console.error("Mermaid 渲染错误:", err);
          setError("流程图语法渲染失败，请尝试重新生成。");
        }
      }
    };

    renderMermaid();
  }, [flowchartCode]);

  const handleDownload = async () => {
    if (!containerRef.current) return;

    try {
      const dataUrl = await toPng(containerRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      });
      const link = document.createElement("a");
      link.download = `flowchart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("下载失败:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <GitBranch className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 流程图</h1>
          <p className="text-gray-500 text-sm">输入逻辑描述或业务步骤，AI 将自动为你绘制精美的流程图。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* 输入区域 */}
        <div className="xl:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">逻辑或流程描述</label>
            <textarea
              className="w-full h-[500px] p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
              placeholder="在这里粘贴流程描述。
例如：
用户在首页点击登录，跳转到登录页。
如果已有账号，输入账号密码，验证通过后跳转到仪表盘。
如果没有账号，点击注册，填写信息，注册成功后跳转到登录页。"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitBranch className="w-5 h-5" />}
            {loading ? "正在绘制流程中..." : "一键生成流程图"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* 预览区域 */}
        <div className="xl:col-span-8 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">图表预览</span>
            {isRendered && (
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerate} 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="重新生成"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  保存为图片
                </button>
              </div>
            )}
          </div>

          <div className="w-full h-[600px] bg-white rounded-3xl border border-gray-100 shadow-inner flex items-center justify-center overflow-auto p-8 relative">
            <div 
              ref={containerRef} 
              className="w-full h-full flex items-center justify-center"
            >
              {!flowchartCode && !loading && (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <GitBranch className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-sm">生成的流程图将在这里展示</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center text-blue-600">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-sm font-medium">AI 正在分析逻辑结构...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
            <div className="flex gap-2">
              <Layout className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 leading-relaxed">
                流程图采用 Mermaid 引擎渲染。如果绘制效果不理想，请尝试在输入时使用更清晰的步骤描述（如：第一步...第二步...或者 如果...则...）。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
