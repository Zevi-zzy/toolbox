"use client";

import { useState, useEffect, useRef } from "react";
import { Network, Download, Loader2, ArrowLeft, RefreshCcw, Layout, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import Link from "next/link";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { toPng } from "html-to-image";

export default function AIMindmapGenerator() {
  const transformer = useRef<Transformer | null>(null);
  const [content, setContent] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transformer.current = new Transformer();
  }, []);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setMarkdown("");
    setIsRendered(false);

    try {
      const response = await fetch("/api/ai/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      // 触发用量更新事件
      window.dispatchEvent(new CustomEvent('usage-updated'));

      const code = data.mindmapCode;
      // 清理可能存在的代码块标记
      const cleanedMarkdown = code.replace(/```markdown\n?|```/g, "").trim();
      setMarkdown(cleanedMarkdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (markdown && svgRef.current && transformer.current) {
      try {
        const { root } = transformer.current.transform(markdown);
        
        // 如果已经存在实例，则更新，否则创建
        if (mmRef.current) {
          mmRef.current.setData(root);
          mmRef.current.fit();
        } else {
          mmRef.current = Markmap.create(svgRef.current, {
            autoFit: true,
            duration: 500,
          }, root);
        }
        setIsRendered(true);
        setError("");
      } catch (err) {
        console.error("Markmap 渲染错误:", err);
        setError("脑图渲染失败，请尝试重新生成。");
      }
    }
  }, [markdown]);

  const handleDownload = async () => {
    if (!containerRef.current || !mmRef.current) return;

    try {
      // 在下载前先 fit 一下确保完整
      await mmRef.current.fit();
      
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

  const handleZoomIn = () => mmRef.current?.rescale(1.2);
  const handleZoomOut = () => mmRef.current?.rescale(0.8);
  const handleFit = () => mmRef.current?.fit();

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
          <h1 className="text-2xl font-bold text-gray-900">AI 思维导图 (XMind 风格)</h1>
          <p className="text-gray-500 text-sm">输入一段文字，AI 将自动分析层级并生成精美的交互式脑图。</p>
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
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">导图预览 (可缩放/拖拽)</span>
              {isRendered && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                  <button onClick={handleZoomIn} className="p-1.5 hover:bg-white rounded shadow-sm transition-all" title="放大"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded shadow-sm transition-all" title="缩小"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={handleFit} className="p-1.5 hover:bg-white rounded shadow-sm transition-all" title="自适应"><Maximize className="w-4 h-4 text-gray-600" /></button>
                </div>
              )}
            </div>
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

          <div 
            ref={containerRef}
            className="w-full h-[600px] bg-white rounded-3xl border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative"
          >
            <svg 
              ref={svgRef} 
              className="w-full h-full touch-none"
              style={{ outline: 'none' }}
            />
            
            {!markdown && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                <Network className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-sm">生成的 XMind 风格脑图将在这里展示</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600 bg-white/80 backdrop-blur-sm z-10">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-sm font-medium">AI 正在构建知识脑图...</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
            <div className="flex gap-2">
              <Layout className="w-4 h-4 text-gray-400" />
              <div className="text-xs text-gray-500 leading-relaxed">
                <p className="font-bold mb-1">交互说明：</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>鼠标滚轮或双指缩放脑图大小</li>
                  <li>左键点击并拖拽可移动位置</li>
                  <li>点击分支末端的圆点可收起/展开子节点</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .markmap {
          font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        }
        .markmap-node {
          cursor: pointer;
        }
        .markmap-node div {
          padding: 4px 8px;
          border-radius: 4px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .markmap-link {
          stroke-width: 2px;
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
}
