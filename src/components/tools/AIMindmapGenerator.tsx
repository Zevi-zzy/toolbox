"use client";

import { useState, useEffect, useRef } from "react";
import { Network, Download, Loader2, ArrowLeft, RefreshCcw, Layout } from "lucide-react";
import Link from "next/link";
import mermaid from "mermaid";
import { toPng } from "html-to-image";

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#3498db',
    primaryTextColor: '#fff',
    primaryBorderColor: '#2980b9',
    lineColor: '#bdc3c7',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#fff',
  },
  securityLevel: 'loose',
  fontFamily: 'PingFang SC',
});

export default function AIMindmapGenerator() {
  const [content, setContent] = useState("");
  const [mindmapCode, setMindmapCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setMindmapCode("");
    setIsRendered(false);

    try {
      const response = await fetch("/api/ai/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      const code = data.mindmapCode;
      // 极致清理：移除可能存在的 markdown 标记、多余空格和解释文字
      let cleanedCode = code
        .replace(/```mermaid\n?|```/g, "")
        .replace(/mindmap\s+root/g, "mindmap\n  root") // 确保 root 在新行
        .trim();
      
      // 检查代码是否以 mindmap 开头
      const formattedCode = cleanedCode.startsWith("mindmap") ? cleanedCode : `mindmap\n${cleanedCode}`;
      setMindmapCode(formattedCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const renderMermaid = async () => {
      if (mindmapCode && containerRef.current) {
        try {
          // 彻底清除容器内容
          containerRef.current.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), mindmapCode);
          containerRef.current.innerHTML = svg;
          setIsRendered(true);
          setError(""); // 成功渲染后清除错误
        } catch (err) {
          console.error("Mermaid 渲染错误:", err);
          setError("导图语法解析失败，正在尝试自动修复并重新渲染...");
          
          // 尝试简单修复：如果是因为没有换行导致的
          if (!mindmapCode.includes('\n')) {
             const fixedCode = mindmapCode.replace(/\s+/g, '\n  ');
             setMindmapCode(fixedCode);
          } else {
             setError("图形渲染失败，请尝试增加描述内容或重新生成。");
          }
        }
      }
    };

    renderMermaid();
  }, [mindmapCode]);

  const handleDownload = async () => {
    if (!containerRef.current) return;

    try {
      // html-to-image 对 SVG 处理有兼容性要求，增加点 padding 效果更好
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
      link.download = `mindmap-${Date.now()}.png`;
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
          <Network className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 思维导图</h1>
          <p className="text-gray-500 text-sm">输入一段文字，AI 将自动分析层级并生成精美的思维导图（脑图）。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* 输入区域 */}
        <div className="xl:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">内容输入 (文字、笔记或文章)</label>
            <textarea
              className="w-full h-[500px] p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
              placeholder="在这里粘贴你想要转换的内容，AI 将自动理清逻辑层级并生成导图。
例如：
被动收入的五个方向：
1. 数字化知识资产：在线课程、电子书
2. 数字资源与模板：Notion模板、PPT模板
3. 视觉素材授权：摄影图、插画
..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Network className="w-5 h-5" />}
            {loading ? "正在解析逻辑..." : "一键生成思维导图"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* 预览区域 */}
        <div className="xl:col-span-8 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">导图预览 (支持下载)</span>
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
              {!mindmapCode && !loading && (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <Network className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-sm">生成的思维导图将在这里展示</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center text-blue-600">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-sm font-medium">AI 正在深度思考中...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
            <div className="flex gap-2">
              <Layout className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 leading-relaxed">
                思维导图是基于 AI 对文本层级的理解自动生成的。如果结构不够理想，请尝试在输入时使用明显的标题、数字列表或更清晰的层级。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
