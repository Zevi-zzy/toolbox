"use client";

import { useState, useRef } from "react";
import { Sparkles, Download, Loader2, ArrowLeft, RefreshCcw, Quote } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";

interface CardData {
  title: string;
  category: string;
  points: string[];
  quote: string;
  color_theme: string;
}

const themeMap: Record<string, { bg: string, accent: string, text: string }> = {
  blue: { bg: "bg-blue-50", accent: "bg-blue-600", text: "text-blue-900" },
  indigo: { bg: "bg-indigo-50", accent: "bg-indigo-600", text: "text-indigo-900" },
  emerald: { bg: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  rose: { bg: "bg-rose-50", accent: "bg-rose-600", text: "text-rose-900" },
  amber: { bg: "bg-amber-50", accent: "bg-amber-600", text: "text-amber-900" },
};

export default function AIKnowledgeCard() {
  const [content, setContent] = useState("");
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      // 触发用量更新事件
      window.dispatchEvent(new CustomEvent('usage-updated'));

      setCardData(data.cardData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `knowledge-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Oops, something went wrong!", err);
    }
  };

  const currentTheme = themeMap[cardData?.color_theme || "blue"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 知识卡片</h1>
          <p className="text-gray-500 text-sm">将长文章或心得一键转化为精美的、可分享的知识卡片</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">输入内容或灵感</label>
            <textarea
              className="w-full h-80 p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
              placeholder="在这里粘贴你读到的好文章、心得体会或是工作笔记，AI 将帮你提炼并排版成卡片。"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "提炼中..." : "生成知识卡片"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* 预览区域 */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">预览效果</span>
            {cardData && (
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerate} 
                  className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
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

          {cardData ? (
            <div 
              ref={cardRef}
              className={`w-[400px] aspect-[3/4] p-8 rounded-[2.5rem] ${currentTheme.bg} flex flex-col relative overflow-hidden shadow-2xl border-4 border-white`}
            >
              {/* 背景装饰 */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${currentTheme.accent} opacity-[0.05] blur-3xl`}></div>
              <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full ${currentTheme.accent} opacity-[0.05] blur-3xl`}></div>

              {/* 分类标签 */}
              <div className="flex mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentTheme.accent} text-white`}>
                  {cardData.category}
                </span>
              </div>

              {/* 标题 */}
              <h2 className={`${cardData.title.length > 20 ? 'text-2xl' : 'text-3xl'} font-black mb-10 ${currentTheme.text} leading-tight line-clamp-3`}>
                {cardData.title}
              </h2>

              {/* 要点列表 */}
              <div className="space-y-6 flex-grow">
                {cardData.points.map((point, i) => (
                  <div key={i} className="flex gap-4">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg ${currentTheme.accent} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {i + 1}
                    </span>
                    <p className={`text-sm font-bold leading-relaxed opacity-80 ${currentTheme.text}`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* 金句 */}
              <div className="mt-8 pt-8 border-t border-gray-200/50 relative">
                <Quote className={`absolute -top-4 -left-2 w-8 h-8 opacity-10 ${currentTheme.text}`} />
                <p className={`text-base font-black italic text-center ${currentTheme.text}`}>
                  “{cardData.quote}”
                </p>
              </div>

              {/* 底部 Logo */}
              <div className="mt-8 pt-4 flex items-center justify-center border-t border-gray-200/30">
                <div className={`w-2 h-2 rounded-full ${currentTheme.accent} mr-2 opacity-50`}></div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                  TOOLBOX.APEXCOSMOS.COM
                </p>
              </div>
            </div>
          ) : (
            <div className="w-[400px] aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
              <Sparkles className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm">生成的卡片将在这里展示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
