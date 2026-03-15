import AIArticleSummary from "@/components/tools/AIArticleSummary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 网页总结 | Toolbox",
  description: "输入文章链接，AI 帮你快速提炼核心内容与结论。",
};

export default function AISummaryPage() {
  return <AIArticleSummary />;
}
