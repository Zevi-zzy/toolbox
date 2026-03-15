"use client";

import { useState, useRef } from "react";
import { UserCircle, Download, Loader2, ArrowLeft, RefreshCcw, Briefcase, GraduationCap, Code } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";

interface ResumeData {
  name: string;
  title: string;
  summary: string;
  experience: { company: string; role: string; period: string; desc: string[] }[];
  education: { school: string; major: string; degree: string }[];
  skills: string[];
  color_theme: string;
}

const themeMap: Record<string, { primary: string, bg: string, text: string, muted: string }> = {
  blue: { primary: "bg-blue-600", bg: "bg-blue-50/30", text: "text-blue-900", muted: "text-blue-700/60" },
  slate: { primary: "bg-slate-800", bg: "bg-slate-50/30", text: "text-slate-900", muted: "text-slate-700/60" },
  emerald: { primary: "bg-emerald-600", bg: "bg-emerald-50/30", text: "text-emerald-900", muted: "text-emerald-700/60" },
  violet: { primary: "bg-violet-600", bg: "bg-violet-50/30", text: "text-violet-900", muted: "text-violet-700/60" },
};

export default function AIResumeGenerator() {
  const [content, setContent] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");

      setResumeData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeRef.current) return;

    try {
      const dataUrl = await toPng(resumeRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `resume-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Oops, something went wrong!", err);
    }
  };

  const currentTheme = themeMap[resumeData?.color_theme || "blue"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <UserCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 极速简历</h1>
          <p className="text-gray-500 text-sm">只需输入零散的个人信息，AI 帮你自动排版并优化出一份精美简历图。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">个人经历/信息碎弹</label>
            <textarea
              className="w-full h-[500px] p-5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm text-gray-600 leading-relaxed"
              placeholder="在这里粘贴你的个人经历。
例如：
姓名：张三
学校：清华大学 计算机专业
经历：2020-2022 在阿里做前端，负责了首页重构...
技能：熟悉 React, Vue, Node.js"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCircle className="w-5 h-5" />}
            {loading ? "正在优化逻辑并排版..." : "一键生成简历图片"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* 预览区域 */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">预览效果</span>
            {resumeData && (
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
                  保存简历图
                </button>
              </div>
            )}
          </div>

          {resumeData ? (
            <div 
              ref={resumeRef}
              className={`w-[450px] min-h-[636px] bg-white rounded-lg flex flex-col shadow-2xl overflow-hidden border border-gray-100 p-0`}
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* 头部 */}
              <div className={`${currentTheme.primary} p-8 text-white`}>
                <h2 className="text-3xl font-black tracking-tight mb-2">{resumeData.name}</h2>
                <p className="text-lg font-bold opacity-90">{resumeData.title}</p>
              </div>

              {/* 内容 */}
              <div className="p-8 space-y-8 flex-grow">
                {/* 个人总结 */}
                <section>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${currentTheme.text} border-b-2 border-gray-100 pb-1 mb-3`}>关于我 / Summary</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{resumeData.summary}</p>
                </section>

                {/* 工作经验 */}
                <section>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${currentTheme.text} border-b-2 border-gray-100 pb-1 mb-4 flex items-center gap-2`}>
                    <Briefcase className="w-3.5 h-3.5" /> 工作经历
                  </h3>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="relative pl-4 border-l-2 border-gray-100">
                        <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${currentTheme.primary}`}></div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{exp.company}</h4>
                          <span className="text-[10px] font-bold text-gray-400">{exp.period}</span>
                        </div>
                        <p className={`text-xs font-bold ${currentTheme.text} mb-2`}>{exp.role}</p>
                        <ul className="space-y-1">
                          {exp.desc.map((d, j) => (
                            <li key={j} className="text-[11px] text-gray-500 leading-snug">• {d}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 教育背景 */}
                <section>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${currentTheme.text} border-b-2 border-gray-100 pb-1 mb-4 flex items-center gap-2`}>
                    <GraduationCap className="w-3.5 h-3.5" /> 教育背景
                  </h3>
                  <div className="space-y-4">
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{edu.school}</p>
                          <p className="text-[11px] text-gray-500">{edu.major} • {edu.degree}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 技能 */}
                <section>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${currentTheme.text} border-b-2 border-gray-100 pb-1 mb-4 flex items-center gap-2`}>
                    <Code className="w-3.5 h-3.5" /> 核心技能
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${currentTheme.bg} ${currentTheme.text}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* 底部 */}
              <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                  Created by Toolbox.ApexCosmos.com
                </p>
              </div>
            </div>
          ) : (
            <div className="w-[450px] aspect-[1/1.4] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
              <UserCircle className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm">生成的简历图将在这里展示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
